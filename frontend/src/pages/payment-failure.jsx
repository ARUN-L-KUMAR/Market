import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw, CreditCard, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    switch (reason) {
      case 'order_not_found':
        return 'Order details could not be found. Please contact support if the issue persists.';
      case 'hash_verification_failed':
        return 'Payment verification failed for security reasons. Please try again.';
      case 'server_error':
        return 'A server error occurred. This might be a temporary issue with the payment gateway. Please try again in a few moments.';
      case 'payment_cancelled':
        return 'You cancelled the payment. No charges were made to your account.';
      case 'payment_declined':
        return 'Your payment was declined. Please check your payment details or try a different payment method.';
      default:
        return 'Unfortunately, your payment could not be processed. This could be due to insufficient funds, incorrect card details, or a temporary issue with the payment gateway.';
    }
  };

  useEffect(() => {
    // Log the failure for analytics
    console.log('Payment failed:', reason || 'unknown');
  }, [reason]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl font-black text-slate-900 text-center mb-4">
            Payment Failed
          </h1>

          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-slate-700 leading-relaxed">
                {getErrorMessage()}
              </p>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              What you can do:
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>Verify your payment details and try again</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>Try a different payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>Contact your bank if the issue persists</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>Reach out to our support team for assistance</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-3"
              size="lg"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again with Different Method
            </Button>
            <Button
              onClick={() => navigate('/cart')}
              variant="outline"
              className="w-full flex items-center justify-center gap-3"
              size="lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Cart
            </Button>
          </div>

          {/* Support Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Need help?{' '}
            <button
              onClick={() => navigate('/contact')}
              className="text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Contact Support
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailure; 