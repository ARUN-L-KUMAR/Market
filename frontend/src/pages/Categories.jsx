import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import {
    Layers,
    ArrowRight,
    ChevronRight,
    Smartphone,
    Laptop,
    Headphones,
    Shirt,
    Home,
    Book,
    Dumbbell
} from 'lucide-react';

const categoryIcons = {
    'Electronics': <Smartphone className="w-8 h-8" />,
    'Clothing': <Shirt className="w-8 h-8" />,
    'Home & Kitchen': <Home className="w-8 h-8" />,
    'Books': <Book className="w-8 h-8" />,
    'Sports & Outdoors': <Dumbbell className="w-8 h-8" />,
    'Smartphones': <Smartphone className="w-6 h-6" />,
    'Laptops': <Laptop className="w-6 h-6" />,
    'Audio': <Headphones className="w-6 h-6" />
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesAPI.getByParent('null');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-20">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center px-6 py-3 bg-indigo-100 rounded-full text-indigo-700 font-medium mb-6">
                        <Layers className="w-5 h-5 mr-2" />
                        Explore by Category
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
                        Browse Our Collections
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Find exactly what you're looking for by browsing through our carefully curated categories.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer"
                                onClick={() => navigate(`/products?category=${category._id}`)}
                            >
                                <div className="p-8">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        {categoryIcons[category.name] || <Layers className="w-8 h-8" />}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{category.name}</h3>
                                    <p className="text-slate-600 mb-6 leading-relaxed">
                                        {category.description || `Explore our high-quality collection of ${category.name.toLowerCase()}.`}
                                    </p>
                                    <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                        View Products
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
