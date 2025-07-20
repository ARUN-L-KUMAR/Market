import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  ChevronDown, 
  Check,
  CreditCard,
  MapPin
} from 'lucide-react';
import { setCurrency } from '../store/currencySlice';

const CurrencySwitcher = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { currentCurrency, supportedCurrencies } = useSelector(state => state.currency);
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = (currencyCode) => {
    dispatch(setCurrency(currencyCode));
    setIsOpen(false);
  };

  const currentCurrencyInfo = supportedCurrencies[currentCurrency];

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 min-w-[100px]"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentCurrencyInfo?.symbol} {currentCurrency}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Select Currency</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Prices will be converted automatically
                </p>
              </div>

              {/* Currency List */}
              <div className="max-h-64 overflow-y-auto">
                {Object.entries(supportedCurrencies).map(([code, info]) => (
                  <motion.button
                    key={code}
                    whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                    onClick={() => handleCurrencyChange(code)}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-purple-50 transition-colors duration-200 ${
                      currentCurrency === code ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                        currentCurrency === code 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {info.symbol}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{code}</div>
                        <div className="text-sm text-gray-600">{info.name}</div>
                      </div>
                    </div>
                    {currentCurrency === code && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Exchange rates updated automatically</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySwitcher;
