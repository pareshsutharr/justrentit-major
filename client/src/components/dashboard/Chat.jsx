import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { format } from "date-fns";
import "./Chat.css";
import { MdDelete } from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from "react-icons/fa";
import { getImageUrl } from "../../utils/productHelpers";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const Chat = ({ initialReceiverId = "" }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [chatUsers, setChatUsers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const socket = useRef(null);
  const userId = localStorage.getItem("userId");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (initialReceiverId) {
      setReceiverId(String(initialReceiverId));
    }
  }, [initialReceiverId]);
  useEffect(() => {
    return () => {
      // Clear receiverId when leaving chat
      setReceiverId("");
    };
  }, []);

  useEffect(() => {
    socket.current = io(`${baseUrl}`, { query: { token } });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data.users)) {
          const filteredUsers = response.data.users.filter(
            (user) => user._id !== userId
          );
          setChatUsers(filteredUsers);
        } else {
          console.error("Unexpected API response:", response.data);
          setChatUsers([]);
        }

        setError("");
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || "Error loading users");
        setChatUsers([]);
        if (err.response?.status === 401) {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) fetchUsers();
  }, [userId, token]);

  useEffect(() => {
    if (!socket.current || !receiverId) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/chat/${userId}/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
        setUnreadMessages((prev) => ({ ...prev, [receiverId]: 0 }));
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.response?.data?.message || "Error loading messages");
      }
    };

    socket.current.emit("joinChat", userId);
    fetchMessages();

    const messageHandler = (message) => {
      if ([message.sender._id, message.receiver._id].includes(receiverId)) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnreadMessages((prev) => ({
          ...prev,
          [message.sender._id]: (prev[message.sender._id] || 0) + 1,
        }));
      }
    };

    socket.current.on("receiveMessage", messageHandler);
    return () => socket.current.off("receiveMessage", messageHandler);
  }, [receiverId, userId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return alert("Message cannot be empty");
    if (!receiverId) return alert("Please select a recipient");

    try {
      socket.current.emit("sendMessage", {
        receiverId,
        content: newMessage,
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  const filteredUsers = chatUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      (user.contactNumber && user.contactNumber.includes(searchQuery))
    );
  });

  if (loading) return <div className="chat-container">Loading...</div>;

  const handleDeleteChat = async () => {
    if (!receiverId) return alert("Please select a chat to delete.");

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${baseUrl}/api/chat/${userId}/${receiverId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages([]);
      alert("Chat deleted successfully.");
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat.");
    }
  };
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !receiverId) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('receiver', receiverId); // Add receiver to form data

      const response = await axios.post(
        `${baseUrl}/api/chat`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      socket.current.emit('sendMessage', {
        receiverId,
        imageUrl: response.data.imageUrl,
        messageType: 'image'
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="chat-container animate-in fade-in slide-in-from-bottom-4 duration-500">
      {error && <div className="absolute top-4 inset-x-4 z-50 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-xl">{error}</div>}

      <div className="chat-users">
        <h3>Secure Communications</h3>

        <div className="user-search-wrapper">
          <div className="input-group">
            <FaSearch className="text-slate-300" size={14} />
            <input
              type="text"
              placeholder="LOCATE OPERATOR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ul className="custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="no-messages mt-10">No records found</div>
          ) : (
            filteredUsers.map((user) => (
              <li
                key={user._id}
                onClick={() => setReceiverId(user._id)}
                className={receiverId === user._id ? "active" : ""}
              >
                <img
                  src={getImageUrl(user.profilePhoto) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=e2e8f0&color=334155`}
                  alt={user.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=e2e8f0&color=334155`;
                  }}
                />
                <div className="user-info">
                  <span>{user.name}</span>
                  {user.contactNumber && <small>{user.contactNumber}</small>}
                </div>
                {unreadMessages[user._id] > 0 && (
                  <span className="notification-dot">
                    {unreadMessages[user._id]}
                  </span>
                )}
                <button
                  className="delete-chat-btn"
                  onClick={(e) => { e.stopPropagation(); handleDeleteChat(); }}
                >
                  <MdDelete size={16} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="chat-messages">
        {receiverId ? (
          <>
            <div className="messages-list custom-scrollbar">
              {messages.length === 0 ? (
                <div className="no-messages">
                  System Ready. Initialize communication stream.
                </div>
              ) : (
                messages.map((message) => {
                  const isSentByUser = message.sender._id === userId;
                  return (
                    <div key={message._id} className={`message ${isSentByUser ? 'sent' : 'received'}`}>
                      {message.messageType === 'image' ? (
                        <div className="message-image">
                          <img
                            src={message.imageUrl}
                            alt="Encrypted Data"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                          <span className="message-time">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </span>
                        </div>
                      ) : (
                        <div className="message-content">
                          <p className="m-0">{message.content}</p>
                          <span className="message-time">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="message-input">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
                id="imageInput"
                disabled={isUploading}
              />
              <label htmlFor="imageInput" className="image-upload-button">
                📷
              </label>

              <div className="message-input-wrapper">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="TRANSMIT MESSAGE..."
                  disabled={isUploading}
                />
              </div>

              <button type="submit" className="send-button" disabled={isUploading}>
                {isUploading ? "PROCESS..." : "SEND"}
              </button>
            </form>
          </>
        ) : (
          <div className="select-user">
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
              <FaSearch size={22} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select an operator to begin session</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
