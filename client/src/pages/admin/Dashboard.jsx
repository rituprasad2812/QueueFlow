import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/shared/Sidebar";
import DashboardHome from "./DashboardHome";
import QueueSetup from "./QueueSetup";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="queues" element={<QueueSetup />} />
          <Route path="staff" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Staff</h1>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          } />
          <Route path="analytics" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          } />
          <Route path="settings" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;