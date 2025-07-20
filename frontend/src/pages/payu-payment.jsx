import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PayUPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef();
  const payuData = location.state;

  useEffect(() => {
    if (!payuData) {
      navigate('/cart');
      return;
    }
    formRef.current.submit();
  }, [payuData, navigate]);

  if (!payuData) return null;

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Redirecting to PayU...</h2>
      <form ref={formRef} method="POST" action={payuData.action}>
        <input type="hidden" name="key" value={payuData.key} />
        <input type="hidden" name="txnid" value={payuData.txnid} />
        <input type="hidden" name="amount" value={payuData.amount} />
        <input type="hidden" name="productinfo" value={payuData.productinfo} />
        <input type="hidden" name="firstname" value={payuData.firstname} />
        <input type="hidden" name="email" value={payuData.email} />
        <input type="hidden" name="phone" value={payuData.phone} />
        <input type="hidden" name="surl" value={payuData.surl} />
        <input type="hidden" name="furl" value={payuData.furl} />
        <input type="hidden" name="hash" value={payuData.hash} />
        <input type="hidden" name="service_provider" value={payuData.service_provider} />
        <noscript>
          <button type="submit">Click here if you are not redirected</button>
        </noscript>
      </form>
    </div>
  );
};

export default PayUPayment; 