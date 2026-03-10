import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Package, PlusSquare, ClipboardList,
  User, MessageSquare, ChevronLeft, ChevronRight,
  TrendingUp, Star, IndianRupee, Clock, CheckCircle,
  ArrowRight, Menu, X, Home, FileText,
} from "lucide-react";
import RentProductForm from "./RentProductForm";
import MyProduct from "./MyProduct";
import Chat from "./Chat";
import RentalRequests from "./RentalRequests";
import UserProfiles from "../UserProfiles";
import Invoices from "./Invoices";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

/* ─── Sidebar nav items ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "home", label: "Overview", icon: LayoutDashboard },
  { id: "my-products", label: "My Products", icon: Package },
  { id: "rent-product", label: "List a Product", icon: PlusSquare },
  { id: "rental-requests", label: "Rental Requests", icon: ClipboardList },
  { id: "chat", label: "Messages", icon: MessageSquare },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "Profile", label: "Profile", icon: User },
];

/* ─── Stat card component ───────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, trend, suffix = "" }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value}{suffix}
        </p>
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${trend >= 0 ? "text-success" : "text-error"}`}>
            <TrendingUp size={12} />
            {trend >= 0 ? "+" : ""}{trend}% this month
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

/* ─── Quick action button ───────────────────────────────────────── */
const QuickAction = ({ icon: Icon, label, onClick, variant = "default" }) => {
  const variants = {
    default: "bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary",
    primary: "bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${variants[variant]}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
};

/* ─── Dashboard overview ────────────────────────────────────────── */
const DashboardOverview = ({ stats, onNavigate }) => {
  const statCards = [
    {
      icon: Package, label: "Listed Products",
      value: stats.totalProducts, color: "bg-primary-light text-primary",
    },
    {
      icon: CheckCircle, label: "Rented Out",
      value: stats.rentedProducts, color: "bg-success-light text-success",
    },
    {
      icon: Clock, label: "Pending Requests",
      value: stats.pendingRequests, color: "bg-warning-light text-warning",
    },
    {
      icon: TrendingUp, label: "Completed Rentals",
      value: stats.completedRentals, color: "bg-info-light text-info",
    },
    {
      icon: Star, label: "Average Rating",
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "—",
      color: "bg-amber-50 text-amber-500",
    },
    {
      icon: IndianRupee, label: "Est. Earnings",
      value: stats.estimatedEarnings ? `₹${stats.estimatedEarnings.toFixed(0)}` : "₹0",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2">
          <QuickAction
            icon={PlusSquare}
            label="List a Product"
            variant="primary"
            onClick={() => onNavigate("rent-product")}
          />
          <QuickAction
            icon={ClipboardList}
            label="View Requests"
            onClick={() => onNavigate("rental-requests")}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Getting started / activity section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick start */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              {
                icon: PlusSquare, title: "List a new product",
                desc: "Add an item to rent out to your community",
                action: "rent-product", color: "text-primary bg-primary-light",
              },
              {
                icon: Package, title: "Manage my products",
                desc: "Edit availability, pricing and details",
                action: "my-products", color: "text-info bg-info-light",
              },
              {
                icon: ClipboardList, title: "Review rental requests",
                desc: "Approve or decline incoming requests",
                action: "rental-requests", color: "text-warning bg-warning-light",
              },
              {
                icon: MessageSquare, title: "Open messages",
                desc: "Chat with renters and owners",
                action: "chat", color: "text-success bg-success-light",
              },
            ].map((item) => (
              <button
                key={item.action}
                onClick={() => onNavigate(item.action)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary-light/30 transition-all group text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary flex-shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Status summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Status Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Active listings</span>
              <span className="font-semibold text-gray-900">{stats.totalProducts}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: stats.totalProducts > 0 ? "100%" : "0%" }}
              />
            </div>
            <div className="flex justify-between items-center text-sm mt-4">
              <span className="text-gray-500">Currently rented</span>
              <span className="font-semibold text-gray-900">{stats.rentedProducts}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-success h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: stats.totalProducts > 0
                    ? `${Math.min(100, (stats.rentedProducts / stats.totalProducts) * 100)}%`
                    : "0%"
                }}
              />
            </div>
            <div className="flex justify-between items-center text-sm mt-4">
              <span className="text-gray-500">Completion rate</span>
              <span className="font-semibold text-gray-900">
                {stats.completedRentals > 0 && stats.rentedProducts > 0
                  ? `${Math.round((stats.completedRentals / (stats.completedRentals + stats.rentedProducts)) * 100)}%`
                  : "—"
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Dashboard ────────────────────────────────────────────── */
export default function Dashboard() {
  const [activeComponent, setActiveComponent] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [initialChatReceiver, setInitialChatReceiver] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0, rentedProducts: 0, pendingRequests: 0,
    completedRentals: 0, estimatedEarnings: 0, averageRating: 0,
  });

  const location = useLocation();
  const navigate = useNavigate();

  /* Handle location state from notifications */
  useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.openChatWith) {
      setActiveComponent("chat");
      setInitialChatReceiver(state.openChatWith);
    } else if (state.showProfile) setActiveComponent("Profile");
    else if (state.showInvoices) setActiveComponent("invoices");
    else if (state.showProducts) setActiveComponent("my-products");
    else if (state.productUpdate) setActiveComponent("my-products");
    else if (state.rentalRequest) setActiveComponent("rental-requests");
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state]);

  /* Fetch stats */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${baseUrl}/api/dashboard-stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (data.stats) {
          const s = data.stats;
          setStats({
            totalProducts: s.totalProducts || 0,
            rentedProducts: s.rentedProducts || 0,
            pendingRequests: s.pendingRequests || 0,
            completedRentals: s.completedRentals || 0,
            estimatedEarnings: s.estimatedEarnings || 0,
            averageRating: s.averageRating || 0,
          });
        }
      })
      .catch(() => { });
  }, []);

  const handleNavigate = useCallback((id) => {
    setActiveComponent(id);
    setMobileSidebarOpen(false);
  }, []);

  const renderContent = () => {
    switch (activeComponent) {
      case "rent-product": return <RentProductForm />;
      case "rental-requests": return <RentalRequests />;
      case "my-products": return <MyProduct />;
      case "chat": return <Chat initialReceiverId={initialChatReceiver} />;
      case "invoices": return <Invoices />;
      case "Profile": return <UserProfiles />;
      default:
        return (
          <DashboardOverview stats={stats} onNavigate={handleNavigate} />
        );
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-[var(--page-max-width)] mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="relative flex min-h-[calc(100vh-7rem)] overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">

          {/* ── Mobile overlay ───────────────────────────────────────── */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/35 z-30 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-40 flex flex-col
              bg-sidebar-bg text-sidebar-text border-r border-gray-200
              transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? "w-16" : "w-60"}
              ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
          >
            {/* Logo area */}
            <div className={`flex items-center h-16 px-4 border-b border-gray-200 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
              {!sidebarCollapsed && (
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                    <Home size={14} className="text-white" />
                  </div>
                  <span className="text-gray-900 font-semibold text-sm">JustRentIt</span>
                </Link>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex w-7 h-7 rounded-lg hover:bg-sidebar-hover items-center justify-center text-sidebar-text hover:text-gray-900 transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden w-7 h-7 rounded-lg hover:bg-sidebar-hover items-center justify-center text-sidebar-text hover:text-gray-900 flex"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
              {sidebarCollapsed && (
                <div className="flex justify-center mb-2">
                  <Link to="/">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                      <Home size={14} className="text-white" />
                    </div>
                  </Link>
                </div>
              )}
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const isActive = activeComponent === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleNavigate(id)}
                    title={sidebarCollapsed ? label : undefined}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-150
                      ${isActive
                        ? "bg-sidebar-active text-gray-900 border border-primary/20"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-gray-900"
                      }
                      ${sidebarCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span>{label}</span>}
                  </button>
                );
              })}
            </nav>

            {!sidebarCollapsed && (
              <div className="p-3 border-t border-gray-200">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-sidebar-text hover:text-gray-900 hover:bg-sidebar-hover transition-colors"
                >
                  <ArrowRight size={14} className="rotate-180" />
                  Back to site
                </Link>
              </div>
            )}
          </aside>

          {/* ── Main area ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 overflow-hidden bg-gray-50/70">
            <main className="h-full overflow-y-auto">
              <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="lg:hidden mb-4">
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Menu size={18} />
                    Menu
                  </button>
                </div>
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
