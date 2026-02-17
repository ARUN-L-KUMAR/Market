import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const PlaceholderAdminPage = () => {
    const location = useLocation();
    const path = location.pathname.split('/').pop().replace(/-/g, ' ');
    const title = path.charAt(0).toUpperCase() + path.slice(1);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
                <Construction className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
            <p className="text-slate-500 max-w-sm">
                This section is currently under development. We're working hard to bring you a full-featured {title.toLowerCase()} management system.
            </p>
            <button
                onClick={() => window.history.back()}
                className="mt-8 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
            >
                Go Back
            </button>
        </div>
    );
};

export default PlaceholderAdminPage;
