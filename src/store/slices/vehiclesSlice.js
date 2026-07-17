import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/vehicle");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch vehicles"
      );
    }
  }
);

export const fetchVehiclesByClient = createAsyncThunk(
  "vehicles/fetchVehiclesByClient",
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/vehicle/client/${clientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch client vehicles"
      );
    }
  }
);

export const createVehicle = createAsyncThunk(
  "vehicles/createVehicle",
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/vehicle", vehicleData);
      return response.data.vehicle || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to register vehicle"
      );
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "vehicles/updateVehicle",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/vehicle/${id}`, data);
      return response.data.vehicle || response.data; // Handles different response schemas
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update vehicle"
      );
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "vehicles/deleteVehicle",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/vehicle/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete vehicle"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehiclesByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVehiclesByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (v) => v._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.items = state.items.filter((v) => v._id !== action.payload);
      });
  },
});

export default vehiclesSlice.reducer;
