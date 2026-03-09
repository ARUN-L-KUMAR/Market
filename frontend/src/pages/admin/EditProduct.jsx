import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, updateProduct, uploadProductImage, getBrands, getVariants } from '../../services/adminService';
import apiClient from '../../services/api';
import {
    Plus,
    X,
    Upload,
    Image as ImageIcon,
    ChevronRight,
    Save,
    AlertCircle,
    Tag,
    Palette,
    DollarSign,
    Package,
    Layers,
    ArrowLeft,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import Dropdown from '../../components/ui/Dropdown';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [variants, setVariants] = useState([]);
    const [selectedVariants, setSelectedVariants] = useState({});

    const [productData, setProductData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        category: [],
        categoryName: [],
        subcategory: [],
        subcategoryName: [],
        brand: '',
        sku: '',
        price: '',
        comparePrice: '',
        costPrice: '',
        stock: '',
        lowStockThreshold: 10,
        isActive: true,
        isFeatured: false,
        images: []
    });

    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [productRes, categoriesRes, brandsRes, variantsRes] = await Promise.all([
                    getProductById(id),
                    apiClient.get('/api/categories?parent=null'),
                    getBrands(),
                    getVariants()
                ]);

                const product = productRes.data.data || productRes.data;
                setProductData({
                    ...product,
                    category: Array.isArray(product.category)
                        ? product.category.map(c => c._id || c)
                        : (product.category ? [product.category?._id || product.category] : []),
                    categoryName: Array.isArray(product.categoryName)
                        ? product.categoryName
                        : (product.categoryName ? [product.categoryName] : []),
                    subcategory: Array.isArray(product.subcategory)
                        ? product.subcategory.map(s => s._id || s)
                        : (product.subcategory ? [product.subcategory?._id || product.subcategory] : []),
                    subcategoryName: Array.isArray(product.subcategoryName)
                        ? product.subcategoryName
                        : (product.subcategoryName ? [product.subcategoryName] : []),
                    images: product.images || []
                });
                setPreviews((product.images || []).map(img => img.url));
                setCategories(categoriesRes.data);
                setBrands(brandsRes.data.brands || []);
                setVariants(variantsRes.data.variants || []);

                // Restore previously selected variants from product data
                if (product.selectedVariants) {
                    setSelectedVariants(product.selectedVariants);
                }

                // If product has categories, fetch subcategories
                const initialCats = Array.isArray(product.category)
                    ? product.category.map(c => c._id || c)
                    : (product.category ? [product.category?._id || product.category] : []);

                if (initialCats.length > 0) {
                    const subPromises = initialCats.map(id => apiClient.get(`/api/categories?parent=${id}`));
                    const responses = await Promise.all(subPromises);
                    const allSubs = responses.flatMap(r => r.data);
                    const uniqueSubs = Array.from(new Map(allSubs.map(s => [s._id, s])).values());
                    setSubcategories(uniqueSubs);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Failed to load product data');
                navigate('/admin/products');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [id, navigate]);

    const toggleVariantValue = (groupId, value) => {
        setSelectedVariants(prev => {
            const current = prev[groupId] || [];
            const exists = current.find(v => v.value === value.value);
            return {
                ...prev,
                [groupId]: exists
                    ? current.filter(v => v.value !== value.value)
                    : [...current, value]
            };
        });
    };

    const toggleCategory = async (catId, catName) => {
        setProductData(prev => {
            const currentCats = [...(prev.category || [])];
            const currentCatNames = [...(prev.categoryName || [])];

            const exists = currentCats.includes(catId);
            const newCats = exists
                ? currentCats.filter(id => id !== catId)
                : [...currentCats, catId];

            const newNames = exists
                ? currentCatNames.filter(name => name !== catName)
                : [...currentCatNames, catName];

            // Trigger subcategory fetch after state update
            fetchSubcategoriesForCategories(newCats);

            return {
                ...prev,
                category: newCats,
                categoryName: newNames,
                subcategory: [], // Reset subs on transition
                subcategoryName: []
            };
        });
    };

    const fetchSubcategoriesForCategories = async (catIds) => {
        if (catIds.length > 0) {
            try {
                const subPromises = catIds.map(id => apiClient.get(`/api/categories?parent=${id}`));
                const responses = await Promise.all(subPromises);
                const allSubs = responses.flatMap(r => r.data);
                const uniqueSubs = Array.from(new Map(allSubs.map(s => [s._id, s])).values());
                setSubcategories(uniqueSubs);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
            }
        } else {
            setSubcategories([]);
        }
    };

    const toggleSubcategory = (subId, subName) => {
        setProductData(prev => {
            const currentSubs = prev.subcategory || [];
            const exists = currentSubs.includes(subId);
            const newSubs = exists
                ? currentSubs.filter(id => id !== subId)
                : [...currentSubs, subId];

            const currentSubNames = prev.subcategoryName || [];
            const newSubNames = exists
                ? currentSubNames.filter(name => name !== subName)
                : [...currentSubNames, subName];

            return {
                ...prev,
                subcategory: newSubs,
                subcategoryName: newSubNames
            };
        });
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setSaving(true);
        const newImages = [...productData.images];
        const newPreviews = [...previews];

        for (const file of files) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise((resolve) => {
                reader.onload = async () => {
                    try {
                        const response = await uploadProductImage(reader.result);
                        if (response.data.success) {
                            const imageData = {
                                url: response.data.image.url,
                                publicId: response.data.image.publicId,
                                isPrimary: newImages.length === 0
                            };
                            newImages.push(imageData);
                            newPreviews.push(response.data.image.url);
                        }
                    } catch (error) {
                        console.error('Upload failed:', error);
                        toast.error('Image upload failed');
                    }
                    resolve();
                };
            });
        }

        setProductData({ ...productData, images: newImages });
        setPreviews(newPreviews);
        setSaving(false);
    };

    const removeImage = (index) => {
        const newImages = [...productData.images];
        const newPreviews = [...previews];
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
            newImages[0].isPrimary = true;
        }

        setProductData({ ...productData, images: newImages });
        setPreviews(newPreviews);
    };

    const setPrimary = (index) => {
        const newImages = productData.images.map((img, i) => ({
            ...img,
            isPrimary: i === index
        }));
        setProductData({ ...productData, images: newImages });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (productData.images.length === 0) {
            return toast.error('Please upload at least one image');
        }

        try {
            setSaving(true);
            await updateProduct(id, productData);
            toast.success('Product updated successfully');
            navigate('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Retrieving Product Data...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-8 max-w-6xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Top Bar Navigation */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all text-slate-500"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Product</h1>
                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Catalog <ChevronRight className="h-3 w-3 mx-1" /> Update Product
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="flex-1 md:flex-none px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 md:flex-none flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Sync Updates
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Product Discovery */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <Package className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Product Discovery</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">What are you selling?</label>
                                        <input
                                            type="text"
                                            value={productData.title}
                                            onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                                            required
                                            placeholder="e.g. Master & Dynamic MH40 Wireless"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Extended Narrative</label>
                                        <textarea
                                            value={productData.description}
                                            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                            required
                                            rows="8"
                                            placeholder="Tell the story behind this product..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Serial/SKU Tracking</label>
                                            <input
                                                type="text"
                                                value={productData.sku}
                                                onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                                                required
                                                placeholder="REF-HD-092"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                            <Dropdown
                                                label="Manufacturer/Brand"
                                                placeholder="Select Brand"
                                                value={productData.brand}
                                                onChange={(val) => setProductData({ ...productData, brand: val })}
                                                options={brands.map(b => ({ label: b.name, value: b.name }))}
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Commercial Intelligence */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Commercial Intelligence</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Price (₹)</label>
                                        <input
                                            type="number"
                                            value={productData.price}
                                            onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">MRP/Compare (₹)</label>
                                        <input
                                            type="number"
                                            value={productData.comparePrice}
                                            onChange={(e) => setProductData({ ...productData, comparePrice: e.target.value })}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-400 focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Units</label>
                                        <input
                                            type="number"
                                            value={productData.stock}
                                            onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                                            required
                                            min="0"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Media Assets */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                        <ImageIcon className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Media Assets</h2>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                <button
                                                    type="button"
                                                    onClick={() => setPrimary(index)}
                                                    className={`p-2 rounded-xl text-white transition-all transform hover:scale-110 ${productData.images[index]?.isPrimary ? 'bg-indigo-600 shadow-lg' : 'bg-slate-800/60 hover:bg-slate-800'}`}
                                                    title="Set as Hero Image"
                                                >
                                                    <Tag className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all transform hover:scale-110 shadow-lg"
                                                    title="Remove"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            {productData.images[index]?.isPrimary && (
                                                <div className="absolute top-3 left-3 px-2 py-1 bg-indigo-600 text-[8px] font-black text-white rounded-full uppercase tracking-widest ring-4 ring-white shadow-lg">
                                                    Hero
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {previews.length < 5 && (
                                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all group">
                                            <Upload className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Asset</span>
                                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    )}
                                </div>
                                <div className="mt-6 flex items-start gap-2 text-slate-400">
                                    <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
                                    <p className="text-[10px] font-medium leading-relaxed">Optimization Tip: High-resolution images (2000x2000px) with clean backgrounds perform 40% better on conversion. Max 5 assets.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Product Hierarchy */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="h-8 w-8 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                                        <Layers className="h-4 w-4 text-indigo-500" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Hierarchy</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Global Categories</label>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                            {categories.map(c => {
                                                const isSelected = (productData.category || []).includes(c._id);
                                                return (
                                                    <div
                                                        key={c._id}
                                                        onClick={() => toggleCategory(c._id, c.name)}
                                                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected
                                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected
                                                                ? 'bg-indigo-600 border-indigo-600'
                                                                : 'bg-slate-50 border-slate-200'
                                                                }`}>
                                                                {isSelected && <Layers className="h-2.5 w-2.5 text-white" />}
                                                            </div>
                                                            <span className="text-xs font-bold uppercase">{c.name}</span>
                                                        </div>
                                                        {isSelected && <ChevronRight className="h-3 w-3 opacity-40" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sub-Infrastructure Nodes</label>
                                        {!productData.category ? (
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400 uppercase text-center">
                                                Assign Global Category First
                                            </div>
                                        ) : subcategories.length === 0 ? (
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400 uppercase text-center">
                                                No sub-nodes defined for this nexus
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                {subcategories.map(s => {
                                                    const isSelected = (productData.subcategory || []).includes(s._id);
                                                    return (
                                                        <div
                                                            key={s._id}
                                                            onClick={() => toggleSubcategory(s._id, s.name)}
                                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected
                                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected
                                                                    ? 'bg-indigo-600 border-indigo-600'
                                                                    : 'bg-slate-50 border-slate-200'
                                                                    }`}>
                                                                    {isSelected && <Layers className="h-2.5 w-2.5 text-white" />}
                                                                </div>
                                                                <span className="text-xs font-bold uppercase">{s.name}</span>
                                                            </div>
                                                            {isSelected && <ChevronRight className="h-3 w-3 opacity-40" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Variant Selection */}
                            {variants.length > 0 && (
                                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="h-8 w-8 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                                            <Palette className="h-4 w-4 text-violet-500" />
                                        </div>
                                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Variants</h2>
                                    </div>
                                    <div className="space-y-6">
                                        {variants.filter(v => v.status === 'Global').map(group => (
                                            <div key={group._id}>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                                    {group.name} <span className="text-slate-300">({group.type})</span>
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {group.values.map((val, idx) => {
                                                        const isSelected = (selectedVariants[group._id] || []).find(v => v.value === val.value);
                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => toggleVariantValue(group._id, val)}
                                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${isSelected
                                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                                                    }`}
                                                            >
                                                                {group.type === 'Color' && (
                                                                    <span className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: val.value }}></span>
                                                                )}
                                                                {val.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Visibility Settings */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="h-8 w-8 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                                        <Tag className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Visibility</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-indigo-200 transition-all cursor-pointer" onClick={() => setProductData({ ...productData, isActive: !productData.isActive })}>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">Live Status</span>
                                            <span className="text-[10px] text-slate-400 mt-1 font-bold">Publicly accessible in store</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={productData.isActive}
                                                readOnly
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 ring-4 ring-transparent peer-checked:ring-emerald-500/10 transition-all"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-indigo-200 transition-all cursor-pointer" onClick={() => setProductData({ ...productData, isFeatured: !productData.isFeatured })}>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">Feature Highlight</span>
                                            <span className="text-[10px] text-slate-400 mt-1 font-bold">Promote on homepage tiles</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={productData.isFeatured}
                                                readOnly
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 ring-4 ring-transparent peer-checked:ring-indigo-500/10 transition-all"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditProduct;
