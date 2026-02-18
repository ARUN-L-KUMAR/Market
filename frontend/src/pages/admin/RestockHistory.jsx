import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getRestockHistory } from '../../services/adminService';
import {
    History,
    Package,
    RefreshCw,
    Search,
    Calendar,
    User as UserIcon,
    ArrowUpCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const RestockHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, [pagination.page]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await getRestockHistory({
                page: pagination.page,
                limit: 10
            });
            setHistory(response.data.data.history || []);
            setPagination(prev => ({
                ...prev,
                ...response.data.data.pagination
            }));
        } catch (error) {
            console.error('Error fetching restock history:', error);
            toast.error('Failed to load restock history');
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item =>
        item.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && history.length === 0) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <History className="h-6 w-6 text-indigo-500" />
                            Restock History
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Audit log of all manual product replenishment activities.</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by product or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{pagination.total} Total Records</span>
                        <button
                            onClick={fetchHistory}
                            className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] bg-slate-50/30">
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Product Info</th>
                                    <th className="px-6 py-4 text-center">Added</th>
                                    <th className="px-6 py-4 text-center">New Stock</th>
                                    <th className="px-6 py-4">Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredHistory.map((item) => (
                                    <motion.tr
                                        layout
                                        key={item._id}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 text-sm font-bold text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden font-bold text-slate-400">
                                                    {item.product?.images?.[0]?.url ? (
                                                        <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.product?.title || 'Unknown Product'}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.product?.sku || 'NO-SKU'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-emerald-600 font-black text-sm">
                                                <ArrowUpCircle className="h-4 w-4" />
                                                +{item.quantity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                                            {item.currentStock}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 border border-white">
                                                    <UserIcon className="h-3 w-3" />
                                                </div>
                                                {item.performedBy?.name || 'System'}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredHistory.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                                <History className="h-8 w-8" />
                            </div>
                            <p className="font-bold text-slate-900">No History Yet</p>
                            <p className="text-sm">Restock events will appear here once you replenish stock.</p>
                        </div>
                    )}

                    {pagination.pages > 1 && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center gap-2">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pagination.page === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default RestockHistory;
