import { configureStore, createSlice } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import productReducer from './productSlice';
import currencyReducer from './currencySlice';

// Helpers for localStorage
const loadState = (key, fallback) => {
  try {
    const serialized = localStorage.getItem(key);
    return serialized ? JSON.parse(serialized) : fallback;
  } catch {
    return fallback;
  }
};

const saveState = (key, state) => {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {}
};

// Local products slice is removed as we now use the separate productSlice.js file

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState: loadState('user', { user: null, token: null, loading: false, error: null }),
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
      saveState('user', state);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      saveState('user', state);
    },
    setUserLoading: (state) => {
      state.loading = true;
      saveState('user', state);
    },
    setUserError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      saveState('user', state);
    }
  }
});

// Export actions
export const { setUser, logout, setUserLoading, setUserError } = userSlice.actions;

// Create and configure the store
const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    user: userSlice.reducer,
    currency: currencyReducer,
  }
});

export default store;
