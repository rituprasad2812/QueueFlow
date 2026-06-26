import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AdminRoute, StaffRoute, GuestRoute } from "./components/shared/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import JoinPage from "./pages/customer/JoinPage";
import TrackPage from "./pages/customer/TrackPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/join/:queueId" element={<JoinPage />} />
          <Route path="/track/:tokenId" element={<TrackPage />} />
          <Route path="/q/:qrCode" element={<JoinPage />} />

          {/* Guest only */}
          <Route path="/login" element={
            <GuestRoute><Login /></GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute><Register /></GuestRoute>
          } />

          {/* Admin only */}
          <Route path="/dashboard/*" element={
            <AdminRoute><Dashboard /></AdminRoute>
          } />

          {/* Staff only */}
          <Route path="/staff/*" element={
            <StaffRoute><StaffDashboard /></StaffRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;