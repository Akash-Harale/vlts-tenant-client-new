import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import clientsReducer from "./slices/clientsSlice";
import usersReducer from "./slices/usersSlice";
import gpsDevicesReducer from "./slices/gpsDevicesSlice";
import vehiclesReducer from "./slices/vehiclesSlice";
import allocationsReducer from "./slices/allocationsSlice";
import mappingsReducer from "./slices/mappingsSlice";
import rolesReducer from "./slices/rolesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    users: usersReducer,
    gpsDevices: gpsDevicesReducer,
    vehicles: vehiclesReducer,
    allocations: allocationsReducer,
    mappings: mappingsReducer,
    roles: rolesReducer,
  },
});
