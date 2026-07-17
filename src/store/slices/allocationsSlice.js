import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

export const fetchAllocations = createAsyncThunk(
  "allocations/fetchAllocations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/gps-allocations");
      return response.data.allocations || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch GPS allocations"
      );
    }
  }
);

export const allocateGps = createAsyncThunk(
  "allocations/allocateGps",
  async (allocationData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/gps-allocations", allocationData);
      return response.data.allocation || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to allocate GPS device"
      );
    }
  }
);

export const unallocateGps = createAsyncThunk(
  "allocations/unallocateGps",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/gps-allocations/${id}/unallocate`);
      return response.data.allocation || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unallocate GPS device"
      );
    }
  }
);

export const deleteAllocation = createAsyncThunk(
  "allocations/deleteAllocation",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/gps-allocations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete allocation record"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const allocationsSlice = createSlice({
  name: "allocations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(allocateGps.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(unallocateGps.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (a) => a._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteAllocation.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a._id !== action.payload);
      });
  },
});

export default allocationsSlice.reducer;
