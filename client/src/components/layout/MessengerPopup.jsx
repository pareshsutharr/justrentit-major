import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  FiArrowLeft,
  FiCircle,
  FiImage,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSearch,
  FiSend,
  FiSmile,
  FiTrash2,
  FiVideo,
  FiX
} from "react-icons/fi";
import { getApiBaseUrl, getImageUrl } from "../../utils/productHelpers";

const baseUrl = getApiBaseUrl();
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`
});

const toRelativeTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / 60000);
  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};

const normalizeConversation = (conversation) => ({
  conversationId: String(
    conversation?.conversationId || conversation?._id || conversation?.id || ""
  ),
  partnerId: String(
    conversation?.partnerId || conversation?._id || conversation?.userId || ""
  ),
  name: conversation?.name || "Unknown User",
  profilePhoto: conversation?.profilePhoto || "",
  email: conversation?.email || "",
  lastMessage: conversation?.lastMessage || "",
  lastMessageAt: conversation?.lastMessageAt || null,
  unreadCount: Number(conversation?.unreadCount || 0),
  isOnline: Boolean(conversation?.isOnline),
  isPinned: Boolean(conversation?.isPinned),
  isArchived: Boolean(conversation?.isArchived)
});

const normalizeMessage = (message) => {
  if (!message) return null;
  return {
    ...message,
    _id: String(message?._id || message?.id || ""),
    senderId: String(message?.sender?._id || message?.sender || ""),
    receiverId: String(message?.receiver?._id || message?.receiver || ""),
    senderName: message?.sender?.name || "",
    senderAvatar: message?.sender?.profilePhoto || "",
    receiverName: message?.receiver?.name || "",
    deletedForEveryone: Boolean(message?.deletedForEveryone),
    deliveryStatus: message?.deliveryStatus || "sent"
  };
};

const deliveryLabel = (message, own) => {
  if (!own) return "";
  if (message.deletedForEveryone) return "Deleted";
  if (message.deliveryStatus === "seen") return "Seen";
  if (message.deliveryStatus === "delivered") return "Delivered";
  return "Sent";
};

const upsertConversation = (conversations, incoming) => {
  const next = normalizeConversation(incoming);
  const existing = conversations.find(
    (conversation) =>
      conversation.partnerId === next.partnerId ||
      (next.conversationId && conversation.conversationId === next.conversationId)
  );

  const merged = {
    ...existing,
    ...next,
    conversationId: next.conversationId || existing?.conversationId || "",
    partnerId: next.partnerId || existing?.partnerId || "",
    name: next.name || existing?.name || "Unknown User",
    profilePhoto: next.profilePhoto || existing?.profilePhoto || "",
    email: next.email || existing?.email || "",
    lastMessage: next.lastMessage || existing?.lastMessage || "",
    lastMessageAt: next.lastMessageAt || existing?.lastMessageAt || null,
    unreadCount: Number(next.unreadCount ?? existing?.unreadCount ?? 0),
    isOnline: Boolean(next.isOnline ?? existing?.isOnline),
    isPinned: Boolean(next.isPinned ?? existing?.isPinned),
    isArchived: Boolean(next.isArchived ?? existing?.isArchived)
  };

  const filtered = conversations.filter(
    (conversation) =>
      conversation.partnerId !== merged.partnerId &&
      conversation.conversationId !== merged.conversationId
  );

  return [merged, ...filtered].sort(
    (first, second) =>
      new Date(second.lastMessageAt || 0) - new Date(first.lastMessageAt || 0)
  );
};

const upsertMessage = (messages, incoming) => {
  const message = normalizeMessage(incoming);
  if (!message?._id) return messages;
  const existingIndex = messages.findIndex((item) => item._id === message._id);
  if (existingIndex === -1) return [...messages, message];

  const next = [...messages];
  next[existingIndex] = { ...next[existingIndex], ...message };
  return next;
};

const normalizePartnerProfile = (user, fallbackPartnerId = "") => ({
  conversationId: "",
  partnerId: String(user?._id || fallbackPartnerId || ""),
  name: user?.name || "Owner",
  profilePhoto: user?.profilePhoto || "",
  email: user?.email || "",
  lastMessage: "",
  lastMessageAt: null,
  unreadCount: 0,
  isOnline: Boolean(user?.isOnline),
  isPinned: false,
  isArchived: false
});

const MessengerPopup = () => {
  const userId = String(localStorage.getItem("userId") || "");
  const token = localStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedPartnerProfile, setSelectedPartnerProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [typingByUser, setTypingByUser] = useState({});
  const [presenceMap, setPresenceMap] = useState({});
  const [nextCursor, setNextCursor] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedPartnerIdRef = useRef("");
  const typingClearTimersRef = useRef({});
  const presenceMapRef = useRef({});

  const selectedConversation = useMemo(
    () => {
      const matchedConversation =
        conversations.find(
          (conversation) => conversation.partnerId === selectedPartnerId
        ) || null;

      if (matchedConversation) {
        return selectedPartnerProfile
          ? { ...selectedPartnerProfile, ...matchedConversation }
          : matchedConversation;
      }

      return selectedPartnerProfile;
    },
    [conversations, selectedPartnerId, selectedPartnerProfile]
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) =>
      (conversation.name || "").toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  useEffect(() => {
    selectedPartnerIdRef.current = selectedPartnerId;
  }, [selectedPartnerId]);

  useEffect(() => {
    if (!selectedPartnerId) {
      setSelectedPartnerProfile(null);
    }
  }, [selectedPartnerId]);

  useEffect(() => {
    presenceMapRef.current = presenceMap;
  }, [presenceMap]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    socketRef.current = io(baseUrl, { query: { token } });
    socketRef.current.emit("joinChat", userId);

    const onReceiveMessage = (incoming) => {
      const message = normalizeMessage(incoming);
      if (!message) return;

      const partnerId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const isCurrentThread = selectedPartnerIdRef.current === partnerId;

      if (isCurrentThread) {
        setMessages((previous) => upsertMessage(previous, message));

        if (message.senderId !== userId) {
          socketRef.current?.emit("seenMessages", { partnerId });
          axios
            .patch(
              `${baseUrl}/api/chat/read/${partnerId}`,
              {},
              { headers: authHeaders() }
            )
            .catch(() => {});
        }
      }

      setConversations((previous) =>
        upsertConversation(previous, {
          conversationId: message.conversation || message.conversationId,
          partnerId,
          name:
            message.senderId === userId
              ? previous.find((item) => item.partnerId === partnerId)?.name || "User"
              : message.senderName || "User",
          profilePhoto:
            message.senderId === userId
              ? previous.find((item) => item.partnerId === partnerId)?.profilePhoto || ""
              : message.senderAvatar || "",
          email:
            previous.find((item) => item.partnerId === partnerId)?.email || "",
          lastMessage:
            message.messageType === "image"
              ? "Photo"
              : message.content || "This message was deleted.",
          lastMessageAt: message.createdAt,
          unreadCount:
            message.senderId === userId || isCurrentThread
              ? 0
              : (previous.find((item) => item.partnerId === partnerId)?.unreadCount || 0) + 1,
          isOnline:
            previous.find((item) => item.partnerId === partnerId)?.isOnline ||
            presenceMapRef.current[partnerId] ||
            false
        })
      );

      if (selectedPartnerIdRef.current === partnerId) {
        setSelectedPartnerProfile((previous) => ({
          ...(previous || normalizePartnerProfile({}, partnerId)),
          partnerId,
          name:
            message.senderId === userId
              ? previous?.name || selectedConversation?.name || "User"
              : message.senderName || previous?.name || "User",
          profilePhoto:
            message.senderId === userId
              ? previous?.profilePhoto || ""
              : message.senderAvatar || previous?.profilePhoto || "",
          isOnline: previous?.isOnline ?? presenceMapRef.current[partnerId] ?? false
        }));
      }
    };

    const onTyping = ({ senderId, isTyping }) => {
      const nextUserId = String(senderId);
      setTypingByUser((previous) => ({
        ...previous,
        [nextUserId]: Boolean(isTyping)
      }));

      if (typingClearTimersRef.current[nextUserId]) {
        clearTimeout(typingClearTimersRef.current[nextUserId]);
      }

      if (isTyping) {
        typingClearTimersRef.current[nextUserId] = setTimeout(() => {
          setTypingByUser((previous) => ({
            ...previous,
            [nextUserId]: false
          }));
        }, 1600);
      }
    };

    const onMessagesSeen = ({ seenBy }) => {
      const seenById = String(seenBy);
      setMessages((previous) =>
        previous.map((message) =>
          message.senderId === userId && message.receiverId === seenById
            ? { ...message, deliveryStatus: "seen" }
            : message
        )
      );
    };

    const onMessagesDelivered = ({ deliveredTo }) => {
      const deliveredToId = String(deliveredTo);
      setMessages((previous) =>
        previous.map((message) =>
          message.senderId === userId &&
          message.receiverId === deliveredToId &&
          message.deliveryStatus === "sent"
            ? { ...message, deliveryStatus: "delivered" }
            : message
        )
      );
    };

    const onMessageDeleted = (incoming) => {
      const message = normalizeMessage(incoming);
      if (!message) return;

      setMessages((previous) => upsertMessage(previous, message));
      const partnerId =
        message.senderId === userId ? message.receiverId : message.senderId;
      setConversations((previous) =>
        upsertConversation(previous, {
          conversationId: message.conversation || message.conversationId,
          partnerId,
          lastMessage:
            message.messageType === "image"
              ? "Photo"
              : message.content || "This message was deleted.",
          lastMessageAt: message.createdAt
        })
      );
    };

    const onPresenceUpdate = ({ userId: onlineUserId, isOnline }) => {
      const nextUserId = String(onlineUserId);
      setPresenceMap((previous) => ({
        ...previous,
        [nextUserId]: Boolean(isOnline)
      }));
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.partnerId === nextUserId
            ? { ...conversation, isOnline: Boolean(isOnline) }
            : conversation
        )
      );
      if (selectedPartnerIdRef.current === nextUserId) {
        setSelectedPartnerProfile((previous) =>
          previous
            ? { ...previous, isOnline: Boolean(isOnline) }
            : previous
        );
      }
    };

    socketRef.current.on("receiveMessage", onReceiveMessage);
    socketRef.current.on("typing", onTyping);
    socketRef.current.on("messagesSeen", onMessagesSeen);
    socketRef.current.on("messagesDelivered", onMessagesDelivered);
    socketRef.current.on("messageDeleted", onMessageDeleted);
    socketRef.current.on("presence:update", onPresenceUpdate);

    return () => {
      Object.values(typingClearTimersRef.current).forEach((timer) =>
        clearTimeout(timer)
      );
      socketRef.current?.off("receiveMessage", onReceiveMessage);
      socketRef.current?.off("typing", onTyping);
      socketRef.current?.off("messagesSeen", onMessagesSeen);
      socketRef.current?.off("messagesDelivered", onMessagesDelivered);
      socketRef.current?.off("messageDeleted", onMessageDeleted);
      socketRef.current?.off("presence:update", onPresenceUpdate);
      socketRef.current?.disconnect();
    };
  }, [token, userId]);

  const hydrateSelectedPartner = async (partnerId, seed = null) => {
    if (!partnerId) return;

    if (seed) {
      setSelectedPartnerProfile((previous) => ({
        ...(previous || normalizePartnerProfile({}, partnerId)),
        ...normalizeConversation(seed)
      }));
    }

    try {
      const response = await axios.get(`${baseUrl}/api/chat/${partnerId}`, {
        headers: authHeaders()
      });
      const user = response?.data?.user;
      if (!user?._id) return;

      const normalizedPartner = normalizePartnerProfile(user, partnerId);
      setSelectedPartnerProfile((previous) => ({
        ...(previous || normalizedPartner),
        ...normalizedPartner,
        lastMessage: previous?.lastMessage || "",
        lastMessageAt: previous?.lastMessageAt || null,
        unreadCount: previous?.unreadCount || 0,
        conversationId: previous?.conversationId || ""
      }));

      setConversations((previous) =>
        upsertConversation(previous, {
          ...(previous.find((item) => item.partnerId === partnerId) || {}),
          ...normalizedPartner
        })
      );
    } catch {
      // Keep staged partner details if profile hydration fails.
    }
  };

  useEffect(() => {
    const openMessenger = (event) => {
      const detail = event?.detail || {};
      setIsOpen(true);

      if (!detail?._id && !detail?.partnerId) return;

      const partnerId = String(detail._id || detail.partnerId || "");
      const stagedConversation = {
        partnerId,
        conversationId: detail.conversationId || "",
        name: detail.name || "Owner",
        profilePhoto: detail.profilePhoto || "",
        email: detail.email || "",
        isOnline: Boolean(detail.isOnline)
      };

      setConversations((previous) => upsertConversation(previous, stagedConversation));
      setSelectedPartnerProfile(normalizeConversation(stagedConversation));
      setSelectedPartnerId(partnerId);
      hydrateSelectedPartner(partnerId, stagedConversation);
    };

    const openOnly = () => setIsOpen(true);

    window.addEventListener("chat:open-user", openMessenger);
    window.addEventListener("chat:open", openOnly);

    return () => {
      window.removeEventListener("chat:open-user", openMessenger);
      window.removeEventListener("chat:open", openOnly);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !token || !userId) return;

    const fetchConversations = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get(`${baseUrl}/api/chat/conversations`, {
          headers: authHeaders()
        });
        const items = Array.isArray(response.data)
          ? response.data.map(normalizeConversation)
          : [];

        const nextPresence = {};
        items.forEach((item) => {
          nextPresence[item.partnerId] = Boolean(item.isOnline);
        });

        setPresenceMap((previous) => ({ ...previous, ...nextPresence }));
        setConversations((previous) => {
          let merged = previous;
          items.forEach((item) => {
            merged = upsertConversation(merged, item);
          });
          return merged;
        });
      } catch {
        // Do not clear staged/opened conversation if the list refresh fails.
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchConversations();
  }, [isOpen, token, userId]);

  useEffect(() => {
    if (!token || !userId || !selectedPartnerId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await axios.get(
          `${baseUrl}/api/chat/thread/${selectedPartnerId}`,
          {
            headers: authHeaders(),
            params: { limit: 30 }
          }
        );

        const payload = response.data || {};
        const threadMessages = Array.isArray(payload.messages)
          ? payload.messages.map(normalizeMessage).filter(Boolean)
          : [];

        setMessages(threadMessages);
        setNextCursor(payload.nextCursor || null);

        if (payload.partner) {
          const hydratedPartner = normalizeConversation({
            conversationId: payload.conversationId,
            partnerId: payload.partner._id,
            name: payload.partner.name,
            profilePhoto: payload.partner.profilePhoto,
            email: payload.partner.email,
            isOnline: payload.partner.isOnline,
            unreadCount: 0,
            lastMessage:
              threadMessages[threadMessages.length - 1]?.messageType === "image"
                ? "Photo"
                : threadMessages[threadMessages.length - 1]?.content || "",
            lastMessageAt:
              threadMessages[threadMessages.length - 1]?.createdAt || null
          });

          setSelectedPartnerProfile((previous) => ({
            ...(previous || hydratedPartner),
            ...hydratedPartner
          }));
          setConversations((previous) =>
            upsertConversation(previous, hydratedPartner)
          );
        } else {
          hydrateSelectedPartner(selectedPartnerId);
        }

        await axios.patch(
          `${baseUrl}/api/chat/read/${selectedPartnerId}`,
          {},
          { headers: authHeaders() }
        );
        socketRef.current?.emit("conversationOpened", { partnerId: selectedPartnerId });
        socketRef.current?.emit("seenMessages", { partnerId: selectedPartnerId });
        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.partnerId === selectedPartnerId
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        );
      } catch {
        setMessages([]);
        setNextCursor(null);
        hydrateSelectedPartner(selectedPartnerId);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [token, userId, selectedPartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadOlderMessages = async () => {
    if (!selectedPartnerId || !nextCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/chat/thread/${selectedPartnerId}`,
        {
          headers: authHeaders(),
          params: {
            limit: 30,
            cursor: nextCursor
          }
        }
      );

      const payload = response.data || {};
      const olderMessages = Array.isArray(payload.messages)
        ? payload.messages.map(normalizeMessage).filter(Boolean)
        : [];

      setMessages((previous) => {
        const existingIds = new Set(previous.map((message) => message._id));
        const nextMessages = olderMessages.filter(
          (message) => !existingIds.has(message._id)
        );
        return [...nextMessages, ...previous];
      });
      setNextCursor(payload.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  const emitTyping = (value) => {
    if (!selectedPartnerId) return;
    socketRef.current?.emit("typing", {
      receiverId: selectedPartnerId,
      isTyping: value
    });
  };

  const handleDraftChange = (value) => {
    setNewMessage(value);
    emitTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 900);
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedPartnerId) return;

    socketRef.current?.emit("sendMessage", {
      receiverId: selectedPartnerId,
      content: newMessage.trim(),
      messageType: "text"
    });

    emitTyping(false);
    setNewMessage("");
  };

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPartnerId) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("receiver", selectedPartnerId);

      await axios.post(`${baseUrl}/api/chat`, formData, {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data"
        }
      });
    } catch {
      // Keep the UI stable if upload fails.
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/api/chat/messages/${messageId}`,
        { headers: authHeaders() }
      );

      const nextMessage = normalizeMessage(response?.data?.message);
      if (!nextMessage) return;

      setMessages((previous) => upsertMessage(previous, nextMessage));
      setConversations((previous) =>
        upsertConversation(previous, {
          partnerId:
            nextMessage.senderId === userId
              ? nextMessage.receiverId
              : nextMessage.senderId,
          conversationId: nextMessage.conversation || nextMessage.conversationId,
          lastMessage:
            nextMessage.messageType === "image"
              ? "Photo"
              : nextMessage.content || "This message was deleted.",
          lastMessageAt: nextMessage.createdAt
        })
      );
    } catch {
      // Keep the UI stable if delete fails.
    }
  };

  if (!userId || !token) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {isOpen && (
        <div className="w-[95vw] max-w-[900px] h-[82vh] max-h-[680px] bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden mb-3 flex">
          {(!isMobile || !selectedPartnerId) && (
            <aside className="w-full md:w-[340px] shrink-0 border-r border-gray-200 bg-[#f7f9fb] flex flex-col min-h-0">
              <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Messaging</h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-800"
                    aria-label="Close messenger"
                  >
                    <FiX size={18} />
                  </button>
                </div>
                <div className="mt-3 relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search conversations"
                    className="w-full border border-gray-200 rounded-full pl-9 pr-3 py-2 text-sm bg-[#f3f6f8] outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingUsers ? (
                  <p className="p-4 text-sm text-gray-500">Loading conversations...</p>
                ) : filteredConversations.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.partnerId || conversation.conversationId}
                      type="button"
                      onClick={() => {
                        setSelectedPartnerProfile(conversation);
                        setSelectedPartnerId(conversation.partnerId);
                      }}
                      className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-100 ${
                        selectedPartnerId === conversation.partnerId ? "bg-white" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={
                              getImageUrl(conversation.profilePhoto) ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                conversation.name
                              )}&background=e2e8f0&color=334155`
                            }
                            alt={conversation.name}
                            className="w-11 h-11 rounded-full object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                              conversation.isOnline ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {conversation.name}
                            </p>
                            <span className="text-[11px] text-gray-400">
                              {toRelativeTime(conversation.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.lastMessage || "Start chatting"}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="h-5 min-w-5 rounded-full bg-primary text-white text-[11px] grid place-items-center px-1">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>
          )}

          {(!isMobile || selectedPartnerId) && (
            <section className="flex-1 min-w-0 flex flex-col bg-white">
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPartnerProfile(null);
                        setSelectedPartnerId("");
                      }}
                      className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                    >
                      <FiArrowLeft />
                    </button>
                  )}
                  {selectedConversation ? (
                    <>
                      <img
                        src={
                          getImageUrl(selectedConversation.profilePhoto) ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            selectedConversation.name
                          )}&background=e2e8f0&color=334155`
                        }
                        alt={selectedConversation.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {selectedConversation.name}
                        </p>
                        <p
                          className={`text-xs flex items-center gap-1 ${
                            selectedConversation.isOnline
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          <FiCircle
                            size={8}
                            className={
                              selectedConversation.isOnline
                                ? "fill-emerald-500 text-emerald-500"
                                : "fill-slate-300 text-slate-300"
                            }
                          />
                          {selectedConversation.isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Select a conversation</p>
                  )}
                </div>

                {selectedConversation && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Video call"
                    >
                      <FiVideo />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="More options"
                    >
                      <FiMoreHorizontal />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#f3f6f8] space-y-3">
                {selectedPartnerId && nextCursor && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={loadOlderMessages}
                      disabled={loadingMore}
                      className="px-3 py-1.5 text-xs rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                    >
                      {loadingMore ? "Loading..." : "Load older messages"}
                    </button>
                  </div>
                )}

                {!selectedPartnerId ? (
                  <p className="text-sm text-gray-500">
                    Choose a conversation to start messaging.
                  </p>
                ) : loadingMessages ? (
                  <p className="text-sm text-gray-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No messages yet. Start the conversation.
                  </p>
                ) : (
                  messages.map((message) => {
                    const own = message.senderId === userId;
                    return (
                      <div
                        key={message._id}
                        className={`flex items-end gap-2 ${
                          own ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!own && (
                          <img
                            src={
                              getImageUrl(message.senderAvatar) ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                message.senderName || selectedConversation?.name || "U"
                              )}&background=e2e8f0&color=334155`
                            }
                            alt={message.senderName || "User"}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        )}
                        <div className={`max-w-[78%] ${own ? "order-2" : ""}`}>
                          <div
                            className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${
                              own
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"
                            }`}
                          >
                            {message.messageType === "image" && message.imageUrl ? (
                              <img
                                src={message.imageUrl}
                                alt="Shared"
                                className="rounded-lg max-h-56 object-cover"
                              />
                            ) : (
                              <span
                                className={
                                  message.deletedForEveryone ? "italic opacity-80" : ""
                                }
                              >
                                {message.content}
                              </span>
                            )}
                          </div>
                          <div
                            className={`mt-1 flex items-center gap-2 ${
                              own ? "justify-end" : "justify-start"
                            }`}
                          >
                            <p
                              className={`text-[11px] ${
                                own ? "text-right text-gray-400" : "text-gray-400"
                              }`}
                            >
                              {new Date(
                                message.createdAt || message.created_at
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                              {own ? ` • ${deliveryLabel(message, own)}` : ""}
                            </p>
                            {own && !message.deletedForEveryone && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(message._id)}
                                className="text-[11px] text-gray-400 hover:text-red-500"
                                title="Delete message"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {typingByUser[selectedPartnerId] && (
                  <p className="text-xs text-gray-500">
                    {selectedConversation?.name || "User"} is typing...
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedPartnerId && (
                <form
                  onSubmit={handleSend}
                  className="px-3 py-3 border-t border-gray-200 bg-white"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelected}
                  />
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                      onClick={() => handleDraftChange(`${newMessage}🙂`)}
                      title="Emoji"
                    >
                      <FiSmile />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                      onClick={() => fileInputRef.current?.click()}
                      title="Send image"
                      disabled={uploadingImage}
                    >
                      <FiImage />
                    </button>
                    <textarea
                      rows={1}
                      value={newMessage}
                      onChange={(event) => handleDraftChange(event.target.value)}
                      placeholder={
                        uploadingImage ? "Uploading image..." : "Write a message"
                      }
                      disabled={uploadingImage}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSend(event);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-white disabled:opacity-60"
                      aria-label="Send"
                      disabled={uploadingImage}
                    >
                      <FiSend size={16} />
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl grid place-items-center"
        aria-label="Open messenger"
      >
        <FiMessageCircle size={24} />
      </button>
    </div>
  );
};

export default MessengerPopup;
