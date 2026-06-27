import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import counterService from "../../services/counterService";
import queueService from "../../services/queueService";
import tokenService from "../../services/tokenService";
import { getSocket } from "../../services/socket";
import toast from "react-hot-toast";
import {
  Phone,
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  LogOut,
  Loader2,
  Zap,
  AlertTriangle,
} from "lucide-react";

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [counters, setCounters] = useState([]);
  const [queues, setQueues] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [nextToken, setNextToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Load counters and queues
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [counterData, queueData] = await Promise.all([
          counterService.getCounters(),
          queueService.getQueues(),
        ]);
        setCounters(counterData.counters);
        setQueues(queueData.queues);

        // Auto-select first counter
        // Find counter assigned to THIS staff member
        if (counterData.counters.length > 0) {
          const myCounter = counterData.counters.find(
            (c) =>
              c.staffId?._id === user?.id ||
              c.staffId === user?.id
          );

          const counter = myCounter || counterData.counters[0];
          setSelectedCounter(counter);

          const queueId = counter.queueId?._id || counter.queueId;
          if (queueId) {
            setSelectedQueue(queueId);
            await loadQueueData(queueId);
          }
        }
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Socket.io for real-time updates
  useEffect(() => {
    if (!selectedQueue) return;

    const socket = getSocket();
    socket.emit("join:queue", { queueId: selectedQueue });

    socket.on("token:new", () => loadQueueData(selectedQueue));
    socket.on("token:called", () => loadQueueData(selectedQueue));
    socket.on("token:completed", () => loadQueueData(selectedQueue));
    socket.on("token:no_show", () => loadQueueData(selectedQueue));
    socket.on("token:cancelled", () => loadQueueData(selectedQueue));
    socket.on("positions:updated", () => loadQueueData(selectedQueue));

    return () => {
      socket.off("token:new");
      socket.off("token:called");
      socket.off("token:completed");
      socket.off("token:no_show");
      socket.off("token:cancelled");
      socket.off("positions:updated");
    };
  }, [selectedQueue]);

  const loadQueueData = async (queueId) => {
    try {
      const data = await tokenService.getQueueTokens(queueId);
      setWaitingCount(data.summary.waiting);

      // Find current serving/called token for this counter
      const calledOrServing = [
        ...data.tokens.called,
        ...data.tokens.serving,
      ];
      const myToken = selectedCounter
        ? calledOrServing.find(
          (t) =>
            t.counterId?._id === selectedCounter._id ||
            t.counterId === selectedCounter._id
        )
        : calledOrServing[0];

      setCurrentToken(myToken || null);

      // Get next waiting token
      if (data.tokens.waiting.length > 0) {
        setNextToken(data.tokens.waiting[0]);
      } else {
        setNextToken(null);
      }
    } catch (error) {
      console.log("Load queue data error:", error.message);
    }
  };

  // Call next
  const handleCallNext = async () => {
    if (!selectedQueue || !selectedCounter) {
      toast.error("No counter selected");
      return;
    }

    try {
      setActionLoading("call");
      const nextData = await tokenService.getNextToken(selectedQueue);

      if (!nextData.token) {
        toast.error("No one is waiting");
        return;
      }

      await tokenService.callToken(nextData.token._id, selectedCounter._id);
      toast.success(`Called ${nextData.token.tokenNumber}`);
      await loadQueueData(selectedQueue);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to call next");
    } finally {
      setActionLoading(null);
    }
  };

  // Serve
  const handleServe = async () => {
    if (!currentToken) return;

    try {
      setActionLoading("serve");
      await tokenService.serveToken(currentToken._id);
      toast.success("Now serving");
      await loadQueueData(selectedQueue);
    } catch (error) {
      toast.error("Failed to serve");
    } finally {
      setActionLoading(null);
    }
  };

  // Complete
  const handleComplete = async () => {
    if (!currentToken) return;

    try {
      setActionLoading("complete");
      await tokenService.completeToken(currentToken._id);
      toast.success("Completed!");
      await loadQueueData(selectedQueue);
    } catch (error) {
      toast.error("Failed to complete");
    } finally {
      setActionLoading(null);
    }
  };

  // No show
  const handleNoShow = async () => {
    if (!currentToken) return;

    try {
      setActionLoading("noshow");
      await tokenService.noShowToken(currentToken._id);
      toast.success("Marked as no show");
      await loadQueueData(selectedQueue);
    } catch (error) {
      toast.error("Failed to mark no show");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">QueueFlow</h1>
            <p className="text-xs text-muted-foreground">Staff Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedCounter?.name || "No Counter"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Counter Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Counter</p>
                <p className="text-2xl font-bold">
                  {selectedCounter?.name || "Not Assigned"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {waitingCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Waiting</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Token */}
        {currentToken ? (
          <Card className="border-2 border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Now Serving</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-6xl font-bold text-primary">
                  {currentToken.tokenNumber}
                </p>
                <p className="text-lg text-muted-foreground mt-1">
                  {currentToken.customerName}
                </p>
                <Badge
                  variant={
                    currentToken.status === "called" ? "warning" : "default"
                  }
                  className="mt-2"
                >
                  {currentToken.status === "called"
                    ? "Called - Waiting to arrive"
                    : "Being Served"}
                </Badge>
              </div>

              <div className="flex gap-3">
                {currentToken.status === "called" && (
                  <>
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handleServe}
                      disabled={actionLoading === "serve"}
                    >
                      {actionLoading === "serve" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Start Serving"
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleNoShow}
                      disabled={actionLoading === "noshow"}
                    >
                      {actionLoading === "noshow" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          No Show
                        </>
                      )}
                    </Button>
                  </>
                )}

                {currentToken.status === "serving" && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleComplete}
                    disabled={actionLoading === "complete"}
                  >
                    {actionLoading === "complete" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Call Next Button */
          <Card className="text-center py-8">
            <CardContent>
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />

              {nextToken ? (
                <>
                  <p className="text-muted-foreground mb-2">
                    Next in line: <strong>{nextToken.tokenNumber}</strong> -{" "}
                    {nextToken.customerName}
                  </p>
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
                    onClick={handleCallNext}
                    disabled={actionLoading === "call"}
                  >
                    {actionLoading === "call" ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Phone className="w-5 h-5 mr-2" />
                    )}
                    CALL NEXT
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold">No one is waiting</p>
                  <p className="text-muted-foreground mt-1">
                    Customers will appear here when they join the queue
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Up Preview */}
        {nextToken && currentToken && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Next Up
                  </p>
                  <p className="font-bold text-lg">{nextToken.tokenNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {nextToken.customerName}
                  </p>
                </div>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  Position {nextToken.position}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;