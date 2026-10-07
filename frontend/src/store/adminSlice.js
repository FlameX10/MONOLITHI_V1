// frontend/src/store/adminSlice.js - Redux slice for admin state
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const submitPipeline = createAsyncThunk(
  'admin/submitPipeline',
  async ({ mineId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/admin/submit?mine_id=${mineId}&start_date=${startDate}&end_date=${endDate}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to submit pipeline');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const pollTaskStatus = createAsyncThunk(
  'admin/pollTaskStatus',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/admin/status/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task status');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  selectedMines: Array.from({ length: 11 }, () => false),
  startDate: '2025-01-01',
  endDate: '2025-08-01',
  tasks: {}, // taskId -> { status, progress, result, error }
  loading: false,
  error: null
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    toggleMine: (state, action) => {
      state.selectedMines[action.payload] = !state.selectedMines[action.payload];
    },
    toggleSelectAll: (state) => {
      const allSelected = state.selectedMines.every(Boolean);
      state.selectedMines = Array.from({ length: 11 }, () => !allSelected);
    },
    setDateRange: (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPipeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitPipeline.fulfilled, (state, action) => {
        state.loading = false;
        const taskId = action.payload.task_id;
        state.tasks[taskId] = {
          status: 'queued',
          progress: 0,
          result: null,
          error: null
        };
      })
      .addCase(submitPipeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(pollTaskStatus.fulfilled, (state, action) => {
        const { task_id, status, progress, result, error } = action.payload;
        state.tasks[task_id] = { status, progress, result, error };
      })
      .addCase(pollTaskStatus.rejected, (state, action) => {
        // Handle polling error gracefully - don't crash UI
        console.error('Poll error:', action.payload);
      });
  }
});

export const { toggleMine, toggleSelectAll, setDateRange, clearError } = adminSlice.actions;
export default adminSlice.reducer;
