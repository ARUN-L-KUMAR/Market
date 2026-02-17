import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import apiClient from '../../services/api';
import { getProducts, updateProduct } from '../../services/adminService';
import {
    Package,
    AlertTriangle,
    ArrowUp,
    ArrowDown,
    CheckCircle2,
    RefreshCw,
    Search,
    Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import CurrencyPrice from '../../components/CurrencyPrice';

const StockManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, low, out

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts({ limit: 100 });
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        try {
            await updateProduct(id, { stock: newStock });
            setProducts(products.map(p => p._id === id ? { ...p, stock: newStock } : p));
            toast.success('Stock updated');
        } catch (error) {
            toast.error('Failed to update stock');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        if (filter === 'low') return matchesSearch && p.stock <= (p.lowStockThreshold || 10) && p.stock > 0;
        if (filter === 'out') return matchesSearch && p.stock <= 0;
        return matchesSearch;
    });

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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                        <p className="text-sm text-slate-500 mt-1">Monitor stock levels and manage product availability.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search SKU or Title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none w-64 shadow-sm"
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none shadow-sm"
                        >
                            <option value="all">All Inventory</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">SKU</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Current Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map((p) => {
                                const isLow = p.stock <= (p.lowStockThreshold || 10) && p.stock > 0;
                                const isOut = p.stock <= 0;

                                return (
                                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                                    {p.images?.[0]?.url && <img src={p.images[0].url} className="w-full h-full object-cover" />}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                                            {p.sku}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            <CurrencyPrice price={p.price} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-black ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                    {p.stock}
                                                </span>
                                                {isOut && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded-full uppercase tracking-widest border border-red-100">Out</span>}
                                                {isLow && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded-full uppercase tracking-widest border border-amber-100">Low</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                                    <button
                                                        onClick={() => handleUpdateStock(p._id, Math.max(0, p.stock - 1))}
                                                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border-r border-slate-200"
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStock(p._id, p.stock + 1)}
                                                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600"
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <div className="py-20 text-center text-slate-500 text-sm">
                            No products found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default StockManagement;
