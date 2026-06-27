import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import tokenService from "../../services/tokenService";
import queueService from "../../services/queueService";
import toast from "react-hot-toast";
import {
  Clock,
  Users,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const JoinPage = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();

  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
  });

  // Load queue info
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const data = await fetch(
          `http://localhost:5000/api/queues/${queueId}/public`
        );
        const result = await data.json();

        if (result.success) {
          setQueue(result.queue);
        } else {
          toast.error(result.message || "Queue not found");
        }
      } catch (error) {
        toast.error("Failed to load queue info");
      } finally {
        setLoading(false);
      }
    };

    if (queueId) {
      fetchQueue();
    }
  }, [queueId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!formData.customerName) {
      toast.error("Please enter your name");
      return;
    }

    setJoining(true);

    try {
      const data = await tokenService.joinQueue({
        queueId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
      });

      toast.success(`Welcome! Your token is ${data.token.tokenNumber}`);

      // Navigate to tracking page
      navigate(`/track/${data.token.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join queue");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-bold">Queue Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The queue you are looking for doesn't exist or has been closed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {/* Queue Info Card */}
        <Card>
          <CardHeader className="text-center pb-3">
            <Badge
              variant={queue.status === "active" ? "success" : "destructive"}
              className="w-fit mx-auto mb-2"
            >
              {queue.status === "active" ? "Accepting Customers" : "Not Available"}
            </Badge>
            <CardTitle className="text-2xl">{queue.name}</CardTitle>
            {queue.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {queue.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Business Name */}
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{queue.business?.name}</span>
            </div>

            {/* Current Wait */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">
                  {queue.waitingCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  People Waiting
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-600">
                  {queue.estimatedWait}
                </p>
                <p className="text-xs text-muted-foreground">
                  Min Wait
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Join Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Join This Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Your Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Enter your full name"
                  value={formData.customerName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">
                  Phone (optional, for SMS updates)
                </Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.customerPhone}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={joining || queue.status !== "active"}
              >
                {joining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Get My Token
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By joining, you agree to be notified when your turn is near.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinPage;