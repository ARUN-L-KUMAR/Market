import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300"
      >
        Previous
      </button>
      
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded bg-blue-500 text-white disabled:bg-gray-300"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
