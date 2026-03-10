import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { JwtPayload } from "../types.js";
import { redis } from "../redis/client.js";

type AuthedSocket = Socket & { auth?: JwtPayload };

export const setupSocketServer = (io: Server) => {
  io.use((socket: AuthedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token || typeof token !== "string") return next(new Error("Unauthorized"));

    try {
      socket.auth = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: AuthedSocket) => {
    const userId = socket.auth!.userId;
    socket.join(`user:${userId}`);
    await redis.set(`presence:${userId}`, "online", "EX", 60);
    io.emit("presence:update", { userId, status: "online" });

    socket.on("conversation:join", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("message:send", (payload) => {
      io.to(`conversation:${payload.conversationId}`).emit("message:new", payload);
    });

    socket.on("message:typing", (payload) => {
      socket.to(`conversation:${payload.conversationId}`).emit("message:typing", {
        conversationId: payload.conversationId,
        userId,
        isTyping: payload.isTyping
      });
    });

    socket.on("message:seen", (payload) => {
      io.to(`conversation:${payload.conversationId}`).emit("message:seen", {
        ...payload,
        userId,
        seenAt: new Date().toISOString()
      });
    });

    socket.on("message:reaction", (payload) => {
      io.to(`conversation:${payload.conversationId}`).emit("message:reaction", {
        ...payload,
        userId
      });
    });

    socket.on("disconnect", async () => {
      await redis.set(`presence:${userId}`, "offline", "EX", 60);
      io.emit("presence:update", { userId, status: "offline" });
    });
  });
};
