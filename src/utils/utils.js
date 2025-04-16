import Swal from "sweetalert2";

export function formatearFechaUTC(fechaISO) {
  const fecha = new Date(fechaISO);

  // Extraer los componentes de la fecha en UTC
  const anio = fecha.getUTCFullYear();
  const mes = fecha.getUTCMonth() + 1; // Los meses en JavaScript son base 0, por eso sumamos 1
  const dia = fecha.getUTCDate();

  // Opcional: Formatear con ceros iniciales para el día y el mes
  const diaFormateado = dia.toString().padStart(2, '0');
  const mesFormateado = mes.toString().padStart(2, '0');

  // Retornar la fecha en el formato deseado (personalizable)
  return `${diaFormateado}/${mesFormateado}/${anio}`; // Ejemplo: "19/02/2025"
}


const showNotification = (type, title, text = "") => {
  const swalOptions = {
    icon: type,
    title: title,
    text: text,
    confirmButtonText: "Aceptar",
    customClass: {
      confirmButton: "btn btn-primary", // Clase personalizada para el botón
    },
    buttonsStyling: false, // Desactivar estilos predeterminados de SweetAlert2
  };

  Swal.fire(swalOptions);
};

export default showNotification;


export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "0.00 M"

  // Convertir a número si es string
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  // Si es mayor o igual a 1 millón, mostrar en millones (MM)
  if (Math.abs(numAmount) >= 1000000) {
    const inMillions = numAmount / 1000000
    return `${inMillions.toFixed(2)} MM`
  }
  // Si es menor a 1 millón, mostrar en miles (M)
  else {
    const inThousands = numAmount / 1000
    return `${inThousands.toFixed(2)} M`
  }
}
export const decimalAEntero = (numeroDecimal) => {
  return Math.round(numeroDecimal);
}
export const formatMontoConSeparador = (amount) => {
  if (amount === null || amount === undefined) return "0,00";

  // Convierte el valor a número
  const numericValue = Number(amount);

  // Verifica si el valor es un número válido
  if (isNaN(numericValue)) return "0,00";

  // Formatea con el estilo es-ES (puntos para miles, coma para decimales)
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true, // Esto asegura que se use el separador de miles
  }).format(numericValue);
};


export const UrlApi = "https://apiprueba-production-2ab7.up.railway.app"


