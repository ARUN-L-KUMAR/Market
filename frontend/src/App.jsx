import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchWishlist } from './store/wishlistSlice'
import { initializeCurrency } from './store/currencySlice'
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {!isAdminRoute && <Navbar isConnected={isConnected} />}
      <Outlet />
      {!isAdminRoute && <Footer />}
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
