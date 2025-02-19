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