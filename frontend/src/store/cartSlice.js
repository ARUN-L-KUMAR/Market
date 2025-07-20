import { createSlice } from '@reduxjs/toolkit';

// Helper for localStorage
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

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: loadState('cart', { items: [] }),
  reducers: {
    addToCart: (state, action) => {
      const item = state.items.find(i => i.product._id === action.payload.product._id);
      if (item) {
        item.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveState('cart', state);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.product._id !== action.payload);
      saveState('cart', state);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(i => i.product._id === productId);
      if (item) {
        item.quantity = quantity;
      }
      saveState('cart', state);
    },
    clearCart: (state) => {
      state.items = [];
      saveState('cart', state);
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;