import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/shared/Sidebar";
import DashboardHome from "./DashboardHome";
import QueueSetup from "./QueueSetup";
import QueueLive from "./QueueLive";
import Counters from "./Counters";
import StaffManage from "./StaffManage";
import Analytics from "./Analytics";
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
          <Route path="staff" element={<StaffManage/>} />
          <Route path="analytics" element={<Analytics/>} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;