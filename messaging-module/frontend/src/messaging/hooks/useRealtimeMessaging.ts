import { useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";

export const useRealtimeMessaging = (conversationId?: string) => {
  const token = localStorage.getItem("token") || "";

  const socket = useMemo<Socket>(() => {
    const instance = io(import.meta.env.VITE_MESSAGING_WS_URL || "http://localhost:4002", {
      auth: { token }
    });
    return instance;
  }, [token]);

  useEffect(() => {
    if (!conversationId) return;
    socket.emit("conversation:join", conversationId);
  }, [socket, conversationId]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
};
