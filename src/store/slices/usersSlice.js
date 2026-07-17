import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/user");
      return response.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/user", userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/user/${id}`, data);
      // Backend just returns success: true, or similar. We refresh list or return data
      return { id, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/user/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.items.findIndex((u) => u._id === action.payload.id);
        if (index !== -1) {
          // Employee designation and mobile_number are nested under employee_id
          const userObj = state.items[index];
          if (userObj.employee_id) {
            userObj.employee_id = {
              ...userObj.employee_id,
              designation: action.payload.data.designation || userObj.employee_id.designation,
              mobile_number: action.payload.data.mobile_number || userObj.employee_id.mobile_number,
            };
          }
          // Note: role could be populated string/object or roleName
          // Normally we re-fetch to get populated fields. But we can set locally or do fetchUsers.
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u._id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
