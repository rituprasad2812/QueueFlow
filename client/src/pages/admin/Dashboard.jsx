import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/shared/Sidebar";
import DashboardHome from "./DashboardHome";
import QueueSetup from "./QueueSetup";
import QueueLive from "./QueueLive";
import Counters from "./Counters";
import Settings from "./Settings";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="queues" element={<QueueSetup />} />
          <Route path="queues/:queueId/live" element={<QueueLive />} />
          <Route path="counters" element={<Counters />} />
          <Route path="staff" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Staff Management</h1>
              <p className="text-muted-foreground mt-2">
                Staff invite system coming in Day 5.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  💡 To add staff: You will be able to invite
                  staff members via email. They will create
                  their own account and you can assign them
                  to specific counters.
                </p>
              </div>
            </div>
          } />
          <Route path="analytics" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          } />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;