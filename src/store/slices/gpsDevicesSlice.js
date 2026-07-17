import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

export const fetchDevices = createAsyncThunk(
  "gpsDevices/fetchDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/gps");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch GPS devices"
      );
    }
  }
);

export const createDevice = createAsyncThunk(
  "gpsDevices/createDevice",
  async (deviceData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/gps", deviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to register GPS device"
      );
    }
  }
);

export const updateDevice = createAsyncThunk(
  "gpsDevices/updateDevice",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/gps/${id}`, data);
      return response.data.device;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update GPS device"
      );
    }
  }
);

export const deleteDevice = createAsyncThunk(
  "gpsDevices/deleteDevice",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/gps/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete GPS device"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const gpsDevicesSlice = createSlice({
  name: "gpsDevices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDevice.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d._id !== action.payload);
      });
  },
});

export default gpsDevicesSlice.reducer;
