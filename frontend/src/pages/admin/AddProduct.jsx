import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { createProduct, uploadProductImage } from '../../services/adminService';
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
    DollarSign,
    Package,
    Layers
} from 'lucide-react';
import { toast } from 'react-toastify';

const AddProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [productData, setProductData] = useState({
        title: '',
        description: '',
        shortDescription: '',
        category: '',
        subcategory: '',
        brand: '',
        sku: '',
        price: '',
        comparePrice: '',
        costPrice: '',
        stock: '',
        lowStockThreshold: 10,
        isActive: true,
        isFeatured: false,
        images: [] // Array of { url, publicId, isPrimary }
    });

    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/api/categories?parent=null');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleCategoryChange = async (e) => {
        const categoryId = e.target.value;
        setProductData({ ...productData, category: categoryId, subcategory: '' });

        if (categoryId) {
            try {
                const response = await apiClient.get(`/api/categories?parent=${categoryId}`);
                setSubcategories(response.data);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
            }
        } else {
            setSubcategories([]);
        }
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setLoading(true);
        const newImages = [...productData.images];
        const newPreviews = [...previews];

        for (const file of files) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise((resolve) => {
                reader.onload = async () => {
                    try {
                        // Upload to Cloudinary via backend
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
        setLoading(false);
    };

    const removeImage = (index) => {
        const newImages = [...productData.images];
        const newPreviews = [...previews];
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        // Ensure one image is primary if any remain
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
            setLoading(true);
            await createProduct(productData);
            toast.success('Product added successfully');
            navigate('/admin/products');
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
                            <p className="text-sm text-slate-500 mt-1">Fill in the details to list a new product in your store.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Product
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Basic Information */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase tracking-widest text-xs">
                                    <Package className="h-4 w-4" />
                                    Basic Information
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product Title</label>
                                        <input
                                            type="text"
                                            value={productData.title}
                                            onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                                            required
                                            placeholder="e.g. Wireless Noise Cancelling Headphones"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Description</label>
                                        <textarea
                                            value={productData.description}
                                            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                            required
                                            rows="6"
                                            placeholder="Give a detailed description of your product..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">SKU</label>
                                            <input
                                                type="text"
                                                value={productData.sku}
                                                onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                                                required
                                                placeholder="SKU-12345"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Brand</label>
                                            <input
                                                type="text"
                                                value={productData.brand}
                                                onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                                                placeholder="e.g. Sony"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-6 text-emerald-600 font-bold uppercase tracking-widest text-xs">
                                    <DollarSign className="h-4 w-4" />
                                    Pricing & Inventory
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Base Price ($)</label>
                                        <input
                                            type="number"
                                            value={productData.price}
                                            onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Compare Price ($)</label>
                                        <input
                                            type="number"
                                            value={productData.comparePrice}
                                            onChange={(e) => setProductData({ ...productData, comparePrice: e.target.value })}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Stock Quantity</label>
                                        <input
                                            type="number"
                                            value={productData.stock}
                                            onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                                            required
                                            min="0"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-6 text-amber-600 font-bold uppercase tracking-widest text-xs">
                                    <ImageIcon className="h-4 w-4" />
                                    Product Images
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setPrimary(index)}
                                                    className={`p-1.5 rounded-lg border border-white/20 text-white ${productData.images[index]?.isPrimary ? 'bg-indigo-600' : 'bg-slate-800/60 hover:bg-slate-800'}`}
                                                    title="Set as Primary"
                                                >
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                    title="Remove"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            {productData.images[index]?.isPrimary && (
                                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-indigo-600 text-[8px] font-black text-white rounded-full uppercase tracking-widest ring-2 ring-white shadow-sm">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-all">
                                        <Upload className="h-6 w-6 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-400">First image will be the primary one. Max 5 images allowed.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Category Selection */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold uppercase tracking-widest text-xs">
                                    <Layers className="h-4 w-4 text-indigo-500" />
                                    Organization
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                                        <select
                                            value={productData.category}
                                            onChange={handleCategoryChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subcategory</label>
                                        <select
                                            value={productData.subcategory}
                                            onChange={(e) => setProductData({ ...productData, subcategory: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                            disabled={!productData.category || subcategories.length === 0}
                                        >
                                            <option value="">None</option>
                                            {subcategories.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                        {productData.category && subcategories.length === 0 && (
                                            <p className="text-[10px] text-amber-600 mt-2 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                No subcategories available for this category.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status & Options */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold uppercase tracking-widest text-xs">
                                    <Tag className="h-4 w-4 text-indigo-500" />
                                    Status
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">Active</span>
                                            <span className="text-[10px] text-slate-500">Visible in the store</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={productData.isActive}
                                                onChange={(e) => setProductData({ ...productData, isActive: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">Featured</span>
                                            <span className="text-[10px] text-slate-500">Show on homepage</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={productData.isFeatured}
                                                onChange={(e) => setProductData({ ...productData, isFeatured: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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

export default AddProduct;
