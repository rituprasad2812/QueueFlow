import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import queueService from "../../services/queueService";
import tokenService from "../../services/tokenService";
import toast from "react-hot-toast";

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalWaiting: 0,
    totalServed: 0,
    totalNoShow: 0,
    totalQueues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const queueData = await queueService.getQueues();
        const queues = queueData.queues;

        let totalWaiting = 0;
        let totalServed = 0;
        let totalNoShow = 0;

        for (const queue of queues) {
          try {
            const tokenData = await tokenService.getQueueTokens(queue._id);
            totalWaiting += tokenData.summary.waiting;
            totalServed += tokenData.summary.completed;
            totalNoShow += tokenData.summary.noShow;
          } catch (err) {
            // Queue might have no tokens yet
          }
        }

        setStats({
          totalWaiting,
          totalServed,
          totalNoShow,
          totalQueues: queues.length,
        });
      } catch (error) {
        toast.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Good morning, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening at {user?.business?.name} today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total in Queue"
          value={stats.totalWaiting}
          description="Right now"
          color="blue"
        />
        <StatCard
          title="Served Today"
          value={stats.totalServed}
          description="Completed"
          color="green"
        />
        <StatCard
          title="Active Queues"
          value={stats.totalQueues}
          description="Running"
          color="purple"
        />
        <StatCard
          title="No Shows"
          value={stats.totalNoShow}
          description="Today"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Manage Queues"
            description="Open live view to manage customers"
            href="/dashboard/queues"
            emoji="📋"
          />
          <QuickAction
            title="Add Counters"
            description="Set up service counters"
            href="/dashboard/counters"
            emoji="🖥️"
          />
          <QuickAction
            title="View Analytics"
            description="See peak hours and wait time trends"
            href="/dashboard/analytics"
            emoji="📊"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, description, color }) => {
  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    red: "text-red-600",
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${colors[color]}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
};

const QuickAction = ({ title, description, href, emoji }) => {
  return (
    <a
      href={href}
      className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </a>
  );
};

export default DashboardHome;