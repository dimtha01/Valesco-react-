import { useState } from "react";

const Paginador = ({ data, rowsPerPage, renderRow }) => {
  // Estado para la página actual
  const [currentPage, setCurrentPage] = useState(1);

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(data.length / rowsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  // Datos paginados
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      {/* Renderizar datos paginados */}
      {paginatedData.length === 0 ? (
        <tr>
          <td colSpan="6" className="text-center py-4 text-gray-500">
            No hay datos disponibles.
          </td>
        </tr>
      ) : (
        paginatedData.map((item, index) => renderRow(item, index))
      )}

      {/* Botones del paginador */}
      <tr>
        <td colSpan="6" className="text-center py-4">
          <div className="flex justify-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-l-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-200 text-gray-700">
              {currentPage} / {Math.ceil(data.length / rowsPerPage)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(data.length / rowsPerPage)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            >
              Siguiente
            </button>
          </div>
        </td>
      </tr>
    </>
  );
};

export default Paginador;