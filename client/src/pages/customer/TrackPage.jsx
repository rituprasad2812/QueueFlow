import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import tokenService from "../../services/tokenService";
import { getSocket } from "../../services/socket";
import toast from "react-hot-toast";
import {
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Bell,
} from "lucide-react";

const TrackPage = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial fetch + Socket.io setup
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const data = await tokenService.trackToken(tokenId);
        setToken(data.token);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load token");
      } finally {
        setLoading(false);
      }
    };

    if (tokenId) {
      fetchToken();

      // Connect to socket and join token room
      const socket = getSocket();

      socket.emit("join:token", { tokenId });

      // Listen for YOUR personal updates
      socket.on("your:turn", (data) => {
        toast.success(`🔔 It's your turn! Token ${data.tokenNumber}`);
        fetchToken();
      });

      socket.on("your:serving", () => {
        fetchToken();
      });

      socket.on("your:completed", () => {
        toast.success("✅ Service complete!");
        fetchToken();
      });

      socket.on("your:no_show", () => {
        toast.error("You were marked as no-show");
        fetchToken();
      });

      // Listen for POSITION UPDATES
      socket.on("positions:updated", (data) => {
        const update = data.positions.find((p) => p.tokenId === tokenId);
        if (update) {
          setToken((prev) => prev ? {
            ...prev,
            position: update.position,
            estimatedWaitMinutes: update.estimatedWaitMinutes,
          } : prev);
        }
      });

      // Cleanup on unmount
      return () => {
        socket.off("your:turn");
        socket.off("your:serving");
        socket.off("your:completed");
        socket.off("your:no_show");
        socket.off("positions:updated");
      };
    }
  }, [tokenId]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to leave the queue?")) return;

    try {
      await tokenService.cancelToken(tokenId);
      toast.success("You have left the queue");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-bold">Token Not Found</h2>
            <p className="text-muted-foreground mt-2">
              {error || "This token doesn't exist or has expired."}
            </p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Status display
  const renderStatusContent = () => {
    switch (token.status) {
      case "waiting":
        return (
          <>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white text-center">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-90" />
              <p className="text-sm opacity-90">You are number</p>
              <p className="text-7xl font-bold my-2">{token.position}</p>
              <p className="text-sm opacity-90">in the queue</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3 border border-orange-200">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Estimated wait: {token.estimatedWaitMinutes} minutes
                </p>
                <p className="text-xs text-orange-700">
                  Live updates • No need to refresh
                </p>
              </div>
            </div>
          </>
        );

      case "called":
        return (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center animate-pulse">
            <Bell className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm opacity-90">Please come to</p>
            <p className="text-3xl font-bold my-2">
              {token.counter?.name || "Counter"}
            </p>
            <p className="text-lg">Your turn is NOW!</p>
          </div>
        );

      case "serving":
        return (
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg font-semibold">You're being served</p>
            <p className="text-sm opacity-90 mt-1">
              Thank you for your patience!
            </p>
          </div>
        );

      case "completed":
        return (
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg font-semibold">Service Complete</p>
            <p className="text-sm opacity-90 mt-1">Thank you for visiting!</p>
          </div>
        );

      case "no_show":
        return (
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 text-white text-center">
            <XCircle className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg font-semibold">Missed your turn</p>
            <p className="text-sm opacity-90 mt-1">
              Please join the queue again if needed.
            </p>
          </div>
        );

      case "cancelled":
        return (
          <div className="bg-gray-500 rounded-2xl p-8 text-white text-center">
            <XCircle className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg font-semibold">Queue Cancelled</p>
            <p className="text-sm opacity-90 mt-1">
              You have left the queue.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-8 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {token.queue?.name || "Queue"}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {token.business?.name}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Your Token Number
            </p>
            <p className="text-6xl font-bold text-primary my-2">
              {token.tokenNumber}
            </p>
            <Badge variant="outline">{token.customerName}</Badge>
          </CardContent>
        </Card>

        {renderStatusContent()}

        {["waiting", "called"].includes(token.status) && (
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleCancel}
          >
            Leave Queue
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live updates active
        </p>
      </div>
    </div>
  );
};

export default TrackPage;