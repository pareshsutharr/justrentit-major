import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiBell, FiHeart, FiMenu, FiUser, FiX } from "react-icons/fi";
import { getApiBaseUrl, getImageUrl } from "../../utils/productHelpers";
import { getFavoriteProductIds } from "../../utils/favorites";

const baseUrl = getApiBaseUrl();
const readStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(getFavoriteProductIds().length);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    const syncAuthState = () => {
      setUser(readStoredUser());
    };
    const syncFavorites = () => setFavoriteCount(getFavoriteProductIds().length);

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("favorites:changed", syncFavorites);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("favorites:changed", syncFavorites);
    };
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;

    const fetchLatestUser = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/user/${userId}`);
        if (response.data?.success && response.data.user) {
          const mergedUser = {
            ...user,
            ...response.data.user,
            role: response.data.user.role || user?.role || "User",
          };
          setUser(mergedUser);
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } catch (error) {
        // Keep existing local user state if refresh fails.
      }
    };

    fetchLatestUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = useMemo(() => {
    if (!user?.name) return "Account";
    return user.name.length > 16 ? `${user.name.slice(0, 16)}...` : user.name;
  }, [user]);
  const unreadNotificationCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    if (!user?._id) return;
    setNotificationLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/notifications`, {
        params: { userId: user._id },
      });
      const items = response?.data?.notifications || [];
      setNotifications(items);
    } catch (error) {
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setUser(null);
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  const closeAllMenus = () => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationMenuOpen(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${baseUrl}/notifications/${notificationId}/read`);
      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      // Keep UI stable if mark-as-read fails.
    }
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification._id);
    setIsNotificationMenuOpen(false);

    if (notification.type === "profile_update") {
      navigate("/dashboard", { state: { showProfile: true } });
      return;
    }
    if (notification.type === "product_updated") {
      navigate("/dashboard", { state: { productUpdate: true } });
      return;
    }
    if (notification.type === "product_added" || notification.type === "product_deleted") {
      navigate("/dashboard", { state: { showProducts: true } });
      return;
    }
    if (notification.type === "product_request_send") {
      navigate("/dashboard", { state: { rentalRequest: true } });
      return;
    }
    navigate("/dashboard");
  };

  const userAvatar = user?.profilePhoto ? (
    <img
      src={getImageUrl(user.profilePhoto)}
      alt={user.name || "User"}
      className="h-8 w-8 rounded-full object-cover border border-gray-200"
    />
  ) : (
    <span className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 grid place-items-center border border-gray-200">
      <FiUser size={16} />
    </span>
  );

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" onClick={closeAllMenus} className="font-bold text-2xl tracking-tight text-gray-900">
              JustRent<span className="text-primary">It</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Explore
              </NavLink>
              <NavLink to="/favorites" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <FiHeart size={16} />
                Favorites
                {favoriteCount > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-red-50 text-red-600 text-xs grid place-items-center">
                    {favoriteCount}
                  </span>
                )}
              </NavLink>
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotificationMenuOpen((prev) => !prev)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <FiBell size={16} />
                    Notifications
                    {unreadNotificationCount > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-red-50 text-red-600 text-xs grid place-items-center">
                        {unreadNotificationCount}
                      </span>
                    )}
                  </button>
                  {isNotificationMenuOpen && (
                    <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">Notifications</span>
                        <button
                          type="button"
                          className="text-xs text-primary hover:text-primary-hover"
                          onClick={fetchNotifications}
                        >
                          Refresh
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notificationLoading ? (
                          <p className="px-3 py-3 text-xs text-gray-500">Loading...</p>
                        ) : notifications.length === 0 ? (
                          <p className="px-3 py-3 text-xs text-gray-500">No notifications available</p>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification._id}
                              type="button"
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left px-3 py-3 border-b border-gray-50 hover:bg-gray-50 ${
                                !notification.read ? "bg-blue-50/40" : ""
                              }`}
                            >
                              <p className="text-sm text-gray-800">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  {userAvatar}
                  <span className="text-sm font-medium text-gray-800">{displayName}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg p-2">
                    <Link to="/dashboard" onClick={closeAllMenus} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                      Dashboard
                    </Link>
                    {user?.role === "Admin" && (
                      <Link to="/admin" onClick={closeAllMenus} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">
                  Log in
                </Link>
                <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="md:hidden text-gray-600 hover:text-gray-900 p-2"
          >
            {isMobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link to="/products" onClick={closeAllMenus} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Explore
            </Link>
            <Link to="/favorites" onClick={closeAllMenus} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Favorites ({favoriteCount})
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => {
                  navigate("/dashboard");
                  closeAllMenus();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Notifications ({unreadNotificationCount})
              </button>
            )}
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  {userAvatar}
                  <span className="text-sm font-medium text-gray-800">{user.name || "User"}</span>
                </div>
                <Link to="/dashboard" onClick={closeAllMenus} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Dashboard
                </Link>
                {user?.role === "Admin" && (
                  <Link to="/admin" onClick={closeAllMenus} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeAllMenus} className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Log in
                </Link>
                <Link to="/register" onClick={closeAllMenus} className="block px-3 py-2 rounded-lg text-sm text-white bg-primary hover:bg-primary-hover">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
