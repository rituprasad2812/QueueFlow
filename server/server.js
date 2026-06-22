const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");

const server = http.createServer(app);

// Connect DB then start server
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
  });
};

startServer();

// We will attach Socket.io to this server on Day 4
module.exports = server;