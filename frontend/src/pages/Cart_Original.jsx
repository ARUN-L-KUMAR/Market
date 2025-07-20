import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import Button from '../components/ui/Button';
import axios from 'axios';
import socket from '../utils/socket';

const Cart = () => {
  const { items } = useSelector(state => state.cart);
  const { token } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [stockWarnings, setStockWarnings] = useState({});
  
  // Calculate totals whenever cart items change
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + ((item.product?.price ?? 0) * item.quantity), 0);
    const newTax = newSubtotal * 0.08; // 8% tax rate
    const newShipping = newSubtotal > 100 ? 0 : 10; // Free shipping over $100
    
    setSubtotal(newSubtotal);
    setTax(newTax);
    setShipping(newShipping);
    setTotal(newSubtotal + newTax + newShipping);
  }, [items]);
  
  // Monitor real-time stock changes
  useEffect(() => {
    const checkStockWarnings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const productIds = items
          .map(item => item.product?._id)
          .filter(Boolean);
        
        if (productIds.length === 0) return;
        
        const response = await axios.get(`${apiUrl}/api/products`, {
          params: { ids: productIds.join(',') }
        });
        
        const products = response.data.products;
        const warnings = {};
        
        items.forEach(item => {
          if (!item.product?._id) return;
          const currentProduct = products.find(p => p._id === item.product._id);
          
          if (currentProduct) {
            if (currentProduct.stock < item.quantity) {
              warnings[item.product._id] = {
                available: currentProduct.stock,
                requested: item.quantity
              };
            }
          }
        });
        
        setStockWarnings(warnings);
      } catch (error) {
        console.error('Error checking stock:', error);
      }
    };
    
    checkStockWarnings();
    
    // Listen for stock updates
    const handleStockUpdate = () => {
      checkStockWarnings();
    };
    
    socket.on('stockUpdate', handleStockUpdate);
    socket.on('productUpdated', handleStockUpdate);
    
    return () => {
      socket.off('stockUpdate', handleStockUpdate);
      socket.off('productUpdated', handleStockUpdate);
    };
  }, [items]);
  
  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };
  
  // Handle remove item
  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
    
    // Show toast notification
    const event = new CustomEvent('show-toast', { 
      detail: { message: 'Item removed from cart', type: 'info' }
    });
    window.dispatchEvent(event);
  };
  
  // Handle proceed to checkout
  const handleCheckout = () => {
    // Check if there are any stock warnings
    if (Object.keys(stockWarnings).length > 0) {
      // Show toast notification
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Please adjust quantities for items with low stock', type: 'warning' }
      });
      window.dispatchEvent(event);
      return;
    }
    
    // Check if user is logged in
    if (!token) {
      // Show toast notification
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Please log in to proceed to checkout', type: 'info' }
      });
      window.dispatchEvent(event);
      navigate('/login', { state: { redirect: '/checkout' } });
      return;
    }
    
    navigate('/checkout');
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>
        <div className="bg-white rounded-2xl shadow-subtle p-8 text-center border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 overflow-hidden">
            {/* Items list */}
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={`${item.product?._id ?? ''}-${item.size ?? ''}-${item.color ?? ''}`} className="p-6">
                  <div className="flex flex-col sm:flex-row">
                    {/* Product image */}
                    <div className="sm:w-24 sm:h-24 h-20 w-full mb-4 sm:mb-0">
                      <img
                        src={Array.isArray(item.product?.images) && item.product.images.length > 0
                          ? item.product.images[0]?.url
                          : "https://via.placeholder.com/200"}
                        alt={item.product?.title || 'Product'}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Product details */}
                    <div className="sm:ml-6 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{item.product?.title || 'Product'}</h3>
                          <div className="mt-1 text-sm text-gray-500">
                            {item.size && <span className="mr-3">Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                          
                          {/* Stock warning */}
                          {item.product && stockWarnings[item.product._id] && (
                            <div className="mt-2 text-sm text-red-600">
                              Only {stockWarnings[item.product._id].available} item(s) available
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-medium text-primary-700">${item.product?.price?.toFixed(2) ?? '0.00'}</p>
                          {item.product?.comparePrice && (
                            <p className="text-sm text-gray-400 line-through">${item.product.comparePrice.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Quantity and remove */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item.product?._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-l-md bg-gray-100 border border-gray-300 flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product?._id, parseInt(e.target.value))}
                            className="w-12 h-8 text-center border-t border-b border-gray-300 focus:outline-none"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                            className="w-8 h-8 rounded-r-md bg-gray-100 border border-gray-300 flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.product?._id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Continue shopping button */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    dispatch(clearCart());
                    const event = new CustomEvent('show-toast', { 
                      detail: { message: 'Cart cleared', type: 'info' }
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-700">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              
              {Object.keys(stockWarnings).length > 0 && (
                <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded border border-red-100">
                  <p className="font-semibold">Attention:</p>
                  <p>Some items in your cart have limited stock availability. Please adjust quantities before checkout.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <p className="text-xs text-gray-500 text-center">
                By checking out, you agree to our <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;