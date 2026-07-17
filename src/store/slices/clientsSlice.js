import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/clients");
      return response.data.clients;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch clients"
      );
    }
  }
);

export const createClient = createAsyncThunk(
  "clients/createClient",
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/clients", clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create client"
      );
    }
  }
);

export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/clients/${id}`, data);
      return response.data.client;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update client"
      );
    }
  }
);

export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/clients/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete client"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        // action.payload is { success, clientProfile, clientAdmin }
        state.items.unshift(action.payload.clientProfile);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  },
});

export default clientsSlice.reducer;
