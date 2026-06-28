import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminRoute, StaffRoute, GuestRoute } from "./components/shared/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import JoinPage from "./pages/customer/JoinPage.jsx";
import TrackPage from "./pages/customer/TrackPage.jsx";

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