const buyNsellRouter = require("./routes/campusCart");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// MongoDB connection
mongoose.set("strictQuery", true);
mongoose.connect(process.env.ATLAS_KEY)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("DB connection error:", err));

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Notification room handler
  socket.on("joinNotificationRoom", (userId) => {
    if (!userId) {
      console.warn("JoinNotificationRoom failed: Missing userId");
      return;
    }
    socket.join(userId);
    console.log(`User ${userId} joined notification room`);
  });

  // Chat room handler
  socket.on("joinRoom", ({ senderId, receiverId }) => {
    if (!senderId || !receiverId) {
      console.warn("JoinRoom failed: Missing IDs");
      return;
    }
    const roomId = [senderId, receiverId].sort().join("-");
    socket.join(roomId);
    console.log(`${socket.id} joined chat room: ${roomId}`);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message, productId }) => {
    try {
      if (!senderId || !receiverId || !message) {
        socket.emit("messageError", { error: "Missing required fields" });
        return;
      }
  
      // Save message
      const Message = require("./models/message");
      const newMessage = new Message({ senderId, receiverId, message });
      await newMessage.save();
  
      // Broadcast message to chat room
      const roomId = [senderId, receiverId].sort().join("-");
      io.to(roomId).emit("receiveMessage", newMessage);
  
      console.log(`Message sent from ${senderId} to ${receiverId}`);
    } catch (err) {
      console.error("Message handling error:", err);
      socket.emit("messageError", {
        error: "Failed to send message",
        details: err.message,
      });
    }
  });
  

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Express routes
app.use("/api", buyNsellRouter);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});