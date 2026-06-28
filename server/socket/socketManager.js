const { Server } = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ],
    methods: ["GET", "POST"],
  },
});

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Customer joins queue room
    socket.on("join:queue", ({ queueId }) => {
      if (queueId) {
        socket.join(`queue:${queueId}`);
        console.log(`📥 Socket ${socket.id} joined queue:${queueId}`);
      }
    });

    // Customer joins their own token tracking room
    socket.on("join:token", ({ tokenId }) => {
      if (tokenId) {
        socket.join(`token:${tokenId}`);
        console.log(`📥 Socket ${socket.id} joined token:${tokenId}`);
      }
    });

    // Staff joins counter room
    socket.on("join:counter", ({ counterId }) => {
      if (counterId) {
        socket.join(`counter:${counterId}`);
        console.log(`📥 Socket ${socket.id} joined counter:${counterId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper functions to broadcast events
const emitToQueue = (queueId, event, data) => {
  if (io) {
    io.to(`queue:${queueId}`).emit(event, data);
  }
};

const emitToToken = (tokenId, event, data) => {
  if (io) {
    io.to(`token:${tokenId}`).emit(event, data);
  }
};

const emitToCounter = (counterId, event, data) => {
  if (io) {
    io.to(`counter:${counterId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  emitToQueue,
  emitToToken,
  emitToCounter,
};