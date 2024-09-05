import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


function DataTablePagination({ totalItems, itemsPerPage, onPageChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  };

  return (
    <div className="d-flex justify-content-center my-5">
      <nav>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ArrowBackIcon/>
            </button>
          </li>
          <li className="page-item">
            <span className="page-link">
              Page {currentPage} of {totalPages}
            </span>
          </li>
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ArrowForwardIcon />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default DataTablePagination;
