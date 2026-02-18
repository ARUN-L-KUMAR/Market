import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import socket from '../utils/socket';
import { addToCart } from '../store/cartSlice';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CurrencyPrice from '../components/CurrencyPrice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${apiUrl}/api/products/${id}`);
        setProduct(response.data);

        // Set default selections if available
        if (response.data.colors && response.data.colors.length > 0) {
          setSelectedColor(response.data.colors[0].name);
        }
        if (response.data.sizes && response.data.sizes.length > 0) {
          setSelectedSize(response.data.sizes[0].name);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again.");
        setLoading(false);
      }
    };

    fetchProduct();

    // Listen for real-time product updates
    const handleProductUpdate = (data) => {
      if (data.product._id === id) {
        setProduct(data.product);
      }
    };

    socket.on('productUpdated', handleProductUpdate);
    socket.on('stockUpdate', handleProductUpdate);

    return () => {
      socket.off('productUpdated', handleProductUpdate);
      socket.off('stockUpdate', handleProductUpdate);
    };
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  // Increment quantity
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    dispatch(addToCart({
      product,
      quantity,
      color: selectedColor,
      size: selectedSize
    }));

    // Show toast notification
    const event = new CustomEvent('show-toast', {
      detail: {
        message: `Added ${quantity} ${product.title} to cart!`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="bg-slate-200 rounded-lg h-96"></div>

            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-12 bg-slate-200 rounded w-1/3 mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl text-center">
        <div className="bg-red-50 p-6 rounded-lg border border-red-100">
          <h2 className="text-2xl font-semibold text-red-700 mb-2">Error Loading Product</h2>
          <p className="text-red-600">{error || "Product not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/products')}
          >
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product images */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-subtle overflow-hidden h-96 border border-slate-200">
            <img
              src={product.images && product.images[selectedImageIndex]
                ? product.images[selectedImageIndex].url
                : "https://via.placeholder.com/600x400"}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Image thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`
                    border-2 rounded-lg overflow-hidden cursor-pointer h-20 w-20 flex-shrink-0
                    ${selectedImageIndex === index ? 'border-indigo-500' : 'border-slate-200'}
                  `}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product details */}
        <div>
          {/* Brand & title */}
          {product.brand && (
            <p className="text-indigo-600 font-medium mb-1">{product.brand}</p>
          )}
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">{product.title}</h1>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(product.categoryName) && product.categoryName.length > 0 ? (
              product.categoryName.map((cat, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  {cat}
                </span>
              ))
            ) : (
              product.categoryName && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  {product.categoryName}
                </span>
              )
            )}
            {Array.isArray(product.subcategoryName) && product.subcategoryName.length > 0 && (
              product.subcategoryName.map((sub, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  {sub}
                </span>
              ))
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-6 mb-8">
            <CurrencyPrice
              price={product.price}
              variant="nexus"
              size="4xl"
              weight="bold"
              showDecimals={false}
            />
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="flex items-center gap-3">
                <CurrencyPrice
                  price={product.comparePrice}
                  size="xl"
                  color="text-slate-400"
                  weight="medium"
                  className="line-through"
                  showDecimals={false}
                />
                <Badge variant="danger" className="bg-rose-50 text-rose-600 border-rose-100 uppercase tracking-widest text-[10px] py-1 px-3">
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% Protocol Offset
                </Badge>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-slate-600">{product.description}</p>
          </div>

          {/* Color selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Color</h3>
              <div className="flex space-x-2">
                {product.colors.map(color => (
                  <div
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`
                      w-10 h-10 rounded-full cursor-pointer border-2 flex items-center justify-center
                      ${selectedColor === color.name ? 'border-indigo-500' : 'border-slate-200'}
                    `}
                    title={color.name}
                  >
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: color.hexCode }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <div
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`
                      px-4 py-2 rounded-md cursor-pointer font-medium
                      ${selectedSize === size.name
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'}
                      ${size.stock <= 0 && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {size.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and add to cart */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Quantity</h3>
            <div className="flex items-center">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-l-md bg-slate-100 border border-slate-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 h-10 text-center border-t border-b border-slate-300 focus:outline-none focus:ring-0"
              />
              <button
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
                className="w-10 h-10 rounded-r-md bg-slate-100 border border-slate-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stock status */}
          <div className="mb-6">
            {product.stock <= 0 ? (
              <Badge color="danger" size="lg">Out of Stock</Badge>
            ) : product.stock <= product.lowStockThreshold ? (
              <Badge color="warning" size="lg">Low Stock: Only {product.stock} left</Badge>
            ) : (
              <Badge color="success" size="lg">In Stock: {product.stock} units available</Badge>
            )}
          </div>

          {/* Add to cart button */}
          <div className="flex space-x-4">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              variant={product.stock <= 0 ? "disabled" : "primary"}
              size="lg"
              className="flex-grow md:flex-grow-0 md:w-1/2"
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;