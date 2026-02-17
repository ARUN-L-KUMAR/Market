import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import apiClient from '../../services/api';
import { Plus, Edit2, Trash2, Folder, ChevronRight, Check, X, AlertCircle, LayoutGrid } from 'lucide-react';
import { toast } from 'react-toastify';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', description: '', parentCategory: null });
    const [isEditing, setIsEditing] = useState(false);

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
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiClient.put(`/api/categories/${currentCategory._id}`, currentCategory);
                toast.success('Category updated successfully');
            } else {
                await apiClient.post('/api/categories', currentCategory);
                toast.success('Category created successfully');
            }
            setIsModalOpen(false);
            setCurrentCategory({ name: '', description: '', parentCategory: null });
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will also delete all subcategories.')) {
            try {
                await apiClient.delete(`/api/categories/${id}`);
                toast.success('Category deleted successfully');
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    const openModal = (category = { name: '', description: '', parentCategory: null }) => {
        setCurrentCategory(category);
        setIsEditing(!!category._id);
        setIsModalOpen(true);
    };

    if (loading && categories.length === 0) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    const parentCategories = categories.filter(c => !c.parentCategory);

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Product Categories</h1>
                        <p className="text-sm text-slate-500 mt-1">Organize your products into logical categories and subcategories.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Category
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {parentCategories.map((parent) => (
                        <div key={parent._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <Folder className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">{parent.name}</h3>
                                        <p className="text-xs text-slate-500">{parent.description || 'No description'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openModal(parent)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(parent._id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categories.filter(sub => sub.parentCategory === parent._id).map(subcategory => (
                                        <div key={subcategory._id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                        {subcategory.name}
                                                    </h4>
                                                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{subcategory.description}</p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openModal(subcategory)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subcategory._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => openModal({ name: '', description: '', parentCategory: parent._id })}
                                        className="p-4 border border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Subcategory
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {parentCategories.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LayoutGrid className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No categories found</h3>
                            <p className="text-sm text-slate-500 mt-2">Get started by creating your first product category.</p>
                            <button
                                onClick={() => openModal()}
                                className="mt-6 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                            >
                                Create First Category
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-900">{isEditing ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                    required
                                    placeholder="e.g. Smartphones"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    value={currentCategory.description}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                    rows="3"
                                    placeholder="Brief description of this category..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>
                            {!isEditing && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Parent Category (Optional)</label>
                                    <select
                                        value={currentCategory.parentCategory || ''}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, parentCategory: e.target.value || null })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {parentCategories.filter(c => c._id !== currentCategory._id).map(parent => (
                                            <option key={parent._id} value={parent._id}>{parent.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                                >
                                    {isEditing ? 'Update' : 'Create'} Category
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
