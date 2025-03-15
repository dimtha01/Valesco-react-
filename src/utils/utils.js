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
  if (amount === undefined || amount === null) return "USD 0";

  // Convertir a número si es string
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount;

  // Para números muy grandes (mil millones o más)
  if (Math.abs(numAmount) >= 1000000000) {
    const billions = (numAmount / 1000000000).toFixed(1);
    // Eliminar el .0 si es un número entero
    const formatted = billions.endsWith(".0") ? billions.slice(0, -2) : billions;
    return `USD ${formatted} MM`;
  }
  // Para millones
  else if (Math.abs(numAmount) >= 1000000) {
    const millions = (numAmount / 1000000).toFixed(1);
    // Eliminar el .0 si es un número entero
    const formatted = millions.endsWith(".0") ? millions.slice(0, -2) : millions;
    return `USD ${formatted} M`;
  }
  // Para miles
  else if (Math.abs(numAmount) >= 1000) {
    const thousands = (numAmount / 1000).toFixed(1);
    // Eliminar el .0 si es un número entero
    const formatted = thousands.endsWith(".0") ? thousands.slice(0, -2) : thousands;
    return `USD ${formatted} K`;
  }
  // Para números pequeños
  else {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  }
};


export const UrlApi = "https://apiprueba-production-2ab7.up.railway.app"


