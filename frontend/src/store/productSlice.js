import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.category) queryParams.append('category', params.category);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.minRating) queryParams.append('minRating', params.minRating);
      if (params.onSale) queryParams.append('onSale', params.onSale);
      if (params.brand) queryParams.append('brand', params.brand);
      if (params.inStock) queryParams.append('inStock', params.inStock);
      if (params.discount) queryParams.append('discount', params.discount);
      if (params.size) queryParams.append('size', params.size);
      if (params.color) queryParams.append('color', params.color);
      if (params.subcategory) queryParams.append('subcategory', params.subcategory);

      const apiUrl = import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com';
      const response = await axios.get(`${apiUrl}/api/products?${queryParams.toString()}`);
      return {
        ...response.data,
        isLoadMore: params.isLoadMore || false
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    totalProducts: 0,
    loading: false,
    error: null,
    filters: {
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      quickFilter: 'primary',
      minRating: '',
      onSale: '',
      inStock: '',
      discount: '',
      subcategory: ''
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        quickFilter: 'primary',
        minRating: '',
        onSale: '',
        inStock: '',
        discount: '',
        subcategory: ''
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const products = action.payload?.products || [];
        const total = action.payload?.total || 0;

        if (action.payload?.isLoadMore) {
          // Append products for infinite scroll
          const newProducts = products.filter(
            newP => !state.products.some(oldP => oldP._id === newP._id)
          );
          state.products = [...state.products, ...newProducts];
        } else {
          // Replace products for new search/filter
          state.products = products;
        }
        state.totalProducts = total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  }
});

export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;