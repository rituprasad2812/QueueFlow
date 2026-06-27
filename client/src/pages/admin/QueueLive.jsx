import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import tokenService from "../../services/tokenService";
import counterService from "../../services/counterService";
import { getSocket } from "../../services/socket";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const QueueLive = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch tokens and counters
  const fetchData = async () => {
    try {
      const [tokenData, counterData] = await Promise.all([
        tokenService.getQueueTokens(queueId),
        counterService.getCounters(),
      ]);

      setData(tokenData);

      // Filter counters for this queue only
      const queueCounters = counterData.counters.filter(
        (c) => c.queueId?._id === queueId || c.queueId === queueId
      );
      setCounters(queueCounters);
    } catch (error) {
      toast.error("Failed to load queue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Socket.io real-time updates
    const socket = getSocket();
    socket.emit("join:queue", { queueId });

    socket.on("token:new", () => fetchData());
    socket.on("token:called", () => fetchData());
    socket.on("token:serving", () => fetchData());
    socket.on("token:completed", () => fetchData());
    socket.on("token:no_show", () => fetchData());
    socket.on("token:cancelled", () => fetchData());
    socket.on("positions:updated", () => fetchData());

    return () => {
      socket.off("token:new");
      socket.off("token:called");
      socket.off("token:serving");
      socket.off("token:completed");
      socket.off("token:no_show");
      socket.off("token:cancelled");
      socket.off("positions:updated");
    };
  }, [queueId]);

  // Call next waiting customer
  const handleCallNext = async (counterId) => {
    try {
      setActionLoading("call");

      // Get next waiting token
      const nextData = await tokenService.getNextToken(queueId);

      if (!nextData.token) {
        toast.error("No one is waiting");
        return;
      }

      // Call that token
      await tokenService.callToken(nextData.token._id, counterId);
      toast.success(`Called ${nextData.token.tokenNumber}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to call next");
    } finally {
      setActionLoading(null);
    }
  };

  // Start serving
  const handleServe = async (tokenId) => {
    try {
      setActionLoading(tokenId);
      await tokenService.serveToken(tokenId);
      toast.success("Now serving");
      fetchData();
    } catch (error) {
      toast.error("Failed to start serving");
    } finally {
      setActionLoading(null);
    }
  };

  // Complete
  const handleComplete = async (tokenId) => {
    try {
      setActionLoading(tokenId);
      await tokenService.completeToken(tokenId);
      toast.success("Completed!");
      fetchData();
    } catch (error) {
      toast.error("Failed to complete");
    } finally {
      setActionLoading(null);
    }
  };

  // No show
  const handleNoShow = async (tokenId) => {
    try {
      setActionLoading(tokenId);
      await tokenService.noShowToken(tokenId);
      toast.success("Marked as no show");
      fetchData();
    } catch (error) {
      toast.error("Failed to mark no show");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard/queues")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Live Queue View</h1>
          <p className="text-muted-foreground">
            Manage customers in real-time
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <SummaryCard
            label="Waiting"
            count={data.summary.waiting}
            color="blue"
            icon={Users}
          />
          <SummaryCard
            label="Called"
            count={data.summary.called}
            color="yellow"
            icon={Phone}
          />
          <SummaryCard
            label="Serving"
            count={data.summary.serving}
            color="purple"
            icon={Clock}
          />
          <SummaryCard
            label="Completed"
            count={data.summary.completed}
            color="green"
            icon={CheckCircle2}
          />
          <SummaryCard
            label="No Show"
            count={data.summary.noShow}
            color="red"
            icon={AlertTriangle}
          />
        </div>
      )}

      {/* Call Next Buttons (one per counter) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Call Next Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {counters.length > 0 ? (
              counters.map((counter) => (
                <Button
                  key={counter._id}
                  onClick={() => handleCallNext(counter._id)}
                  disabled={actionLoading === "call"}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === "call" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Phone className="w-4 h-4 mr-2" />
                  )}
                  Call Next → {counter.name}
                </Button>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No counters found. Create counters first.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Waiting ({data?.tokens?.waiting?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.tokens?.waiting?.length > 0 ? (
              data.tokens.waiting.map((token) => (
                <TokenRow
                  key={token._id}
                  token={token}
                  status="waiting"
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No one waiting
              </p>
            )}
          </CardContent>
        </Card>

        {/* Called / Serving */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-yellow-600" />
              Called & Serving (
              {(data?.tokens?.called?.length || 0) +
                (data?.tokens?.serving?.length || 0)}
              )
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Called tokens */}
            {data?.tokens?.called?.map((token) => (
              <div
                key={token._id}
                className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50 border-yellow-200"
              >
                <div>
                  <p className="font-bold text-lg">{token.tokenNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {token.customerName}
                  </p>
                  <Badge variant="warning" className="mt-1">Called</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleServe(token._id)}
                    disabled={actionLoading === token._id}
                  >
                    {actionLoading === token._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Serve"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleNoShow(token._id)}
                    disabled={actionLoading === token._id}
                  >
                    No Show
                  </Button>
                </div>
              </div>
            ))}

            {/* Serving tokens */}
            {data?.tokens?.serving?.map((token) => (
              <div
                key={token._id}
                className="flex items-center justify-between p-3 rounded-lg border bg-purple-50 border-purple-200"
              >
                <div>
                  <p className="font-bold text-lg">{token.tokenNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {token.customerName}
                  </p>
                  <Badge className="mt-1 bg-purple-500">Serving</Badge>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleComplete(token._id)}
                  disabled={actionLoading === token._id}
                >
                  {actionLoading === token._id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Complete
                    </>
                  )}
                </Button>
              </div>
            ))}

            {/* Empty state */}
            {!data?.tokens?.called?.length &&
              !data?.tokens?.serving?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No one called yet
                </p>
              )}
          </CardContent>
        </Card>

        {/* Completed Today */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Completed ({data?.tokens?.completed?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {data?.tokens?.completed?.length > 0 ? (
              data.tokens.completed.map((token) => (
                <TokenRow
                  key={token._id}
                  token={token}
                  status="completed"
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No one completed yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* No Shows */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              No Shows ({data?.tokens?.noShow?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {data?.tokens?.noShow?.length > 0 ? (
              data.tokens.noShow.map((token) => (
                <TokenRow
                  key={token._id}
                  token={token}
                  status="no_show"
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No no-shows today
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ label, count, color, icon: Icon }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className={`rounded-xl p-4 text-center ${colors[color].split(" ")[0]}`}>
      <Icon className={`w-5 h-5 mx-auto mb-1 ${colors[color].split(" ")[1]}`} />
      <p className={`text-2xl font-bold ${colors[color].split(" ")[1]}`}>
        {count}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

// Token Row Component
const TokenRow = ({ token, status }) => {
  const statusColors = {
    waiting: "bg-blue-50",
    completed: "bg-green-50",
    no_show: "bg-red-50",
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${statusColors[status] || "bg-gray-50"}`}>
      <div className="flex items-center gap-3">
        <span className="font-bold text-lg">{token.tokenNumber}</span>
        <div>
          <p className="text-sm font-medium">{token.customerName}</p>
          {token.customerPhone && (
            <p className="text-xs text-muted-foreground">
              {token.customerPhone}
            </p>
          )}
        </div>
      </div>
      {status === "waiting" && (
        <Badge variant="outline">
          Position {token.position}
        </Badge>
      )}
    </div>
  );
};

export default QueueLive;