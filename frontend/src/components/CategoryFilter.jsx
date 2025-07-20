import React, { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import { API_CONFIG } from '../config/appConfig';

const CategoryFilter = ({ onCategoryChange, selectedCategory = 'all' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Use our API config
        const apiUrl = API_CONFIG.baseUrl;
        const response = await fetch(`${apiUrl}/api/categories`);
        const data = await response.json();
        
        // Add "All Categories" option
        const allCategoriesOption = { _id: 'all', name: 'All Categories' };
        setCategories([allCategoriesOption, ...data]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId);
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-4">
        <h3 className="text-lg font-bold mb-2">Categories</h3>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-4">
      <h3 className="text-lg font-bold mb-4 text-primary-700">Categories</h3>
      <ul className="space-y-1">
        {categories.map((category) => (
          <li key={category._id}>
            <button
              onClick={() => handleCategoryClick(category._id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-colors
                ${selectedCategory === category._id
                  ? 'bg-primary-100 text-primary-800 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter;