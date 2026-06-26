import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import toast from "react-hot-toast";

const Login = () => {
  // STATE: stores what user types in the form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // STATE: tracks if form is loading (so we can disable button)
  const [loading, setLoading] = useState(false);

  // NAVIGATE: lets us redirect to another page after login
  const navigate = useNavigate();

  // AUTH: gives us the login function from our AuthContext
  const { login } = useAuth();

  // HANDLER: runs every time user types in any input field
  const handleChange = (e) => {
    setFormData({
      ...formData,              // keep all other fields same
      [e.target.name]: e.target.value,  // update only this field
    });
  };

  // HANDLER: runs when user clicks "Login" button
  const handleSubmit = async (e) => {
    e.preventDefault();  // stops page from refreshing

    // Simple validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // Call the login function from AuthContext
      // This sends POST request to backend
      // Stores token in localStorage
      // Sets user in context
      await login(formData);

      toast.success("Login successful!");

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Show error message from backend
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">
            Welcome Back 👋
          </CardTitle>
          <CardDescription>
            Login to your QueueFlow dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@clinic.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;