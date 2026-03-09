import { useSelector, useDispatch } from 'react-redux';
import { Globe } from 'lucide-react';
import { setCurrency } from '../store/currencySlice';
import Dropdown from './ui/Dropdown';

const CurrencySwitcher = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { currentCurrency, supportedCurrencies } = useSelector(state => state.currency);

  const handleCurrencyChange = (currencyCode) => {
    dispatch(setCurrency(currencyCode));
  };

  const currencyOptions = Object.entries(supportedCurrencies).map(([code, info]) => ({
    label: `${info.symbol} ${code} - ${info.name}`,
    value: code
  }));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-slate-100 p-3 rounded-2xl">
        <Globe className="w-4 h-4 text-slate-600" />
      </div>
      <div className="w-48">
        <Dropdown
          placeholder="Currency"
          value={currentCurrency}
          onChange={handleCurrencyChange}
          options={currencyOptions}
        />
      </div>
    </div>
  );
};

export default CurrencySwitcher;
