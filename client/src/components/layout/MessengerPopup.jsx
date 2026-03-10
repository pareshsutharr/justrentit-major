import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  FiArrowLeft,
  FiCircle,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSearch,
  FiSend,
  FiSmile,
  FiVideo,
  FiX
} from "react-icons/fi";
import { getApiBaseUrl, getImageUrl } from "../../utils/productHelpers";

const baseUrl = getApiBaseUrl();

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

const normalizeUser = (user) => ({
  _id: String(user?._id || ""),
  name: user?.name || "Unknown User",
  profilePhoto: user?.profilePhoto || "",
  email: user?.email || "",
  lastMessage: user?.lastMessage || "",
  lastMessageAt: user?.lastMessageAt || null,
  unreadCount: Number(user?.unreadCount || 0)
});

const normalizeMessage = (message) => {
  if (!message) return null;
  return {
    ...message,
    senderId: String(message?.sender?._id || message?.sender || ""),
    receiverId: String(message?.receiver?._id || message?.receiver || ""),
    senderName: message?.sender?.name || "",
    senderAvatar: message?.sender?.profilePhoto || ""
  };
};

const MessengerPopup = () => {
  const userId = String(localStorage.getItem("userId") || "");
  const token = localStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingByUser, setTypingByUser] = useState({});
  const [seenByUser, setSeenByUser] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => (user.name || "").toLowerCase().includes(query));
  }, [users, searchQuery]);

  useEffect(() => {
    if (!token || !userId) return;

    socketRef.current = io(baseUrl, { query: { token } });
    socketRef.current.emit("joinChat", userId);

    const onReceiveMessage = (incoming) => {
      const message = normalizeMessage(incoming);
      if (!message) return;

      const isCurrentThread =
        (message.senderId === selectedUserId && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === selectedUserId);

      if (isCurrentThread) {
        setMessages((prev) => [...prev, message]);

        if (message.senderId !== userId) {
          socketRef.current?.emit("seenMessages", { partnerId: message.senderId });
          axios.patch(`${baseUrl}/api/chat/read/${message.senderId}`).catch(() => {});
        }
      }

      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      setUsers((prev) => {
        let found = false;
        const next = prev.map((user) => {
          if (user._id !== partnerId) return user;
          found = true;
          return {
            ...user,
            lastMessage: message.messageType === "image" ? "Photo" : message.content,
            lastMessageAt: message.createdAt,
            unreadCount:
              message.senderId === userId ? user.unreadCount : user.unreadCount + (isCurrentThread ? 0 : 1)
          };
        });

        if (!found) {
          next.unshift(
            normalizeUser({
              _id: partnerId,
              name: message.senderId === userId ? "User" : message.senderName || "User",
              profilePhoto: message.senderId === userId ? "" : message.senderAvatar,
              lastMessage: message.messageType === "image" ? "Photo" : message.content,
              lastMessageAt: message.createdAt,
              unreadCount: message.senderId === userId ? 0 : 1
            })
          );
        }

        return [...next].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    };

    const onTyping = ({ senderId, isTyping }) => {
      setTypingByUser((prev) => ({ ...prev, [String(senderId)]: Boolean(isTyping) }));
    };

    const onMessagesSeen = ({ seenBy, partnerId }) => {
      if (String(seenBy) === selectedUserId && String(partnerId) === userId) {
        setSeenByUser((prev) => ({ ...prev, [String(seenBy)]: true }));
      }
    };

    socketRef.current.on("receiveMessage", onReceiveMessage);
    socketRef.current.on("typing", onTyping);
    socketRef.current.on("messagesSeen", onMessagesSeen);

    return () => {
      socketRef.current?.off("receiveMessage", onReceiveMessage);
      socketRef.current?.off("typing", onTyping);
      socketRef.current?.off("messagesSeen", onMessagesSeen);
      socketRef.current?.disconnect();
    };
  }, [token, userId, selectedUserId]);

  useEffect(() => {
    const openChatForUser = (event) => {
      const target = normalizeUser(event?.detail || {});
      if (!target._id) return;

      setUsers((prev) => {
        const exists = prev.some((item) => item._id === target._id);
        const merged = exists ? prev : [target, ...prev];
        return merged;
      });

      setSelectedUserId(target._id);
      setIsOpen(true);
    };

    window.addEventListener("chat:open-user", openChatForUser);
    return () => window.removeEventListener("chat:open-user", openChatForUser);
  }, []);

  useEffect(() => {
    if (!isOpen || !token || !userId) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get(`${baseUrl}/api/chat/users/${userId}`);
        const data = Array.isArray(response.data) ? response.data.map(normalizeUser) : [];
        setUsers(data.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)));
      } catch {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen, token, userId]);

  useEffect(() => {
    if (!token || !userId || !selectedUserId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await axios.get(`${baseUrl}/api/chat/${userId}/${selectedUserId}`);
        const data = Array.isArray(response.data) ? response.data.map(normalizeMessage).filter(Boolean) : [];
        setMessages(data);

        await axios.patch(`${baseUrl}/api/chat/read/${selectedUserId}`);
        socketRef.current?.emit("seenMessages", { partnerId: selectedUserId });

        setUsers((prev) => prev.map((u) => (u._id === selectedUserId ? { ...u, unreadCount: 0 } : u)));
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [token, userId, selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const emitTyping = (value) => {
    if (!selectedUserId) return;
    socketRef.current?.emit("typing", { receiverId: selectedUserId, isTyping: value });
  };

  const handleDraftChange = (value) => {
    setNewMessage(value);
    emitTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 900);
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    socketRef.current?.emit("sendMessage", {
      receiverId: selectedUserId,
      content: newMessage.trim()
    });

    emitTyping(false);
    setNewMessage("");
    setSeenByUser((prev) => ({ ...prev, [selectedUserId]: false }));
  };

  if (!userId || !token) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {isOpen && (
        <div className="w-[95vw] max-w-[860px] h-[82vh] max-h-[640px] bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden mb-3 flex">
          {(!isMobile || !selectedUserId) && (
            <aside className="w-full md:w-[320px] shrink-0 border-r border-gray-200 bg-[#f7f9fb] flex flex-col min-h-0">
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
                ) : filteredUsers.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => setSelectedUserId(user._id)}
                      className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-100 ${
                        selectedUserId === user._id ? "bg-white" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={getImageUrl(user.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e2e8f0&color=334155`}
                            alt={user.name}
                            className="w-11 h-11 rounded-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <span className="text-[11px] text-gray-400">{toRelativeTime(user.lastMessageAt)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-gray-500 truncate">{user.lastMessage || "Start chatting"}</p>
                            {user.unreadCount > 0 && (
                              <span className="h-5 min-w-5 rounded-full bg-primary text-white text-[11px] grid place-items-center px-1">
                                {user.unreadCount}
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

          {(!isMobile || selectedUserId) && (
            <section className="flex-1 min-w-0 flex flex-col bg-white">
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setSelectedUserId("")}
                      className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                    >
                      <FiArrowLeft />
                    </button>
                  )}
                  {selectedUser ? (
                    <>
                      <img
                        src={getImageUrl(selectedUser.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=e2e8f0&color=334155`}
                        alt={selectedUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{selectedUser.name}</p>
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                          <FiCircle size={8} className="fill-emerald-500 text-emerald-500" />
                          Active now
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Select a conversation</p>
                  )}
                </div>

                {selectedUser && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <button type="button" className="p-2 hover:bg-gray-100 rounded-lg" title="Video call">
                      <FiVideo />
                    </button>
                    <button type="button" className="p-2 hover:bg-gray-100 rounded-lg" title="More options">
                      <FiMoreHorizontal />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#f3f6f8] space-y-3">
                {!selectedUserId ? (
                  <p className="text-sm text-gray-500">Choose a conversation to start messaging.</p>
                ) : loadingMessages ? (
                  <p className="text-sm text-gray-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet. Start the conversation.</p>
                ) : (
                  messages.map((message) => {
                    const own = message.senderId === userId;
                    return (
                      <div key={message._id} className={`flex items-end gap-2 ${own ? "justify-end" : "justify-start"}`}>
                        {!own && (
                          <img
                            src={getImageUrl(message.senderAvatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName || selectedUser?.name || "U")}&background=e2e8f0&color=334155`}
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
                              <img src={message.imageUrl} alt="Shared" className="rounded-lg max-h-56 object-cover" />
                            ) : (
                              message.content
                            )}
                          </div>
                          <p className={`mt-1 text-[11px] ${own ? "text-right text-gray-400" : "text-gray-400"}`}>
                            {new Date(message.createdAt || message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                            {own && seenByUser[selectedUserId] ? " • Seen" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}

                {typingByUser[selectedUserId] && (
                  <p className="text-xs text-gray-500">{selectedUser?.name || "User"} is typing...</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedUserId && (
                <form onSubmit={handleSend} className="px-3 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                      onClick={() => handleDraftChange(`${newMessage}🙂`)}
                      title="Emoji"
                    >
                      <FiSmile />
                    </button>
                    <textarea
                      rows={1}
                      value={newMessage}
                      onChange={(event) => handleDraftChange(event.target.value)}
                      placeholder="Write a message"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSend(event);
                        }
                      }}
                    />
                    <button type="submit" className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-white" aria-label="Send">
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
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl grid place-items-center"
        aria-label="Open messenger"
      >
        <FiMessageCircle size={24} />
      </button>
    </div>
  );
};

export default MessengerPopup;
