import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

// Connect MongoDB
await connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// Make io available in controllers
app.locals.io = io;

// Store online users
const onlineUsers = new Map();

function emitToUser(userId, eventName, payload) {
  const receiverSocket = onlineUsers.get(String(userId));

  if (receiverSocket) {
    io.to(receiverSocket).emit(eventName, payload);
  }
}

io.on("connection", (socket) => {
  console.log(
    `🟢 Socket Connected: ${socket.id}`
  );

  // =========================
  // USER JOIN
  // =========================
  socket.on("join", (userId) => {
    onlineUsers.set(String(userId), socket.id);

    console.log(
      `🟢 User ${userId} is online`
    );

    io.emit("user_status", {
      userId,
      online: true,
    });
  });

  // =========================
  // PRIVATE MESSAGE
  // =========================
  socket.on(
    "private_message",
    async (data) => {
      try {
        console.log(
          "📩 New Message:",
          data
        );

        emitToUser(
          data.receiverId,
          "receive_private_message",
          data
        );
      } catch (error) {
        console.log(
          "Message Error:",
          error.message
        );
      }
    }
  );

  // =========================
  // TYPING
  // =========================
  socket.on("typing", (data) => {
    emitToUser(data.receiverId, "typing", data);
  });

  // =========================
  // DISCONNECT
  // =========================
  socket.on("disconnect", () => {
    let disconnectedUser = null;

    onlineUsers.forEach(
      (socketId, userId) => {
        if (socketId === socket.id) {
          disconnectedUser = userId;
        }
      }
    );

    if (disconnectedUser) {
      onlineUsers.delete(
        disconnectedUser
      );

      io.emit("user_status", {
        userId: disconnectedUser,
        online: false,
      });

      console.log(
        `🔴 User ${disconnectedUser} went offline`
      );
    }

    console.log(
      `🔴 Socket Disconnected: ${socket.id}`
    );
  });
});

const PORT = process.env.PORT || 5000;

// Avoid crashing due to “address already in use” when dev server is restarted
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Stop the other process (or set a different PORT).`);
    process.exit(1);
  }

  console.error("❌ Server error:", err);
  process.exit(1);
});


server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
