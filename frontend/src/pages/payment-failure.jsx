import React from 'react';

const PaymentFailure = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>Payment Failed</h1>
      <p>Unfortunately, your payment could not be processed. Please try again or use a different payment method.</p>
      <a href="/cart" style={{ color: '#dc3545' }}>Return to Cart</a>
    </div>
  );
};

export default PaymentFailure; 