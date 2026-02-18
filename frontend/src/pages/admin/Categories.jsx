import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import CurrencyPrice from '../../components/CurrencyPrice';
import apiClient from '../../services/api';
import { getProducts, updateProduct } from '../../services/adminService';
import {
    Plus,
    Edit2,
    Trash2,
    Folder,
    ChevronRight,
    Check,
    X,
    AlertCircle,
    LayoutGrid,
    Search,
    Database,
    MoreVertical,
    CheckCircle2,
    Settings2,
    FolderPlus,
    Activity,
    Layers,
    ArrowRight,
    SearchCode,
    PackageSearch,
    Box,
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', description: '', parentCategory: null });
    const [isEditing, setIsEditing] = useState(false);

    // Workspace State
    const [unmappedProducts, setUnmappedProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [targetCategoryId, setTargetCategoryId] = useState('');
    const [workspaceLoading, setWorkspaceLoading] = useState(false);

    // Category Products State
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/categories?includeInactive=true');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load category architecture');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnmappedProducts = async () => {
        try {
            setWorkspaceLoading(true);
            const response = await getProducts({ limit: 1000 });
            const allProducts = response.data.products || [];
            // Products without category or category name "General" (if any)
            const unmapped = allProducts.filter(p => !p.category || !p.category._id);
            setUnmappedProducts(unmapped);
        } catch (error) {
            toast.error('Failed to scan for unmapped assets');
        } finally {
            setWorkspaceLoading(false);
        }
    };

    const toggleCategoryProducts = async (categoryId, categoryName) => {
        if (expandedCategory === categoryId) {
            setExpandedCategory(null);
            setCategoryProducts([]);
            return;
        }
        try {
            setExpandedCategory(categoryId);
            setProductsLoading(true);
            setCategoryProducts([]);
            const response = await getProducts({ limit: 100, category: categoryId });
            const allProducts = response.data.data?.products || response.data.products || [];
            setCategoryProducts(allProducts);
        } catch (error) {
            console.error('Error fetching category products:', error);
            toast.error('Failed to load products for this category');
        } finally {
            setProductsLoading(false);
        }
    };

    const handleBulkAssign = async () => {
        if (!targetCategoryId || selectedProductIds.length === 0) {
            toast.warning('Please select assets and a target nebula node.');
            return;
        }

        const targetCat = categories.find(c => c._id === targetCategoryId);
        toast.info(`Protocol Initiated: Migrating ${selectedProductIds.length} assets to "${targetCat.name}"...`);

        try {
            setWorkspaceLoading(true);
            // Sequentially mapping to avoid race conditions on a small dev DB
            for (const id of selectedProductIds) {
                await updateProduct(id, { category: targetCategoryId });
            }
            toast.success(`Migration Complete: Catalog synchronized with ${targetCat.name}.`);
            setSelectedProductIds([]);
            fetchUnmappedProducts();
        } catch (error) {
            toast.error('Migration Protocol Interrupted: Batch update failure.');
        } finally {
            setWorkspaceLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiClient.put(`/api/categories/${currentCategory._id}`, currentCategory);
                toast.success(`Protocol Update: "${currentCategory.name}" reconfigured.`);
            } else {
                await apiClient.post('/api/categories', currentCategory);
                toast.success(`Asset Initialized: "${currentCategory.name}" committed to registry.`);
            }
            setIsModalOpen(false);
            setCurrentCategory({ name: '', description: '', parentCategory: null });
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'Failed to authorize category save');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Purge "${name}" and all associated sub-assets from the registry?`)) {
            try {
                await apiClient.delete(`/api/categories/${id}`);
                toast.warning(`Registry Purged: "${name}" and subcategories decentralized.`);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to execute purge protocol');
            }
        }
    };

    const seedSampleData = async () => {
        toast.info('Initializing sample data injection protocol...');
        try {
            const samples = [
                { name: 'Electronics', description: 'Core digital hardware and circuitry.' },
                { name: 'Apparel', description: 'Wearable infrastructure and textile assets.' },
                { name: 'Home & Living', description: 'Residential environment optimizations.' }
            ];

            for (const sample of samples) {
                const res = await apiClient.post('/api/categories', sample);
                if (sample.name === 'Electronics') {
                    await apiClient.post('/api/categories', {
                        name: 'Smartphones',
                        description: 'Mobile compute nodes.',
                        parentCategory: res.data._id
                    });
                }
            }
            toast.success('Sample architecture successfully deployed.');
            fetchCategories();
        } catch (error) {
            toast.error('Seed protocol interrupted: Duplicate entries or API error.');
        }
    };

    const openModal = (category = { name: '', description: '', parentCategory: null }) => {
        setCurrentCategory(category);
        setIsEditing(!!category._id);
        setIsModalOpen(true);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const parentCategories = filteredCategories.filter(c => !c.parentCategory);

    if (loading && categories.length === 0) {
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">
                            <Settings2 className="h-3 w-3" />
                            Catalog Architecture
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Category Registry
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full border border-slate-200 uppercase tracking-widest mt-1">
                                {categories.length} Total Nodes
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => {
                                setIsWorkspaceOpen(true);
                                fetchUnmappedProducts();
                            }}
                            className="px-6 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2 transform active:scale-95"
                        >
                            <Layers className="h-4 w-4" />
                            Migration Workspace
                        </button>
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter Registry..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="px-6 py-3.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2 transform active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            Build Category
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-8">
                    {parentCategories.map((parent) => (
                        <div key={parent._id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group/card hover:border-indigo-200 transition-all duration-500">
                            <div className="p-8 flex items-center justify-between bg-slate-50/50 border-b border-slate-100 group-hover/card:bg-indigo-50/30 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500">
                                        <Folder className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3
                                            onClick={() => toggleCategoryProducts(parent._id, parent.name)}
                                            className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 cursor-pointer hover:text-indigo-600 transition-colors"
                                        >
                                            {parent.name}
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Node</span>
                                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedCategory === parent._id ? 'rotate-180' : ''}`} />
                                        </h3>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{parent.description || 'No Manifest recorded'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        Operational
                                    </div>
                                    <button
                                        onClick={() => openModal(parent)}
                                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(parent._id, parent.name)}
                                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
                                    <ChevronRight className="h-3 w-3 text-indigo-500" />
                                    Attached Sub-Infrastructure
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {categories.filter(sub => sub.parentCategory === parent._id).map(subcategory => (
                                        <div key={subcategory._id}
                                            onClick={() => toggleCategoryProducts(subcategory._id, subcategory.name)}
                                            className={`p-6 border rounded-[2rem] transition-all duration-500 group/item cursor-pointer ${expandedCategory === subcategory._id
                                                    ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-500/10'
                                                    : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5'
                                                }`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-indigo-500 group-hover/item:scale-110 transition-transform">
                                                    <LayoutGrid className="h-5 w-5" />
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openModal(subcategory)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subcategory._id, subcategory.name)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase">
                                                {subcategory.name}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-400 mt-2 line-clamp-2 leading-relaxed">{subcategory.description || 'Empty descriptive field'}</p>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => openModal({ name: '', description: '', parentCategory: parent._id })}
                                        className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-3 transform active:scale-95"
                                    >
                                        <FolderPlus className="h-8 w-8" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Append Sub-Node</span>
                                    </button>
                                </div>

                                {/* Category Products Panel */}
                                {expandedCategory === parent._id && (
                                    <div className="mt-6 bg-slate-50 rounded-[2rem] border border-slate-100 p-6 animate-in slide-in-from-top duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <PackageSearch className="h-3.5 w-3.5 text-indigo-500" />
                                                Products in {parent.name}
                                            </div>
                                            <Link
                                                to={`/admin/products?category=${parent.name}`}
                                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 flex items-center gap-1"
                                            >
                                                View All <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                        {productsLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-600"></div>
                                            </div>
                                        ) : categoryProducts.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Box className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                                <p className="text-xs font-bold text-slate-400">No products in this category yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {categoryProducts.map(product => (
                                                    <Link
                                                        key={product._id}
                                                        to={`/admin/products/${product._id}/edit`}
                                                        className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all group/product"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                            {product.images?.[0] ? (
                                                                <img src={product.images[0].url} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-200"><Box className="h-4 w-4" /></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-slate-900 truncate group-hover/product:text-indigo-600 transition-colors">{product.title}</div>
                                                            <div className="text-[10px] font-bold text-slate-400">SKU: {product.sku || 'N/A'}</div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="text-sm font-black text-slate-900"><CurrencyPrice price={product.price} /></div>
                                                            <div className={`text-[10px] font-bold ${product.stock <= 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                {product.stock || 0} units
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Subcategory Products Panel */}
                                {categories.filter(sub => sub.parentCategory === parent._id).some(sub => expandedCategory === sub._id) && (
                                    <div className="mt-6 bg-slate-50 rounded-[2rem] border border-slate-100 p-6 animate-in slide-in-from-top duration-300">
                                        {(() => {
                                            const activeSub = categories.find(sub => sub.parentCategory === parent._id && sub._id === expandedCategory);
                                            if (!activeSub) return null;
                                            return (
                                                <>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <PackageSearch className="h-3.5 w-3.5 text-indigo-500" />
                                                            Products in {activeSub.name}
                                                        </div>
                                                        <Link
                                                            to={`/admin/products?category=${activeSub.name}`}
                                                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 flex items-center gap-1"
                                                        >
                                                            View All <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </div>
                                                    {productsLoading ? (
                                                        <div className="flex items-center justify-center py-8">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-600"></div>
                                                        </div>
                                                    ) : categoryProducts.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <Box className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                                            <p className="text-xs font-bold text-slate-400">No products in this subcategory yet</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {categoryProducts.map(product => (
                                                                <Link
                                                                    key={product._id}
                                                                    to={`/admin/products/${product._id}/edit`}
                                                                    className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all group/product"
                                                                >
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                                        {product.images?.[0] ? (
                                                                            <img src={product.images[0].url} className="w-full h-full object-cover" alt="" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-slate-200"><Box className="h-4 w-4" /></div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-sm font-bold text-slate-900 truncate group-hover/product:text-indigo-600 transition-colors">{product.title}</div>
                                                                        <div className="text-[10px] font-bold text-slate-400">SKU: {product.sku || 'N/A'}</div>
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <div className="text-sm font-black text-slate-900"><CurrencyPrice price={product.price} /></div>
                                                                        <div className={`text-[10px] font-bold ${product.stock <= 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                            {product.stock || 0} units
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {parentCategories.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Database className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">System Registry Empty</h3>
                            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest px-8">No category architecture detected in the current ecosystem.</p>
                            <div className="mt-10 flex flex-col items-center gap-4">
                                <button
                                    onClick={() => openModal()}
                                    className="px-8 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all"
                                >
                                    Initialize First Node
                                </button>
                                <button
                                    onClick={seedSampleData}
                                    className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:text-indigo-700 flex items-center gap-2"
                                >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Inject Sample Architecture
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Categorization Workspace Modal */}
            {isWorkspaceOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Migration Workspace</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Categorizing {unmappedProducts.length} unmapped assets</p>
                            </div>
                            <button onClick={() => setIsWorkspaceOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Left: Product List */}
                            <div className="flex-1 overflow-y-auto p-8 border-r border-slate-100 bg-slate-50/30">
                                {workspaceLoading && unmappedProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Catalog...</div>
                                    </div>
                                ) : unmappedProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6" />
                                        <h4 className="text-xl font-black text-slate-900">Architecture Synced</h4>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">All products have been categorized</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2 mb-6">
                                            <button
                                                onClick={() => setSelectedProductIds(unmappedProducts.map(p => p._id))}
                                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                            >
                                                Select All Available
                                            </button>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {selectedProductIds.length} Selected
                                            </div>
                                        </div>
                                        {unmappedProducts.map(product => (
                                            <div
                                                key={product._id}
                                                onClick={() => {
                                                    if (selectedProductIds.includes(product._id)) {
                                                        setSelectedProductIds(selectedProductIds.filter(id => id !== product._id));
                                                    } else {
                                                        setSelectedProductIds([...selectedProductIds, product._id]);
                                                    }
                                                }}
                                                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedProductIds.includes(product._id)
                                                    ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-500/5'
                                                    : 'bg-white border-slate-100 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedProductIds.includes(product._id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                                                    }`}>
                                                    {selectedProductIds.includes(product._id) && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0].url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-200"><Box className="h-5 w-5" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-black text-slate-900 leading-tight">{product.title}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{product.sku || 'No SKU'} • <CurrencyPrice price={product.price} /></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Target Selection */}
                            <div className="w-full md:w-96 p-8 bg-white flex flex-col">
                                <div className="space-y-8 flex-1">
                                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                        <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                        <h4 className="text-lg font-black tracking-tight mb-2">Nexus Assignment</h4>
                                        <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest leading-relaxed">Map selected assets to the destination category cluster.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Destination Node</label>
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto px-1">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat._id}
                                                        onClick={() => setTargetCategoryId(cat._id)}
                                                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${targetCategoryId === cat._id
                                                            ? 'bg-indigo-50 border-indigo-600 text-indigo-600 ring-4 ring-indigo-500/5'
                                                            : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Folder className={`h-4 w-4 ${targetCategoryId === cat._id ? 'text-indigo-600' : 'text-slate-300'}`} />
                                                            <span className="text-xs font-black uppercase tracking-tight">{cat.name}</span>
                                                        </div>
                                                        {cat.parentCategory && <span className="text-[8px] font-black text-slate-400 uppercase">Sub</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 flex flex-col gap-4">
                                    <button
                                        onClick={handleBulkAssign}
                                        disabled={workspaceLoading || selectedProductIds.length === 0 || !targetCategoryId}
                                        className="w-full py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 transform active:scale-[0.98]"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        Commit Migration
                                    </button>
                                    <button
                                        onClick={() => setIsWorkspaceOpen(false)}
                                        className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                                    >
                                        Exit Workspace
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* General Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{isEditing ? 'Reconfigure Node' : 'Initialize Node'}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Define architecture parameters</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Logic Label</label>
                                <input
                                    type="text"
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                    required
                                    placeholder="e.g. Mobile Computing"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Manifest Details</label>
                                <textarea
                                    value={currentCategory.description}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                    rows="3"
                                    placeholder="Brief technical overview..."
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>
                            {!isEditing && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Parent Nexus (Optional)</label>
                                    <select
                                        value={currentCategory.parentCategory || ''}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, parentCategory: e.target.value || null })}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                    >
                                        <option value="">Standalone Cluster (Top Level)</option>
                                        {categories.filter(c => !c.parentCategory && c._id !== currentCategory._id).map(parent => (
                                            <option key={parent._id} value={parent._id}>{parent.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
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
                                    className="flex-1 px-8 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    {isEditing ? 'Sync Changes' : 'Initialize Asset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Categories;
