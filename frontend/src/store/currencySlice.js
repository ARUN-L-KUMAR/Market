import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Currency configuration
const SUPPORTED_CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' }
};

// Default currency based on location or fallback to INR
const getDefaultCurrency = () => {
  const savedCurrency = localStorage.getItem('preferredCurrency');
  if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
    return savedCurrency;
  }
  
  // Try to detect currency based on browser locale
  try {
    const locale = navigator.language || navigator.userLanguage;
    const countryCode = locale.split('-')[1];
    
    const currencyMap = {
      'US': 'USD',
      'IN': 'INR',
      'GB': 'GBP',
      'DE': 'EUR',
      'FR': 'EUR',
      'IT': 'EUR',
      'ES': 'EUR',
      'JP': 'JPY',
      'AU': 'AUD',
      'CA': 'CAD',
      'CH': 'CHF',
      'CN': 'CNY',
      'SE': 'SEK'
    };
    
    return currencyMap[countryCode] || 'INR';
  } catch (error) {
    return 'INR'; // Default fallback
  }
};

// Fetch exchange rates from a free API
export const fetchExchangeRates = createAsyncThunk(
  'currency/fetchExchangeRates',
  async (baseCurrency = 'INR', { rejectWithValue }) => {
    try {
      // Using exchangerate-api.com (free tier: 1500 requests/month)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/INR`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      return {
        rates: data.rates,
        baseCurrency: data.base,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Initialize currency system with exchange rates
export const initializeCurrency = createAsyncThunk(
  'currency/initializeCurrency',
  async (_, { dispatch, getState }) => {
    try {
      const { currency } = getState();
      
      // Check if rates are already fresh (less than 1 hour old)
      const now = new Date().getTime();
      const lastUpdated = currency.lastUpdated ? new Date(currency.lastUpdated).getTime() : 0;
      const oneHour = 60 * 60 * 1000;
      
      if (now - lastUpdated < oneHour && Object.keys(currency.exchangeRates).length > 0) {
        return; // Rates are fresh, no need to fetch
      }
      
      // Fetch fresh exchange rates
      await dispatch(fetchExchangeRates());
    } catch (error) {
      console.error('Error initializing currency:', error);
    }
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    currentCurrency: getDefaultCurrency(),
    supportedCurrencies: SUPPORTED_CURRENCIES,
    exchangeRates: {},
    baseCurrency: 'INR', // Base currency for stored prices
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    setCurrency: (state, action) => {
      const newCurrency = action.payload;
      if (SUPPORTED_CURRENCIES[newCurrency]) {
        state.currentCurrency = newCurrency;
        localStorage.setItem('preferredCurrency', newCurrency);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeRates = action.payload.rates;
        state.baseCurrency = action.payload.baseCurrency;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrency, clearError } = currencySlice.actions;
export default currencySlice.reducer;

// Utility functions for currency conversion
export const convertPrice = (price, fromCurrency, toCurrency, rates) => {
  if (!price || !rates) return price;
  
  if (fromCurrency === toCurrency) return price;
  
  // Convert to USD first if needed
  let usdPrice = price;
  if (fromCurrency !== 'USD') {
    usdPrice = price / (rates[fromCurrency] || 1);
  }
  
  // Convert from USD to target currency
  const convertedPrice = usdPrice * (rates[toCurrency] || 1);
  
  return convertedPrice;
};

export const formatPrice = (price, currency) => {
  if (!price || !currency || !SUPPORTED_CURRENCIES[currency]) {
    return `₹${price || 0}`;
  }
  
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  
  // Format based on currency
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(price);
  } catch (error) {
    // Fallback formatting
    return `${currencyInfo.symbol}${price.toFixed(currency === 'JPY' ? 0 : 2)}`;
  }
};
