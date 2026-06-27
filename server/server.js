const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");
const { initializeSocket } = require("./socket/socketManager");

const server = http.createServer(app);

// Initialize Socket.io AFTER server is created
initializeSocket(server);

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io ready`);
  });
};

startServer();

module.exports = server;