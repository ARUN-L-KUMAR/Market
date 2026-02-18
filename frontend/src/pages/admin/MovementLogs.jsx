import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getMovements } from '../../services/adminService';
import {
    Activity,
    Package,
    RefreshCw,
    Search,
    Calendar,
    ArrowUpCircle,
    ArrowDownCircle,
    ShoppingBag,
    AlertCircle,
    XCircle,
    User as UserIcon,
    Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const MovementLogs = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ type: '', reason: '' });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchMovements();
    }, [pagination.page, filters.type, filters.reason]);

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const response = await getMovements({
                page: pagination.page,
                limit: 15,
                type: filters.type || undefined,
                reason: filters.reason || undefined
            });
            setMovements(response.data.data.movements || []);
            setPagination(prev => ({
                ...prev,
                ...response.data.data.pagination
            }));
        } catch (error) {
            console.error('Error fetching movement logs:', error);
            toast.error('Failed to load movement logs');
        } finally {
            setLoading(false);
        }
    };

    const getReasonIcon = (reason) => {
        switch (reason) {
            case 'restock': return <ArrowUpCircle className="h-4 w-4 text-emerald-500" />;
            case 'sale': return <ShoppingBag className="h-4 w-4 text-blue-500" />;
            case 'adjustment': return <Activity className="h-4 w-4 text-amber-500" />;
            case 'cancellation': return <RefreshCw className="h-4 w-4 text-indigo-500" />;
            case 'return': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'waste': return <AlertCircle className="h-4 w-4 text-red-600" />;
            default: return <Package className="h-4 w-4 text-slate-400" />;
        }
    };

    const filteredMovements = movements.filter(m =>
        m.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && movements.length === 0) {
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
                            <Activity className="h-6 w-6 text-indigo-600" />
                            Inventory Movement Logs
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Master audit trail of every stock change in the system.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase tracking-wider"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Movement Type</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                    >
                                        <option value="">All Types</option>
                                        <option value="in">Inbound (Stock Added)</option>
                                        <option value="out">Outbound (Stock Removed)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                                    <select
                                        value={filters.reason}
                                        onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                    >
                                        <option value="">All Reasons</option>
                                        <option value="sale">Sales</option>
                                        <option value="restock">Restock</option>
                                        <option value="adjustment">Manual Adjustment</option>
                                        <option value="cancellation">Order Cancellations</option>
                                        <option value="return">Customer Returns</option>
                                        <option value="waste">Waste/Damage</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{pagination.total} Total Events</span>
                        <button
                            onClick={fetchMovements}
                            className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50/30">
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4 text-center">Qty</th>
                                    <th className="px-6 py-4 text-center">Result</th>
                                    <th className="px-6 py-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMovements.map((move) => (
                                    <motion.tr
                                        layout
                                        key={move._id}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">{format(new Date(move.createdAt), 'MMM dd, yyyy')}</span>
                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">{format(new Date(move.createdAt), 'HH:mm:ss')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                                    {move.product?.images?.[0]?.url ? (
                                                        <img src={move.product.images[0].url} alt={move.product.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Package className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="max-w-[150px]">
                                                    <p className="text-[11px] font-bold text-slate-900 line-clamp-1">{move.product?.title || 'System Product'}</p>
                                                    <p className="text-[9px] font-black text-slate-400 tracking-wider mt-0.5">{move.product?.sku || 'UNKNOWN'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getReasonIcon(move.reason)}
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{move.reason}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`text-xs font-black ${move.type === 'in' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {move.type === 'in' ? '+' : '-'}{move.quantity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-slate-900">{move.currentStock}</span>
                                                <span className="text-[8px] font-black text-slate-300 uppercase mt-0.5 italic">Total</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] font-medium text-slate-500 line-clamp-1 italic max-w-[200px]">
                                                {move.notes || '--'}
                                            </p>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredMovements.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                            <Activity className="h-10 w-10 mb-4 opacity-20" />
                            <p className="font-bold text-slate-900">No logs found</p>
                            <p className="text-xs">Adjust your search or filters to see movement data.</p>
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

export default MovementLogs;
