import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getProducts, updateProduct, deleteProduct } from '../../services/adminService';
import {
    FileEdit,
    Trash2,
    Eye,
    CheckCircle,
    Search,
    AlertCircle,
    Clock,
    MoreHorizontal,
    ArrowUpRight,
    Power
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import CurrencyPrice from '../../components/CurrencyPrice';

const DraftProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            setLoading(true);
            // Assuming the API supports filtering by isActive
            const response = await getProducts({ isActive: false, limit: 100 });
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching drafts:', error);
            toast.error('Failed to load draft inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await updateProduct(id, { isActive: !currentStatus });
            toast.success(`Product ${!currentStatus ? 'activated' : 'moved to drafts'}`);
            fetchDrafts();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Permanent deletion cannot be undone. Proceed?')) {
            try {
                await deleteProduct(id);
                toast.success('Asset purged from registry');
                fetchDrafts();
            } catch (error) {
                toast.error('Deletion failed');
            }
        }
    };

    const filteredDrafts = products.filter(p =>
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
            <div className="p-6 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">
                            <Clock className="h-3 w-3" />
                            Awaiting Publication
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Draft Ledger
                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100 uppercase tracking-widest mt-1">
                                {products.length} Staged
                            </span>
                        </h1>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter drafts by identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none shadow-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                        />
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-slate-900 rounded-[2rem] p-6 mb-8 flex items-center gap-5 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-full bg-amber-500/10 skew-x-[-20deg] translate-x-10"></div>
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Publication Governance</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Products in this ledger are hidden from the storefront. Ensure SEO titles and pricing are finalized before manual deployment.</p>
                    </div>
                </div>

                {/* Drafts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDrafts.map((p) => (
                        <div key={p._id} className="group bg-white rounded-[2.5rem] border border-slate-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500 overflow-hidden flex flex-col">
                            <div className="p-2 flex-1">
                                <div className="bg-slate-50 rounded-[2rem] p-6 h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500">
                                            {p.images?.[0]?.url ? (
                                                <img src={p.images[0].url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-xl">
                                                    ?
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/admin/products/${p._id}/edit`}
                                                className="p-2.5 bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-indigo-600 rounded-xl transition-all"
                                            >
                                                <FileEdit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p._id)}
                                                className="p-2.5 bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-red-500 rounded-xl transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-black uppercase tracking-widest rounded-full">
                                                {p.category?.name || 'Uncategorized'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">• SKU: {p.sku || 'N/A'}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-2 min-h-[3.5rem] leading-tight">
                                            {p.title}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200/50">
                                        <div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Price</div>
                                            <div className="text-lg font-black text-slate-900">
                                                <CurrencyPrice price={p.price} />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Staged Units</div>
                                            <div className="text-lg font-black text-slate-900">{p.stock}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-white border-t border-slate-50 flex items-center justify-between">
                                <button className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50">
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(p._id, p.isActive)}
                                    className="px-6 py-2.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                                >
                                    <Power className="h-3.5 w-3.5" />
                                    Go Live
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredDrafts.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle className="h-10 w-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Ledger Is Clear</h3>
                            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">All catalog assets are currently active in production</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default DraftProducts;
