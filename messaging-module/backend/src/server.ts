import http from "http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { conversationsRouter } from "./api/conversations.js";
import { messagesRouter } from "./api/messages.js";
import { notificationsRouter } from "./api/notifications.js";
import { setupSocketServer } from "./sockets/index.js";
import { redis } from "./redis/client.js";

const app = express();
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "20mb" }));

app.get("/health", async (_req, res) => {
  try {
    if (!redis.status || redis.status === "wait") {
      await redis.connect();
    }
    await redis.ping();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.use("/api/messaging/conversations", conversationsRouter);
app.use("/api/messaging/messages", messagesRouter);
app.use("/api/messaging/notifications", notificationsRouter);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_ORIGIN,
    credentials: true
  }
});

setupSocketServer(io);

httpServer.listen(env.PORT, () => {
  console.log(`Messaging server running on :${env.PORT}`);
});
