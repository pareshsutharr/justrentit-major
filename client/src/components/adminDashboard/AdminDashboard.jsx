import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import UserProfiles from "../UserProfiles";
import UserManagement from "./TeamsData";
import Chat from "../dashboard/Chat";
import {
  Home,
  User,
  Package,
  MessageSquare,
  Bell,
  BarChart,
  Tag,
  ClipboardList,
  FileText,
  ChartArea,
} from "lucide-react";
import { UsersFour } from "phosphor-react";
import "./Dashboard.css";
import CategoryMenu from "./CategoryMenu";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ProductManagement from "./ProductManagement";
import RentalManagement from "./RentalManagement";
import { FaDownload } from "react-icons/fa";
import { Chart } from "chart.js";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
function AdminDashboard() {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    totalProducts: 0,
    verifiedProducts: 0,
    pendingVerifications: 0,
    totalRentalRequests: 0,
    activeRentals: 0,
    categoryCount: 0,
    featuredProducts: 0,
    unreadNotifications: 0,
    activeChats: 0,
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setStats({
          ...response.data,
          unreadNotifications: response.data.unreadNotifications || 0,
          activeChats: response.data.activeChats || 0,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchAdminStats();
  }, []);

  const renderContent = () => {
    switch (activeComponent) {
      case "user-management":
        return <UserManagement />;
      case "Profile":
        return <UserProfiles />;
      case "chat":
        return <Chat/>;
      case "product-management":
        return <ProductManagement />;
      case "category-management":
        return <CategoryMenu />;
      case "rental-management":
        return <RentalManagement />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "report":
        return <ReportComponent />;
      default:
        return <DashBoardMenu stats={stats} />;
    }
  };

  return (
    <div className="dashboard-container">
      <Header />

      <div className="main-content">
        <div className="sidebar">
          <h2 className="sidebar-title">Admin Portal</h2>
          <ul className="sidebar-menu">
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("dashboard")}
            >
              <Home size={20} className="sidebar-icon" />
              Overview
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("user-management")}
            >
              <UsersFour size={20} className="sidebar-icon" />
              User Management
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("product-management")}
            >
              <Package size={20} className="sidebar-icon" />
              Products
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("category-management")}
            >
              <Tag size={20} className="sidebar-icon" />
              Categories
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("rental-management")}
            >
              <ClipboardList size={20} className="sidebar-icon" />
              Rentals
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("analytics")}
            >
              <BarChart size={20} className="sidebar-icon" />
              Analytics
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("chat")}
            >
              <ChartArea size={20} className="sidebar-icon" />
              Chat
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("Profile")}
            >
              <User size={20} className="sidebar-icon" />
              Profile
            </li>
            <li
              className="sidebar-item"
              onClick={() => setActiveComponent("report")}
            >
              <FileText size={20} className="sidebar-icon" />
              Generate Report
            </li>
          </ul>
        </div>

        <div className="main-content-area">{renderContent()}</div>
      </div>
      <Footer />
    </div>
  );
}

const DashBoardMenu = ({ stats }) => (
  <div>
    <h1 className="dashboard-welcome-title">Admin Dashboard Overview</h1>
    <div className="stats-container">
      <div className="stat-box shining" style={{ background: "#E3F2FD" }}>
        <h3>Total Users</h3>
        <p>
          {stats.totalUsers} (Admins: {stats.adminCount})
        </p>
      </div>
      <div className="stat-box shining" style={{ background: "#E8F5E9" }}>
        <h3>Total Products</h3>
        <p>
          {stats.totalProducts} (Verified: {stats.verifiedProducts})
        </p>
      </div>
      <div className="stat-box shining" style={{ background: "#FFF3E0" }}>
        <h3>Pending Verifications</h3>
        <p>{stats.pendingVerifications}</p>
      </div>
      <div className="stat-box shining" style={{ background: "#EDE7F6" }}>
        <h3>Rental Requests</h3>
        <p>Total: {stats.totalRentalRequests}</p>
        <p>Active: {stats.activeRentals}</p>
      </div>
      <div className="stat-box shining" style={{ background: "#FCE4EC" }}>
        <h3>Product Categories</h3>
        <p>{stats.categoryCount} Categories</p>
      </div>
      <div className="stat-box shining" style={{ background: "#E8F5E9" }}>
        <h3>Featured Products</h3>
        <p>{stats.featuredProducts}</p>
      </div>
    </div>
  </div>
);

export default AdminDashboard;

const ReportComponent = () => {
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('${baseUrl}/api/admin/generate-report', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'website-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Report download failed:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h2>📊 Generate Website Report</h2>
      <p>This report will include:</p>
      <ul className="report-features">
        <li>👥 User statistics and growth</li>
        <li>🛒 Product inventory analysis</li>
        <li>🚗 Rental activity overview</li>
        <li>🖥️ System health metrics</li>
        <li>📌 Recommendations for improvement</li>
      </ul>
      
      <button 
        onClick={generateReport} 
        disabled={loading}
        className="generate-report-btn"
      >
        {loading ? 'Generating...' : <><FaDownload /> Download Full Report (PDF)</>}
      </button>
    </div>
  );
};