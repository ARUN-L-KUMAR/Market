import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com';

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

// Async thunks for API calls
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      if (!user.token) {
        return { wishlist: [] };
      }
      
      const response = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addToWishlist',
  async (product, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      if (!user.token) {
        throw new Error('Not authenticated');
      }
      
      await axios.post(`${API_URL}/api/wishlist/${product._id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return product;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      if (!user.token) {
        throw new Error('Not authenticated');
      }
      
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      return productId;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

// Wishlist slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadState('wishlist_items', []),
    loading: false,
    error: null
  },
  reducers: {
    // Sync actions for immediate UI updates (will be reconciled with server)
    addToWishlist: (state, action) => {
      const exists = state.items.some(item => item._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
        saveState('wishlist_items', state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      saveState('wishlist_items', state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveState('wishlist_items', state.items);
    },
    setWishlistItems: (state, action) => {
      state.items = action.payload;
      saveState('wishlist_items', state.items);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const wishlistData = action.payload.wishlist || [];
        // Extract products from wishlist items
        state.items = wishlistData.map(item => item.product).filter(Boolean);
        saveState('wishlist_items', state.items);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to wishlist
      .addCase(addToWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.items.some(item => item._id === action.payload._id);
        if (!exists) {
          state.items.push(action.payload);
          saveState('wishlist_items', state.items);
        }
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from wishlist
      .addCase(removeFromWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
        saveState('wishlist_items', state.items);
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlistItems, clearError } = wishlistSlice.actions;
export default wishlistSlice.reducer;