import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getBrands as fetchBrandsApi, createBrand, deleteBrand as deleteBrandApi, uploadProductImage } from '../../services/adminService';
import {
    Award,
    Search,
    Plus,
    MoreVertical,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    Package,
    X,
    Upload,
    Check
} from 'lucide-react';
import { toast } from 'react-toastify';

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBrand, setNewBrand] = useState({ name: '', website: '', description: '', status: 'Active' });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchBrandsData();
    }, []);

    const fetchBrandsData = async () => {
        try {
            setLoading(true);
            const response = await fetchBrandsApi();
            setBrands(response.data.brands || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brand registry');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'].includes(file.type)) {
            toast.error('Please select a PNG, SVG, JPEG, or WebP image');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSaveBrand = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            let logoUrl = '';
            if (logoPreview) {
                const uploadRes = await uploadProductImage(logoPreview);
                logoUrl = uploadRes.data.image.url;
            }
            await createBrand({ ...newBrand, logo: logoUrl });
            toast.success(`Brand "${newBrand.name}" registered successfully`);
            setIsModalOpen(false);
            setNewBrand({ name: '', website: '', description: '', status: 'Active' });
            setLogoFile(null);
            setLogoPreview(null);
            fetchBrandsData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register brand');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteBrand = async (id, name) => {
        if (!window.confirm(`Remove brand "${name}" from the registry?`)) return;
        try {
            await deleteBrandApi(id);
            toast.warning(`Brand "${name}" removed`);
            fetchBrandsData();
        } catch (error) {
            toast.error('Failed to delete brand');
        }
    };

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalProducts = brands.reduce((s, b) => s + (b.productCount || 0), 0);
    const totalStock = brands.reduce((s, b) => s + (b.totalStock || 0), 0);

    if (loading) {
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
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">
                            <ShieldCheck className="h-3 w-3" />
                            Brand Ecosystem
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Registry
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full border border-slate-200 uppercase tracking-widest mt-1">
                                {brands.length} Total
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by brand name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center transform active:scale-95"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Growth</div>
                            <div className="text-2xl font-black text-slate-900">+12% <span className="text-xs font-bold text-emerald-500 ml-1">Expected</span></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <Award className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certified Brands</div>
                            <div className="text-2xl font-black text-slate-900">{brands.length} <span className="text-xs font-bold text-slate-400 ml-1">Listed</span></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Package className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Coverage</div>
                            <div className="text-2xl font-black text-slate-900">98.4% <span className="text-xs font-bold text-emerald-500 ml-1">Target</span></div>
                        </div>
                    </div>
                </div>

                {/* Brands Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBrands.map((brand) => (
                        <div key={brand._id} className="group bg-white p-2 rounded-[2.5rem] border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
                            <div className="bg-slate-50 rounded-[2rem] p-6 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
                                        {brand.logo ? (
                                            <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <span className="text-2xl font-black text-indigo-600">{brand.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteBrand(brand._id, brand.name)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete brand"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight h-14 line-clamp-2 leading-tight">
                                        {brand.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${brand.status === 'Active' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}>
                                            {brand.status}
                                        </span>
                                        {brand.description && <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{brand.description}</span>}
                                    </div>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span>Inventory Distribution</span>
                                        <span className="text-slate-900">{brand.productCount || 0} SKUs</span>
                                    </div>
                                    <div className="w-full bg-white h-2 rounded-full overflow-hidden p-0.5 border border-slate-100">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${totalProducts > 0 ? Math.min(100, ((brand.productCount || 0) / totalProducts) * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="pt-4 flex items-center justify-between">
                                        <div className="text-xs font-black text-slate-700">
                                            {brand.totalStock || 0} <span className="text-slate-400 font-bold ml-1">Units</span>
                                        </div>
                                        <button
                                            onClick={() => toast.info(`Accessing ${brand.name} digital assets...`)}
                                            className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:gap-3 transition-all"
                                        >
                                            View Assets
                                            <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Brand Card */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group h-full min-h-[340px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all transform active:scale-[0.98]"
                    >
                        <div className="w-16 h-16 bg-white rounded-[1.5rem] border border-slate-100 flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                            <Plus className="h-8 w-8" />
                        </div>
                        <div className="text-center px-6">
                            <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Register Brand</div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">Add a new partner manufacturer to the ecosystem</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Brand Registration</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Initialize manufacturer profile</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBrand} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Legal Entity Name</label>
                                    <input
                                        type="text"
                                        value={newBrand.name}
                                        onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                        required
                                        placeholder="e.g. Apex Global"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Digital Domain</label>
                                    <input
                                        type="text"
                                        value={newBrand.website}
                                        onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
                                        placeholder="apex-global.com"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Brand Manifest</label>
                                <textarea
                                    value={newBrand.description}
                                    onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                                    rows="3"
                                    placeholder="Brief architectural overview of brand identity..."
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Corporate Identity (Logo)</label>
                                <div className="flex items-center gap-6">
                                    <input
                                        type="file"
                                        id="brand-logo-upload"
                                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                        onChange={handleLogoSelect}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="brand-logo-upload"
                                        className="w-20 h-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-400 transition-all cursor-pointer overflow-hidden"
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6" />
                                                <span className="text-[8px] font-black uppercase tracking-widest mt-1">PNG/SVG</span>
                                            </>
                                        )}
                                    </label>
                                    <div className="space-y-1">
                                        <div className="text-xs font-black text-slate-700">
                                            {logoFile ? logoFile.name : 'Optimal Resolution'}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB · Ready to upload` : '512x512px with transparent background for adaptive themes.'}
                                        </p>
                                        {logoPreview && (
                                            <button
                                                type="button"
                                                onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-all"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-8 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Finalize Protocol
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Brands;
