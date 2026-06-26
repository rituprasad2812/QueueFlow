import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import queueService from "../../services/queueService";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Play,
  Pause,
  XCircle,
  Clock,
  Users,
  QrCode,
} from "lucide-react";

const QueueSetup = () => {
  // All queues from backend
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form visibility
  const [showForm, setShowForm] = useState(false);

  // QR Code modal
  const [selectedQR, setSelectedQR] = useState(null);

  // New queue form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avgServiceTime: 10,
    maxCapacity: 0,
  });

  const [formLoading, setFormLoading] = useState(false);

  // Fetch queues on page load
  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    try {
      const data = await queueService.getQueues();
      setQueues(data.queues);
    } catch (error) {
      toast.error("Failed to load queues");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create new queue
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Queue name is required");
      return;
    }

    setFormLoading(true);

    try {
      const data = await queueService.createQueue(formData);
      setQueues([data.queue, ...queues]);
      setFormData({ name: "", description: "", avgServiceTime: 10, maxCapacity: 0 });
      setShowForm(false);
      toast.success("Queue created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create queue");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete queue
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this queue?")) return;

    try {
      await queueService.deleteQueue(id);
      setQueues(queues.filter((q) => q._id !== id));
      toast.success("Queue deleted");
    } catch (error) {
      toast.error("Failed to delete queue");
    }
  };

  // Toggle queue status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const data = await queueService.updateQueueStatus(id, newStatus);
      setQueues(queues.map((q) => (q._id === id ? data.queue : q)));
      toast.success(`Queue ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "paused":
        return <Badge variant="warning">Paused</Badge>;
      case "closed":
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">
            Create and manage your queues
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Queue
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Create New Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Queue Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Queue Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. General OPD"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="e.g. General checkup queue"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Avg Service Time */}
                <div className="space-y-2">
                  <Label htmlFor="avgServiceTime">
                    Avg Service Time (minutes)
                  </Label>
                  <Input
                    id="avgServiceTime"
                    name="avgServiceTime"
                    type="number"
                    min="1"
                    value={formData.avgServiceTime}
                    onChange={handleChange}
                  />
                </div>

                {/* Max Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">
                    Max Capacity (0 = unlimited)
                  </Label>
                  <Input
                    id="maxCapacity"
                    name="maxCapacity"
                    type="number"
                    min="0"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create Queue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Queue List */}
      {queues.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold">No queues yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first queue to get started
            </p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Queue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues.map((queue) => (
            <Card key={queue._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{queue.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {queue.description || "No description"}
                    </p>
                  </div>
                  {getStatusBadge(queue.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{queue.avgServiceTime} min/person</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {queue.maxCapacity === 0
                        ? "Unlimited"
                        : `Max ${queue.maxCapacity}`}
                    </span>
                  </div>
                </div>

                {/* Served Today */}
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {queue.totalServedToday}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Served Today
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Status Buttons */}
                  {queue.status !== "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-green-600 hover:text-green-700"
                      onClick={() =>
                        handleStatusChange(queue._id, "active")
                      }
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                  )}

                  {queue.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-yellow-600 hover:text-yellow-700"
                      onClick={() =>
                        handleStatusChange(queue._id, "paused")
                      }
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}

                  {queue.status !== "closed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() =>
                        handleStatusChange(queue._id, "closed")
                      }
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Close
                    </Button>
                  )}

                  {/* QR Code */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedQR(queue)}
                  >
                    <QrCode className="w-3 h-3" />
                  </Button>

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(queue._id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader className="text-center">
              <CardTitle>{selectedQR.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Scan to join queue
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {selectedQR.qrCode && (
                <img
                  src={selectedQR.qrCode}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              )}
              <p className="text-xs text-muted-foreground text-center break-all">
                {`${window.location.origin}/join/${selectedQR._id}`}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedQR(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QueueSetup;