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
  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 group">
    <div className="flex items-start justify-between">
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="space-y-1">
          <p className="text-3xl font-black text-slate-900 tracking-tighter">
            {value}{suffix}
          </p>
          {trend !== undefined && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black ${trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              <TrendingUp size={10} className={trend < 0 ? "rotate-180" : ""} />
              {trend >= 0 ? "+" : ""}{trend}%
            </div>
          )}
        </div>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${color} shadow-inner`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

/* ─── Quick action button ───────────────────────────────────────── */
const QuickAction = ({ icon: Icon, label, onClick, variant = "default" }) => {
  const variants = {
    default: "bg-white border border-slate-100 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 scale-100 active:scale-95",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${variants[variant]}`}
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
      icon: Package, label: "Market Inventory",
      value: stats.totalProducts, color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: CheckCircle, label: "Active Revenue Assets",
      value: stats.rentedProducts, color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Clock, label: "Pending Evaluations",
      value: stats.pendingRequests, color: "bg-amber-50 text-amber-600",
    },
    {
      icon: IndianRupee, label: "Gross Earnings",
      value: stats.estimatedEarnings ? stats.estimatedEarnings.toFixed(0) : "0",
      suffix: " INR",
      color: "bg-indigo-600 text-white",
    },
    {
      icon: Star, label: "Trust Score",
      value: stats.averageRating ? stats.averageRating.toFixed(1) : "—",
      color: "bg-amber-50 text-amber-500",
    },
    {
      icon: TrendingUp, label: "Completion Velocity",
      value: stats.completedRentals, color: "bg-slate-50 text-slate-600",
    },
  ];

  return (
    <div className="space-y-12 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h1>
          <p className="text-base font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] text-xs">Real-time Operations & Asset Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <QuickAction
            icon={PlusSquare}
            label="Deploy New Asset"
            variant="primary"
            onClick={() => onNavigate("rent-product")}
          />
          <QuickAction
            icon={ClipboardList}
            label="Audit Requests"
            onClick={() => onNavigate("rental-requests")}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Management Interface */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Control Panels</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: PlusSquare, title: "Asset Deployment",
                desc: "Initialize a new inventory item",
                action: "rent-product", color: "text-indigo-600 bg-indigo-50",
              },
              {
                icon: Package, title: "Inventory Management",
                desc: "Configure pricing & availability",
                action: "my-products", color: "text-emerald-600 bg-emerald-50",
              },
              {
                icon: ClipboardList, title: "Rental Pipeline",
                desc: "Review & finalize active requests",
                action: "rental-requests", color: "text-amber-600 bg-amber-50",
              },
              {
                icon: MessageSquare, title: "Secure Communications",
                desc: "Direct-to-user encrypted chat",
                action: "chat", color: "text-indigo-600 bg-slate-50",
              },
            ].map((item) => (
              <button
                key={item.action}
                onClick={() => onNavigate(item.action)}
                className="group flex flex-col gap-6 p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/30 transition-all duration-300 text-left"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{item.title}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] transform translate-x-0 group-hover:translate-x-2 transition-transform">
                  Access Portal <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2">Asset Intelligence</h2>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-10 shadow-sm">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Listing Saturation</p>
                  <p className="text-2xl font-black text-slate-900">{stats.totalProducts < 10 ? `0${stats.totalProducts}` : stats.totalProducts} <span className="text-xs text-slate-300">Units</span></p>
                </div>
              </div>
              <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: stats.totalProducts > 0 ? "100%" : "0%" }}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Network Utilization</p>
                  <p className="text-2xl font-black text-slate-900">{stats.rentedProducts < 10 ? `0${stats.rentedProducts}` : stats.rentedProducts} <span className="text-xs text-slate-300">Active</span></p>
                </div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  {stats.totalProducts > 0 ? Math.round((stats.rentedProducts / stats.totalProducts) * 100) : 0}% Yield
                </p>
              </div>
              <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${stats.rentedProducts > 0 ? "bg-emerald-500" : "bg-slate-200"}`}
                  style={{
                    width: stats.totalProducts > 0
                      ? `${Math.min(100, (stats.rentedProducts / stats.totalProducts) * 100)}%`
                      : "0%"
                  }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">Optimized</p>
                </div>
              </div>
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
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[var(--page-max-width)] mx-auto w-full px-4 py-6 sm:px-10 sm:py-10">
        <div className="relative flex min-h-[calc(100vh-10rem)] shadow-2xl shadow-indigo-100/20 rounded-[3rem] border border-white bg-white/80 backdrop-blur-xl overflow-hidden">

          {/* ── Mobile Logic ────────────────────────────────────────── */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-300"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-40 flex flex-col
              bg-white lg:bg-transparent border-r border-slate-100
              transition-all duration-500 ease-in-out
              ${sidebarCollapsed ? "w-24" : "w-72"}
              ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
          >
            {/* Sidebar Identity */}
            <div className={`flex items-center h-24 px-8 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
              {!sidebarCollapsed && (
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
                    <Home size={18} className="text-white" />
                  </div>
                  <span className="text-slate-900 font-black text-lg tracking-tighter">JustRentIt</span>
                </Link>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex w-10 h-10 rounded-xl hover:bg-slate-50 items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const isActive = activeComponent === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleNavigate(id)}
                    title={sidebarCollapsed ? label : undefined}
                    className={`
                      w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group
                      ${isActive
                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                      }
                      ${sidebarCollapsed ? "justify-center px-0" : ""}
                    `}
                  >
                    <Icon size={20} className={`flex-shrink-0 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110 group-hover:rotate-3"}`} />
                    {!sidebarCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>}
                  </button>
                );
              })}
            </nav>

            {!sidebarCollapsed && (
              <div className="p-8">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
                >
                  <ArrowRight size={14} className="rotate-180" />
                  Exit Portal
                </Link>
              </div>
            )}
          </aside>

          {/* ── Main Viewport ────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 bg-white/40 overflow-hidden flex flex-col">
            <header className="h-24 px-8 border-b border-slate-50 flex items-center lg:hidden">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-900 uppercase tracking-widest"
              >
                <Menu size={18} />
                Systems Menu
              </button>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-6xl mx-auto p-8 lg:p-12">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
