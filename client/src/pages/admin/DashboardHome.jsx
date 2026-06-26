import { useAuth } from "../../context/AuthContext";

const DashboardHome = () => {
  const { user } = useAuth();

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
          value="0"
          description="Right now"
          color="blue"
        />
        <StatCard
          title="Served Today"
          value="0"
          description="Completed"
          color="green"
        />
        <StatCard
          title="Avg Wait Time"
          value="0 min"
          description="Today's average"
          color="purple"
        />
        <StatCard
          title="No Shows"
          value="0"
          description="Today"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Create Queue"
            description="Set up a new queue for your business"
            href="/dashboard/queues"
            emoji="➕"
          />
          <QuickAction
            title="Add Staff"
            description="Invite staff members to manage counters"
            href="/dashboard/staff"
            emoji="👥"
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

// Stat Card Component
const StatCard = ({ title, value, description, color }) => {
  const colors = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red:    "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${colors[color].split(" ")[1]}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
};

// Quick Action Component
const QuickAction = ({ title, description, href, emoji }) => {
  return (
    <a
      href={href}
      className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
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