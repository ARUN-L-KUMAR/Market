import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getLowStock, updateProduct } from '../../services/adminService';
import {
    AlertTriangle,
    ArrowUp,
    Package,
    RefreshCw,
    Search,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import CurrencyPrice from '../../components/CurrencyPrice';
import { motion } from 'framer-motion';

const LowStock = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLowStock();
    }, []);

    const fetchLowStock = async () => {
        try {
            setLoading(true);
            const response = await getLowStock();
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching low stock:', error);
            toast.error('Failed to load low stock alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickRestock = async (id, currentStock) => {
        try {
            const newStock = currentStock + 20;
            await updateProduct(id, { stock: newStock });
            setProducts(products.map(p => p._id === id ? { ...p, stock: newStock } : p));
            toast.success('Stock replenished (+20)');
        } catch (error) {
            toast.error('Failed to update stock');
        }
    };

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && products.length === 0) {
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
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                            Inventory Alerts
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Products currently at or below their low-stock threshold.</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by product or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{filteredProducts.length} Critical Alerts</span>
                        <button
                            onClick={fetchLowStock}
                            className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] bg-slate-50/30">
                                    <th className="px-6 py-4">Product Details</th>
                                    <th className="px-6 py-4 text-center">Current Stock</th>
                                    <th className="px-6 py-4 text-center">Threshold</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4 text-right">Quick Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((p) => (
                                    <motion.tr
                                        layout
                                        key={p._id}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden shadow-inner">
                                                    {p.images?.[0]?.url ? (
                                                        <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</p>
                                                    <p className="text-[10px] font-black text-slate-400 tracking-widest mt-0.5">{p.sku || 'NO-SKU'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 font-black text-sm border border-red-100">
                                                {p.stock}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-400">
                                            {p.lowStockThreshold || 10}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                                {p.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleQuickRestock(p._id, p.stock)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-200 active:scale-95"
                                            >
                                                <ArrowUp className="h-3.5 w-3.5" />
                                                Restock +20
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
                                <Package className="h-8 w-8" />
                            </div>
                            <p className="font-bold text-slate-900">All clear!</p>
                            <p className="text-sm">No products are currently low on stock.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-indigo-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/20 overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">Automated Procurement</h2>
                        <p className="text-indigo-100 text-sm max-w-md">Enable smart automated restocking to never run out of your best-selling items. Connect with your suppliers today.</p>
                        <button
                            onClick={() => navigate('/admin/settings#automation')}
                            className="mt-6 px-6 py-2.5 bg-white text-indigo-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all"
                        >
                            Configure Automation
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl" />
                </div>
            </div>
        </AdminLayout>
    );
};

export default LowStock;
