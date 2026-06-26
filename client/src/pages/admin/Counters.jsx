import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import counterService from "../../services/counterService";
import queueService from "../../services/queueService";
import toast from "react-hot-toast";
import { Plus, Trash2, Monitor } from "lucide-react";

const Counters = () => {
  const [counters, setCounters] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    queueId: "",
  });

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
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.queueId) {
      toast.error("Name and Queue are required");
      return;
    }

    setFormLoading(true);

    try {
      const data = await counterService.createCounter(formData);
      setCounters([...counters, data.counter]);
      setFormData({ name: "", queueId: "" });
      setShowForm(false);
      toast.success("Counter created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create counter");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this counter?")) return;

    try {
      await counterService.deleteCounter(id);
      setCounters(counters.filter((c) => c._id !== id));
      toast.success("Counter deleted");
    } catch (error) {
      toast.error("Failed to delete");
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
          <h1 className="text-2xl font-bold">Counter Management</h1>
          <p className="text-muted-foreground">
            Create counters and assign them to queues
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Counter
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Create New Counter</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Counter Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. Counter 1, Dr. Smith Room"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="queueId">Assign to Queue *</Label>
                  <Select
                    id="queueId"
                    name="queueId"
                    value={formData.queueId}
                    onChange={handleChange}
                  >
                    <option value="">Select Queue</option>
                    {queues.map((q) => (
                      <option key={q._id} value={q._id}>
                        {q.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create Counter"}
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

      {/* Counter List */}
      {counters.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-4xl mb-4">🖥️</div>
            <h3 className="text-lg font-semibold">No counters yet</h3>
            <p className="text-muted-foreground mt-1">
              Create counters to start serving customers
            </p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Counter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counters.map((counter) => (
            <Card key={counter._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {counter.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {counter.queueId?.name || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={counter.status === "active" ? "success" : "secondary"}>
                    {counter.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Served today: {counter.totalServedToday}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500"
                    onClick={() => handleDelete(counter._id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Counters;