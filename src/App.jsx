import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Users from "./pages/Users";
import GPSDevices from "./pages/GPSDevices";
import Vehicles from "./pages/Vehicles";
import GPSAllocation from "./pages/GPSAllocation";
import VehicleDeviceMap from "./pages/VehicleDeviceMap";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Clients />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Users />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/gps-devices"
          element={
            <ProtectedRoute>
              <MainLayout>
                <GPSDevices />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Vehicles />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/allocations"
          element={
            <ProtectedRoute>
              <MainLayout>
                <GPSAllocation />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mappings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VehicleDeviceMap />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
