import Swal from "sweetalert2";

export function formatearFecha(fechaISO, formato = "dd/mm/yyyy") {
  // Crear un objeto Date a partir de la fecha ISO
  const fecha = new Date(fechaISO);

  // Extraer componentes de la fecha
  const dia = fecha.getDate().toString().padStart(2, "0"); // Día con dos dígitos
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0"); // Mes (0-indexed, sumamos 1)
  const anio = fecha.getFullYear();
  const nombreMes = fecha.toLocaleString("es-ES", { month: "long" }); // Nombre del mes en español

  // Formatear según el parámetro "formato"
  switch (formato) {
    case "dd/mm/yyyy":
      return `${dia}/${mes}/${anio}`;
    case "mm/dd/yyyy":
      return `${mes}/${dia}/${anio}`;
    case "yyyy-mm-dd":
      return `${anio}-${mes}-${dia}`;
    case "nombre-mes":
      return `${dia} de ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} de ${anio}`;
    default:
      return `${dia}/${mes}/${anio}`; // Formato predeterminado
  }
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

export function formatCurrency(number, currency = "USD") {
  const formatter = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency, // Puedes cambiar a "EUR", "MXN", etc.
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(number);
}

export const UrlApi ="https://apiprueba-production-2ab7.up.railway.app"
// export const UrlApi = "http://localhost:3000"