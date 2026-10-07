// frontend/src/store/store.js - Redux store
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer
  }
});
