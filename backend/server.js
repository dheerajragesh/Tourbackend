import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.locals.io = io;

const users = {};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} is online`);
  });

  socket.on("private_message", (data) => {
    const receiverSocket =
      users[data.receiverId];

    if (receiverSocket) {
      io.to(receiverSocket).emit(
        "receive_private_message",
        data
      );
    }
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });
});
