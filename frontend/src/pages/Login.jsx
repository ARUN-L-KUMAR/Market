import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const { info, token } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (token && info) {
      navigate('/');
    }
  }, [token, info, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your account and manage your orders</p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;