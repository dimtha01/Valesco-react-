import * as XLSX from "xlsx-js-style"
import showNotification from "../utils/utils"

/**
 * Componente para exportar datos a Excel con estilos
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.data - Datos a exportar
 * @param {string} options.fileName - Nombre del archivo (sin extensión)
 * @param {string} options.sheetName - Nombre de la hoja de cálculo
 * @param {string} options.title - Título para la hoja (opcional)
 * @param {Array} options.headers - Encabezados de columna
 * @param {Array} options.columnWidths - Anchos de columna
 * @param {boolean} options.showNotification - Mostrar notificación al completar
 * @param {Function} options.formatData - Función para formatear datos antes de exportar
 * @param {Array} options.additionalSheets - Hojas adicionales para añadir al libro
 * @returns {Function} - Función para ejecutar la exportación
 */
const ExcelExport = ({
  data = [],
  fileName = "export",
  sheetName = "Datos",
  title = "",
  headers = [],
  columnWidths = [],
  showNotification: shouldShowNotification = true,
  formatData = null,
  additionalSheets = [],
}) => {
  // Función para sanitizar nombres de hojas para Excel (máximo 31 caracteres, sin caracteres especiales)
  const safeSheetName = (name) => {
    if (!name) return "Sheet1"

    // Eliminar caracteres inválidos para nombres de hojas en Excel
    let safeName = name.replace(/[/\\?*[\]]/g, "")

    // Eliminar acentos y caracteres especiales
    safeName = safeName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    // Truncar a 31 caracteres (límite de Excel)
    return safeName.substring(0, 31)
  }

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (data.length === 0) {
      if (shouldShowNotification && typeof showNotification === "function") {
        showNotification("warning", "Sin datos", "No hay datos disponibles para exportar.")
      }
      return
    }

    try {
      // Preparar los datos para la exportación
      let worksheetData = []

      // Agregar título si existe
      if (title) {
        worksheetData.push([
          {
            v: title,
            s: {
              font: { bold: true, color: { rgb: "FF0000" }, sz: 14 },
              alignment: { horizontal: "center", vertical: "center" },
            },
          },
        ])
        worksheetData.push([""])
      }

      // Agregar encabezados con estilo
      if (headers.length > 0) {
        const styledHeaders = headers.map((header) => ({
          v: header,
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        }))
        worksheetData.push(styledHeaders)
      }

      // Formatear y agregar datos
      if (typeof formatData === "function") {
        // Usar la función personalizada para formatear datos
        const formattedData = formatData(data)
        worksheetData = [...worksheetData, ...formattedData]
      } else {
        // Formateo predeterminado con bordes y centrado
        const formattedData = data.map((row) => {
          return Array.isArray(row)
            ? row.map((cell) => ({
              v: cell,
              s: {
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin" },
                  bottom: { style: "thin" },
                  left: { style: "thin" },
                  right: { style: "thin" },
                },
              },
            }))
            : Object.values(row).map((cell) => ({
              v: cell,
              s: {
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin" },
                  bottom: { style: "thin" },
                  left: { style: "thin" },
                  right: { style: "thin" },
                },
              },
            }))
        })
        worksheetData = [...worksheetData, ...formattedData]
      }

      // Crear hoja de trabajo
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      // Configurar anchos de columna si se proporcionan
      if (columnWidths.length > 0) {
        worksheet["!cols"] = columnWidths.map((width) => ({ wch: width }))
      }

      // Combinar celdas para el título si existe
      if (title) {
        const lastCol = Math.max(headers.length - 1, 0)
        worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } }]
      }

      // Ajustar alturas de fila para título y encabezados
      if (title) {
        worksheet["!rows"] = [
          { hpt: 30 }, // Altura del título
          { hpt: 15 }, // Altura de la fila vacía
          { hpt: 25 }, // Altura de los encabezados
        ]
      } else if (headers.length > 0) {
        worksheet["!rows"] = [{ hpt: 25 }] // Solo altura de encabezados
      }

      // Crear libro de trabajo y añadir la hoja principal
      const workbook = XLSX.utils.book_new()

      // Aplicar nombre seguro a la hoja principal
      const safeMainSheetName = safeSheetName(sheetName)
      console.log("Sheet name sanitized:", sheetName, "->", safeMainSheetName)

      XLSX.utils.book_append_sheet(workbook, worksheet, safeMainSheetName)

      // Añadir hojas adicionales si existen
      if (additionalSheets && additionalSheets.length > 0) {
        additionalSheets.forEach((sheet) => {
          if (sheet.data && sheet.name) {
            const additionalWorksheet = XLSX.utils.aoa_to_sheet(sheet.data)

            // Aplicar configuraciones adicionales si existen
            if (sheet.cols) {
              additionalWorksheet["!cols"] = sheet.cols
            }

            if (sheet.merges) {
              additionalWorksheet["!merges"] = sheet.merges
            }

            if (sheet.rows) {
              additionalWorksheet["!rows"] = sheet.rows
            }

            // Aplicar nombre seguro a la hoja adicional
            const safeAdditionalSheetName = safeSheetName(sheet.name)
            console.log("Additional sheet name sanitized:", sheet.name, "->", safeAdditionalSheetName)

            XLSX.utils.book_append_sheet(workbook, additionalWorksheet, safeAdditionalSheetName)
          }
        })
      }

      // Exportar el archivo
      XLSX.writeFile(workbook, `${fileName}.xlsx`)

      // Mostrar notificación de éxito si está habilitado
      if (shouldShowNotification && typeof showNotification === "function") {
        showNotification("success", "Éxito", "Los datos han sido exportados exitosamente.")
      }

      return true
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      if (shouldShowNotification && typeof showNotification === "function") {
        showNotification("error", "Error", "Ocurrió un problema al exportar los datos.")
      }
      return false
    }
  }

  return exportToExcel
}

export default ExcelExport
