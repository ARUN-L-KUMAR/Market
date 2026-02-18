import { useSelector } from 'react-redux';
import { convertPrice, formatPrice } from '../store/currencySlice';

const CurrencyPrice = ({
  price,
  originalPrice,
  className = '',
  showOriginal = false,
  size = 'md',
  variant = 'default',
  showDecimals = true,
  weight = 'semibold',
  color = null
}) => {
  const { currentCurrency, exchangeRates, baseCurrency } = useSelector(state => state.currency);

  // Convert price to current currency
  const convertedPrice = convertPrice(price, baseCurrency, currentCurrency, exchangeRates);
  const convertedOriginalPrice = originalPrice
    ? convertPrice(originalPrice, baseCurrency, currentCurrency, exchangeRates)
    : null;

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const variantColors = {
    default: 'text-indigo-600',
    nexus: 'text-slate-950',
    primary: 'text-primary-600',
    white: 'text-white',
    rose: 'text-rose-500'
  };

  const textColor = color || variantColors[variant] || variantColors.default;

  const formatOptions = (val) => {
    let formatted = formatPrice(val, currentCurrency);
    if (!showDecimals && currentCurrency !== 'JPY') {
      formatted = formatted.split('.')[0];
    }
    return formatted;
  };

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className={`${weightClasses[weight]} ${textColor} ${sizeClasses[size]}`}>
        {formatOptions(convertedPrice)}
      </span>
      {showOriginal && convertedOriginalPrice && convertedOriginalPrice > convertedPrice && (
        <span className={`ml-2 text-slate-400 line-through ${sizeClasses[size === 'xl' ? 'lg' : 'sm']} font-medium`}>
          {formatOptions(convertedOriginalPrice)}
        </span>
      )}
    </span>
  );
};

export default CurrencyPrice;
