import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8 mt-10">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 w-10 p-0 rounded-xl"
        icon={<ChevronLeft className="w-5 h-5" />}
      />

      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all ${currentPage === page
              ? 'bg-slate-900 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            {page}
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 w-10 p-0 rounded-xl"
        icon={<ChevronRight className="w-5 h-5" />}
      />
    </div>
  );
};

export default Pagination;
