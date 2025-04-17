// NotificationComponent.js
import React, { useState, useEffect } from "react";
import { Dropdown, Badge, ListGroup, Spinner } from "react-bootstrap";
import axios from "axios";
import { MdNotifications, MdNotificationsActive } from "react-icons/md";
import moment from "moment";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./loadingpages/LoadingForLocation";
// import LoadingPage from "./loadingpages/LoadingPageLocation";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const NotificationComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/notifications`, {
        params: { userId },
      });
      if (response.data.success) {
        const sorted = response.data.notifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
        const unread = sorted.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      toast.error("Error loading notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
      `${baseUrl}/notifications/${notificationId}/read`
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      toast.error("Error updating notification");
    }
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification._id);

    if (notification.type === "profile_update") {
      navigate("/dashboard", { state: { showProfile: true } });
    }
    if (notification.type === "product_updated") {
      navigate("/dashboard", { state: { productUpdate: true } });
    }
    if (notification.type === "product_added") {
      navigate("/dashboard", { state: { showProducts: true } });
    }
    if (notification.type === "product_deleted") {
      navigate("/dashboard", { state: { showProducts: true } });
    }
    if (notification.type === "product_request_send") {
      navigate("/dashboard", { state: { rentalRequest: true } });
    }
  };

  useEffect(() => {
    if (visible) fetchNotifications();
  }, [visible]);

  useEffect(() => {
    if (userId) {
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  return (
    <Dropdown show={visible} onToggle={setVisible} align="end">
      <Dropdown.Toggle variant="light" className="position-relative"  style={{border:'1px solid black'}}>
        {unreadCount > 0 ? (
          <MdNotificationsActive size={24} className="text-primary" />
        ) : (
          <MdNotifications size={24} />
        )}
        {unreadCount > 0 && (
          <Badge
            pill
            bg="danger"
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: "0.6rem" }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="p-0"
        style={{
          minWidth: "350px",
          maxHeight: "60vh",
          overflowY: "auto",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          borderRadius: "10px",
          border: "none",
        }}
      >
        <Dropdown.Header className="d-flex justify-content-between align-items-center">
          <span>Notifications</span>
          <div>
            <small
              className="text-muted cursor-pointer me-2"
              onClick={fetchNotifications}
            >
              Refresh
            </small>
            <small
              className="text-muted cursor-pointer"
              onClick={() => setVisible(false)}
            >
              Close
            </small>
          </div>
        </Dropdown.Header>

        {loading ? (
            <LoadingPage/>
        ) : notifications.length === 0 ? (
          <Dropdown.ItemText className="text-muted text-center py-2">
            No notifications available
          </Dropdown.ItemText>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <ListGroup.Item
                key={notification._id}
                className={`d-flex align-items-start p-3 ${
                  !notification.read ? "bg-light" : ""
                }`}
                action
                onClick={() => handleNotificationClick(notification)}
                style={{
                  borderBottom: "1px solid #eee",
                  transition: "all 0.2s ease",
                }}
              >
                <div className="ms-2 w-100">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="fw-bold" style={{ color: "#2c3e50" }}>
                      {notification.message}
                    </small>
                    {!notification.read && (
                      <span className="badge bg-primary rounded-pill">New</span>
                    )}
                  </div>
                  <small
                    className="text-muted d-block mt-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {moment(notification.createdAt).fromNow()}
                  </small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationComponent;
