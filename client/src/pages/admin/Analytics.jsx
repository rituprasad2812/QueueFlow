import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import analyticsService from "../../services/analyticsService";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, peakData, weeklyData] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getPeakHours(),
          analyticsService.getWeeklyStats(),
        ]);
        setOverview(overviewData.overview);
        setPeakHours(peakData.peakHours);
        setWeekly(weeklyData.weekly);
      } catch (error) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and performance metrics
        </p>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total Today"
            value={overview.totalTokens}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Served"
            value={overview.totalServed}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            label="Waiting"
            value={overview.totalWaiting}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            label="No Shows"
            value={overview.totalNoShow}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            label="Avg Wait"
            value={`${overview.avgWaitTime}m`}
            icon={Clock}
            color="purple"
          />
          <StatCard
            label="Avg Service"
            value={`${overview.avgServiceTime}m`}
            icon={TrendingUp}
            color="indigo"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Today's Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours.filter((h) => h.customers > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="customers"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {peakHours.filter((h) => h.customers > 0).length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                No data yet for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="served"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Served"
                  />
                  <Line
                    type="monotone"
                    dataKey="noShow"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="No Show"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Breakdown Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Weekly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Day</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-center py-3 px-4 font-medium">Total</th>
                    <th className="text-center py-3 px-4 font-medium">Served</th>
                    <th className="text-center py-3 px-4 font-medium">No Show</th>
                  </tr>
                </thead>
                <tbody>
                  {weekly.map((day) => (
                    <tr key={day.date} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{day.day}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {day.date}
                      </td>
                      <td className="py-3 px-4 text-center">{day.total}</td>
                      <td className="py-3 px-4 text-center text-green-600 font-medium">
                        {day.served}
                      </td>
                      <td className="py-3 px-4 text-center text-red-600 font-medium">
                        {day.noShow}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className={`rounded-xl p-4 ${colors[color].split(" ")[0]}`}>
      <Icon className={`w-5 h-5 mb-2 ${colors[color].split(" ")[1]}`} />
      <p className={`text-2xl font-bold ${colors[color].split(" ")[1]}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

export default Analytics;