const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Models (Required for Socket.io or direct logic)
const UserModel = require("./models/Users");
const ChatMessage = require("./models/ChatMessage");

// Router Imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/products");
const rentalRequestsRouter = require("./routes/rentalRequests");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ratingRoutes = require("./routes/ratings");
const adminStatsRoutes = require("./routes/adminStats");
const adminRoutes = require("./routes/adminRoutes");
const productManagement = require("./routes/productManagement");
const RentalManagement = require("./routes/RentalManagement");
const invoiceRoutes = require("./routes/invoices");
const dashboardRoutes = require("./routes/dashboard");

// Middleware
const { verifyToken } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3001;
const REQUIRED_ENV_VARS = ["MONGODB_URI", "JWT_SECRET"];
let lastDatabaseError = null;

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://justrentit-major.vercel.app",
  "https://justrentit-major.onrender.com",
  "https://justrentit-major-paresh.onrender.com",
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(...process.env.CLIENT_URL.split(",").map(url => url.trim()));
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- API Routes ---

// Health Check
app.get("/api/health", (req, res) => {
  const missingEnv = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  const isHealthy = missingEnv.length === 0 && mongoose.connection.readyState === 1;

  res.json({
    success: isHealthy,
    uptime: process.uptime(),
    missingEnv,
    dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    dbError: lastDatabaseError,
  });
});

// Mount Routers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", productRoutes); // Includes /products, /rentproduct/add, /my-products
app.use("/api/rental-requests", rentalRequestsRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", verifyToken, chatRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/admin", adminStatsRoutes);
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productManagement);
app.use("/api/admin/rentals", RentalManagement);

// Legacy/Compatibility Routes (Redirects or shims if needed, but better to update frontend)
// For now, keeping these as references or moving them to routers if they are still missing

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }
});

app.set("socketio", io);

io.use(async (socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) return next(new Error("Authentication error"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user._id}`);

  socket.on("joinChat", (userId) => {
    socket.join(userId);
  });

  socket.on("sendMessage", async ({ receiverId, content }) => {
    try {
      const message = new ChatMessage({
        sender: socket.user._id,
        receiver: receiverId,
        content,
        read: false
      });
      await message.save();
      const populatedMessage = await ChatMessage.findById(message._id)
        .populate("sender", "name profilePhoto")
        .populate("receiver", "name profilePhoto");

      io.to(receiverId).emit("receiveMessage", populatedMessage);
      socket.emit("receiveMessage", populatedMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  socket.on("typing", ({ receiverId, isTyping }) => {
    if (!receiverId) return;
    io.to(receiverId).emit("typing", {
      senderId: socket.user._id.toString(),
      isTyping: Boolean(isTyping)
    });
  });

  socket.on("seenMessages", async ({ partnerId }) => {
    if (!partnerId) return;
    try {
      await ChatMessage.updateMany(
        { sender: partnerId, receiver: socket.user._id, read: false },
        { $set: { read: true } }
      );
      io.to(partnerId).emit("messagesSeen", {
        seenBy: socket.user._id.toString(),
        partnerId: partnerId.toString()
      });
    } catch (err) {
      console.error("Error marking messages seen:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user._id}`);
  });
});

const startServer = async () => {
  const missingEnv = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    lastDatabaseError = null;
    console.log("MongoDB connected");
  } catch (err) {
    lastDatabaseError = err.message;
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

mongoose.connection.on("error", (err) => {
  lastDatabaseError = err.message;
  console.error("MongoDB runtime error:", err.message);
});

mongoose.connection.on("connected", () => {
  lastDatabaseError = null;
});

startServer();
