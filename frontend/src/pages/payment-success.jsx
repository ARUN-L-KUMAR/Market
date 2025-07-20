import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);
  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>Payment Successful!</h1>
      <p>Your order has been placed successfully. Thank you for shopping with us.</p>
      <a href="/" style={{ color: '#007bff' }}>Go to Home</a>
    </div>
  );
};

export default PaymentSuccess; 