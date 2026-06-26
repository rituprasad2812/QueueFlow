import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Loader while checking auth
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protect admin routes
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/staff" replace />;
  return children;
};

// Protect staff routes
export const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "staff") return <Navigate to="/dashboard" replace />;
  return children;
};

// Redirect if already logged in
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) {
    return user.role === "admin"
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/staff" replace />;
  }
  return children;
};