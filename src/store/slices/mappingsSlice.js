import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

export const fetchMappings = createAsyncThunk(
  "mappings/fetchMappings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/assignments/gps-vehicle");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vehicle-device mappings"
      );
    }
  }
);

export const mapDevice = createAsyncThunk(
  "mappings/mapDevice",
  async (mappingData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/assignments/gps-vehicle", mappingData);
      return response.data.mapping || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to map GPS device to vehicle"
      );
    }
  }
);

export const updateMapping = createAsyncThunk(
  "mappings/updateMapping",
  async ({ deviceId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/assignments/gps-vehicle/${deviceId}`, data);
      return response.data.mapping || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update mapping"
      );
    }
  }
);

export const unmapDevice = createAsyncThunk(
  "mappings/unmapDevice",
  async (deviceId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/assignments/gps-vehicle/${deviceId}`);
      return deviceId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unmap GPS device"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const mappingsSlice = createSlice({
  name: "mappings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMappings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMappings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMappings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(mapDevice.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateMapping.fulfilled, (state, action) => {
        // Redux slice does fetchMappings normally. For local update:
        const index = state.items.findIndex(
          (m) => m.gps_device_id?._id === action.payload.gps_device_id?._id || m.gps_device_id === action.payload.gps_device_id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(unmapDevice.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (m) => m.gps_device_id?._id !== action.payload && m.gps_device_id !== action.payload
        );
      });
  },
});

export default mappingsSlice.reducer;
