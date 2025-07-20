import { useSelector } from 'react-redux';
import { convertPrice, formatPrice } from '../store/currencySlice';

const CurrencyPrice = ({ 
  price, 
  originalPrice, 
  className = '',
  showOriginal = false,
  size = 'md'
}) => {
  const { currentCurrency, exchangeRates, baseCurrency } = useSelector(state => state.currency);
  
  // Convert price to current currency
  const convertedPrice = convertPrice(price, baseCurrency, currentCurrency, exchangeRates);
  const convertedOriginalPrice = originalPrice 
    ? convertPrice(originalPrice, baseCurrency, currentCurrency, exchangeRates)
    : null;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`${className}`}>
      <span className={`font-bold text-purple-600 ${sizeClasses[size]}`}>
        {formatPrice(convertedPrice, currentCurrency)}
      </span>
      {showOriginal && convertedOriginalPrice && convertedOriginalPrice > convertedPrice && (
        <span className={`ml-2 text-gray-400 line-through ${sizeClasses[size === 'xl' ? 'lg' : 'sm']}`}>
          {formatPrice(convertedOriginalPrice, currentCurrency)}
        </span>
      )}
    </div>
  );
};

export default CurrencyPrice;
