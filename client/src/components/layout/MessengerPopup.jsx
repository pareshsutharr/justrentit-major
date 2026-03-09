import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { getApiBaseUrl, getImageUrl } from "../../utils/productHelpers";

const baseUrl = getApiBaseUrl();

const MessengerPopup = () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedUserId) || null,
    [users, selectedUserId]
  );

  useEffect(() => {
    if (!token || !userId) return;
    socketRef.current = io(baseUrl, { query: { token } });
    socketRef.current.emit("joinChat", userId);

    const onReceiveMessage = (incomingMessage) => {
      const senderId = incomingMessage?.sender?._id || incomingMessage?.sender;
      const receiverId = incomingMessage?.receiver?._id || incomingMessage?.receiver;
      const isCurrentThread =
        (senderId === selectedUserId && receiverId === userId) ||
        (senderId === userId && receiverId === selectedUserId);

      if (isCurrentThread) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
    };

    socketRef.current.on("receiveMessage", onReceiveMessage);
    return () => {
      socketRef.current?.off("receiveMessage", onReceiveMessage);
      socketRef.current?.disconnect();
    };
  }, [token, userId, selectedUserId]);

  useEffect(() => {
    const openChatForUser = (event) => {
      const targetUser = event?.detail;
      if (!targetUser?._id) return;

      setUsers((prevUsers) => {
        const exists = prevUsers.some((user) => user._id === targetUser._id);
        return exists ? prevUsers : [targetUser, ...prevUsers];
      });
      setSelectedUserId(targetUser._id);
      setIsOpen(true);
    };

    window.addEventListener("chat:open-user", openChatForUser);
    return () => window.removeEventListener("chat:open-user", openChatForUser);
  }, []);

  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get(`${baseUrl}/api/chat/users/${userId}`);
        const data = Array.isArray(response.data) ? response.data : [];
        setUsers(data);
      } catch (error) {
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
        setMessages(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
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

  const handleSend = (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    socketRef.current?.emit("sendMessage", {
      receiverId: selectedUserId,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  if (!userId || !token) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {isOpen && (
        <div className="w-[340px] h-[520px] bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col mb-3">
          <div className="px-4 py-3 bg-gray-900 text-white flex items-center justify-between">
            <h3 className="text-sm font-semibold">Messages</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-200 hover:text-white"
              aria-label="Close messenger"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-[120px_1fr] h-full min-h-0">
            <div className="border-r border-gray-100 overflow-y-auto">
              {loadingUsers ? (
                <div className="text-xs text-gray-500 p-3">Loading...</div>
              ) : users.length === 0 ? (
                <div className="text-xs text-gray-500 p-3">No connected users yet</div>
              ) : (
                users.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => setSelectedUserId(user._id)}
                    className={`w-full p-2 text-left hover:bg-gray-50 ${
                      selectedUserId === user._id ? "bg-gray-50" : ""
                    }`}
                  >
                    <img
                      src={getImageUrl(user.profilePhoto) || "https://via.placeholder.com/48?text=U"}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover mx-auto"
                    />
                    <p className="text-[11px] mt-1 truncate text-center text-gray-700">{user.name}</p>
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-col min-h-0">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedUser ? selectedUser.name : "Select a user"}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50">
                {!selectedUserId ? (
                  <p className="text-xs text-gray-500">Select a user to start chat.</p>
                ) : loadingMessages ? (
                  <p className="text-xs text-gray-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-gray-500">Start the conversation.</p>
                ) : (
                  messages.map((message) => {
                    const senderId = message?.sender?._id || message?.sender;
                    const ownMessage = senderId === userId;
                    return (
                      <div
                        key={message._id}
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                          ownMessage
                            ? "ml-auto bg-primary text-white"
                            : "bg-white text-gray-800 border border-gray-100"
                        }`}
                      >
                        {message.content}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedUserId && (
                <form onSubmit={handleSend} className="p-2 border-t border-gray-100 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white rounded-lg p-2"
                    aria-label="Send message"
                  >
                    <FiSend size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
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
