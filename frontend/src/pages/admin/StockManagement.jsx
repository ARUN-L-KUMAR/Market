import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProducts, updateProduct } from '../../services/adminService';
import {
    Package,
    AlertTriangle,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Search,
    Filter,
    ArrowRight,
    TrendingDown,
    Activity,
    Box
} from 'lucide-react';
import { toast } from 'react-toastify';
import CurrencyPrice from '../../components/CurrencyPrice';

const StockManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, low, out

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await getProducts({ limit: 100 });
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to sync master ledger');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (id, newStock) => {
        const originalProducts = [...products];
        try {
            // Optimistic update
            setProducts(products.map(p => p._id === id ? { ...p, stock: newStock } : p));
            await updateProduct(id, { stock: newStock });
            toast.success(`Inventory synchronized: ${newStock} units recorded.`);
        } catch (error) {
            setProducts(originalProducts);
            toast.error('Database conflict: Synchronization failed.');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        if (filter === 'low') return matchesSearch && p.stock <= (p.lowStockThreshold || 10) && p.stock > 0;
        if (filter === 'out') return matchesSearch && p.stock <= 0;
        return matchesSearch;
    });

    const stats = {
        total: products.length,
        lowStock: products.filter(p => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0).length,
        outOfStock: products.filter(p => p.stock <= 0).length,
        totalValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">
                            <Activity className="h-3 w-3" />
                            Live Inventory Stream
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Inventory Control Center
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest mt-1">
                                Master Ledger
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by SKU or Asset Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            />
                        </div>
                        <button
                            onClick={fetchInventory}
                            className="p-3.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl shadow-sm transition-all transform active:rotate-180"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <Box className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Capacity</div>
                            <div className="text-2xl font-black text-slate-900">{stats.total} <span className="text-xs font-bold text-slate-400 ml-1">Listed</span></div>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200 flex items-center gap-5 border border-slate-800">
                        <div className="w-14 h-14 bg-white/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-white/10">
                            <TrendingDown className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Asset Valuation</div>
                            <div className="text-2xl font-black text-white"><CurrencyPrice price={stats.totalValue} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Low Stock Alerts</div>
                            <div className="text-2xl font-black text-amber-600">{stats.lowStock} <span className="text-xs font-bold text-amber-400 ml-1">Critical</span></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Depleted Units</div>
                            <div className="text-2xl font-black text-red-600">{stats.outOfStock} <span className="text-xs font-bold text-red-400 ml-1">Action Needed</span></div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8 bg-slate-100 p-2 rounded-3xl border border-slate-200/50">
                    <div className="flex items-center gap-1">
                        {[
                            { id: 'all', label: 'Global Ledger' },
                            { id: 'low', label: 'Monitor Alerts' },
                            { id: 'out', label: 'Depletion Logs' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setFilter(t.id)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => toast.info('Advanced filter matrix expansion coming soon.')}
                        className="flex items-center gap-2 px-6 py-3 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:bg-white rounded-2xl transition-all mr-2"
                    >
                        <Filter className="h-4 w-4" />
                        Refine Matrix
                    </button>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[40%]">Asset Integrity</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listing ID</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Valuation</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Health Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map((p) => {
                                const isLow = p.stock <= (p.lowStockThreshold || 10) && p.stock > 0;
                                const isOut = p.stock <= 0;

                                return (
                                    <tr key={p._id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{p.title}</div>
                                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{p.category?.name || 'Unmapped'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[10px] font-mono font-black text-slate-400 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg group-hover:bg-white group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                                                {p.sku || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-black text-slate-700">
                                                <CurrencyPrice price={p.price} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${isOut ? 'bg-red-500 animate-pulse' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                <div className={`text-[10px] font-black uppercase tracking-widest ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                    {isOut ? 'Depleted' : isLow ? 'Monitor' : 'Stable'}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs font-black text-slate-900 flex items-center gap-2">
                                                {p.stock} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Units Stored</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleUpdateStock(p._id, Math.max(0, p.stock - 1))}
                                                    className="w-10 h-10 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all transform active:scale-90"
                                                >
                                                    <ArrowDown className="h-4 w-4" />
                                                </button>
                                                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-900 group-hover:bg-white transition-all">
                                                    {p.stock}
                                                </div>
                                                <button
                                                    onClick={() => handleUpdateStock(p._id, p.stock + 1)}
                                                    className="w-10 h-10 border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 rounded-xl flex items-center justify-center transition-all transform active:scale-90"
                                                >
                                                    <ArrowUp className="h-4 w-4" />
                                                </button>
                                                <div className="w-px h-6 bg-slate-200 mx-2" />
                                                <button
                                                    onClick={() => toast.info(`Relocating asset #${p.sku || p._id} across warehouse regions...`)}
                                                    className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all transform active:scale-95"
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredProducts.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Search className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">No Matching Assets Found</h3>
                            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest px-8">Adjust your synchronization filters or refinement matrix</p>
                        </div>
                    )}

                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            End of Master Ledger stream
                        </div>
                        <button
                            onClick={() => toast.info('Accessing architectural movement logs...')}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:gap-3 transition-all"
                        >
                            Movement History
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default StockManagement;
