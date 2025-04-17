import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RentProductForm from "./RentProductForm";
import Header from "../Header";
import Footer from "../Footer";
import MyProduct from "./MyProduct";
import "./Dashboard.css";
import Chat from "./Chat";
import RentalRequests from "./RentalRequests"; // Ensure this component exists
import UserProfiles from "../UserProfiles";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Home, User, Package, PlusSquare, ClipboardList, MessageSquare} from "lucide-react";
// import AdminDashboard from "../AdminDashboard/AdminDashboard";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
function Dashboard() {
  const [showRentProductForm, setShowRentProductForm] = useState(false);
  const [showMyProducts, setShowMyProducts] = useState(false);
  const [initialChatReceiver, setInitialChatReceiver] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [activeComponent, setActiveComponent] = useState("dashboard"); // Add this state
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    rentedProducts: 0,
    pendingRequests: 0,
    completedRentals: 0,
    estimatedEarnings: 0,
    averageRating: 0,
  });

  useEffect(() => {
    // Existing state checks
    if (location.state?.openChatWith) {
      setActiveComponent("chat");
      setInitialChatReceiver(location.state.openChatWith);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const toggleRentProductForm = () => {
    setShowRentProductForm(true);
    setShowMyProducts(false);
    setActiveComponent("rent-product");
  };
  const toggleProfile = () => {
    setShowRentProductForm(true);
    setShowMyProducts(false);
    setActiveComponent("Profile");
  };

  const toggleMyProduct = () => {
    setShowMyProducts(true);
    setShowRentProductForm(false);
    setActiveComponent("my-products");
  };
  const toggleDashboard = () => {
    setShowMyProducts(true);
    setShowRentProductForm(false);
    setActiveComponent("home");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        // console.log("Stored User ID:", storedUserId);
        const userId = storedUserId; // Remove JSON.parse
        if (userId) {
          const response = await axios.get(
            `${baseUrl}/api/my-products`,
            {
              params: { userId: String(userId) }, // Convert to string explicitly
            }
          );
          // console.log("Raw API Response:", response.data);
          setProductCount(
            response.data.success ? response.data.products.length : 0
          );
        }
      } catch (error) {
        console.error("Error fetching user products:", error);
        setProductCount(0);
      }
    };

    fetchProducts();
  }, []);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        // console.log("token" + token);
        if (!token) {
          console.error("No token found");
          return;
        }
        const response = await axios.get(
     `${baseUrl}/api/dashboard-stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log("Dashboard Stats Response:", response.data);
        const statsData = response.data.stats;
        setStats({
          totalProducts: statsData.totalProducts || 0,
          rentedProducts: statsData.rentedProducts || 0,
          pendingRequests: statsData.pendingRequests || 0,
          completedRentals: statsData.completedRentals || 0,
          estimatedEarnings: statsData.estimatedEarnings || 0,
          averageRating: statsData.averageRating || 0,
        });
      } catch (error) {
        console.error(
          "Error fetching dashboard stats:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (location.state?.showProfile) {
      setActiveComponent("Profile");
      // Clear state after navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.showProducts) {
      setActiveComponent("my-products");
      // Clear state after navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.productUpdate) {
      setActiveComponent("my-products");
      // Clear state after navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.rentalRequest) {
      setActiveComponent("rental-requests");
      // Clear state after navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const renderContent = () => {
    if (activeComponent === "rent-product") return <RentProductForm />;
    if (activeComponent === "rental-requests") return <RentalRequests />;
    if (activeComponent === "my-products") return <MyProduct />;
    // if (activeComponent === "chat") return <Chat />;
    if (activeComponent === "Profile") return <UserProfiles />;
    if (activeComponent === "chat") return <Chat initialReceiverId={initialChatReceiver} />;
    if (activeComponent === "home") return <DashBoardMenu stats={stats} />;
    return <DashBoardMenu stats={stats} />;
  };

  return (
    <div className="dashboard-container">
      <Header />

      <div className="main-content">
        <div className="sidebar">
          <h2 className="sidebar-title">Dashboard</h2>
          <ul className="sidebar-menu">
            <li className="home sidebar-item " onClick={toggleDashboard}>
              <Home size={20} className="sidebar-icon" />
              Home
            </li>

            <li className="Profile sidebar-item" onClick={toggleProfile}>
              <User size={20} className="sidebar-icon" />
              Profile
            </li>
            <li className="sidebar-item" onClick={toggleMyProduct}>
              <Package size={20} className="sidebar-icon" />
              My Products
            </li>
            <li className="sidebar-item" onClick={toggleRentProductForm}>
              <PlusSquare size={20} className="sidebar-icon" />
              Add a Product
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("rental-requests")}
            >
              <ClipboardList size={20} className="sidebar-icon" />
              Rental Requests
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("chat")}
            >
              <MessageSquare size={20} className="sidebar-icon" />
              Chat
            </li>
          </ul>
        </div>

        <div className="main-content-area">{renderContent()}</div>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;

const DashBoardMenu = ({ stats }) => (
  <div>
    <h1 className="dashboard-welcome-title">Welcome to Your Dashboard</h1>
    <div className="stats-container">
      <div className="stat-box shining" style={{ background: "#E3F2FD" }}>
        <h3>Your Products</h3>
        <p>{stats.totalProducts} Listed</p>
      </div>
      <div className="stat-box shining" style={{ background: "#E8F5E9" }}>
        <h3>Rented Out</h3>
        <p>{stats.rentedProducts}</p>
      </div>
      <div className="stat-box shining" style={{ background: "#FFF3E0" }}>
        <h3>Pending Requests</h3>
        <p>{stats.pendingRequests}</p>
      </div>
      <div className="stat-box shining" style={{ background: "#EDE7F6" }}>
        <h3>Completed Rentals</h3>
        <p>{stats.completedRentals}</p>
      </div>
      <div className="stat-box shining" style={{ background: "#FCE4EC" }}>
        <h3>Average Rating</h3>
        <p>{stats.averageRating?.toFixed(1) || "N/A"}</p>
      </div>
      <div className="stat-box shining" style={{ background: "#E8F5E9" }}>
        <h3>Earnings</h3>
        <p>{stats.estimatedEarnings?.toFixed(2) || "0.00"}</p>
      </div>
    </div>
  </div>
);
