import React from 'react';

const DashboardCard = ({ title, value, icon, change }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider text-[11px]">{title}</h3>
        <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
          {icon}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-2xl font-semibold text-slate-900 mb-1">
          {value}
        </span>

        {change !== undefined && (
          <div className="flex items-center">
            {isPositive && (
              <span className="text-emerald-700 flex items-center text-xs font-medium bg-emerald-100 px-2 py-0.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {Math.abs(change)}%
              </span>
            )}

            {isNegative && (
              <span className="text-red-700 flex items-center text-xs font-medium bg-red-100 px-2 py-0.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {Math.abs(change)}%
              </span>
            )}

            {!isPositive && !isNegative && change !== undefined && (
              <span className="text-slate-500 text-xs bg-slate-100 px-2 py-0.5 rounded-md">No change</span>
            )}

            <span className="text-slate-400 text-xs ml-2">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;