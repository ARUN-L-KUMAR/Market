import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchWishlist } from './store/wishlistSlice'
import { initializeCurrency } from './store/currencySlice'
import { clearCart } from './store/cartSlice'
import './App.css'
import Navbar from './components/Navbar'
import socket from './utils/socket'
import testSocket from './utils/socketTest'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { user, token } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const location = useLocation();

  // Check if current route is admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Initialize currency system
  useEffect(() => {
    dispatch(initializeCurrency());
  }, [dispatch]);

  // Initialize wishlist when user is authenticated
  useEffect(() => {
    if (user && token) {
      dispatch(fetchWishlist());
    }
  }, [user, token, dispatch]);

  // Update connection status when socket connects or disconnects
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Cross-tab synchronization for Cart
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart' && e.newValue) {
        try {
          const newCart = JSON.parse(e.newValue);
          if (newCart.items && newCart.items.length === 0) {
            dispatch(clearCart());
            console.log('🛒 Cart cleared via cross-tab sync');
          }
          // For now we only handle clearing. 
          // Full sync would require a 'syncCart' action.
        } catch (err) {
          console.error('Error syncing cart across tabs:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  // Also monitor test socket connection
  useEffect(() => {
    const onTestConnect = () => {
      console.log('✅ Test socket connection successful!');
      setIsConnected(true);
    };

    testSocket.on('connect', onTestConnect);

    return () => {
      testSocket.off('connect', onTestConnect);
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {!isAdminRoute && <Navbar isConnected={isConnected} />}
      <Outlet />
      {!isAdminRoute && location.pathname !== '/products' && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default App
