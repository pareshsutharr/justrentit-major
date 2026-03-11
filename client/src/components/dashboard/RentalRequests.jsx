import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { format, formatDistance, differenceInHours } from "date-fns";
import { Loader2, AlertCircle, Info, Clock, CheckCircle2, Star } from "lucide-react";
import LoadingPage from "../loadingpages/LoadingPage";
import RatingPopup from "./RatingPopup";
import FilterComponent from "./FilterComponent";

const RentalProgress = React.lazy(() => import("./RentalProgress"));

const baseUrl = import.meta.env.VITE_API_BASE_URL;

/* ─── Status config ─────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: { label: "Pending Audit", cls: "bg-amber-50 text-amber-600", icon: Clock },
  approved: { label: "Ready", cls: "bg-indigo-50 text-indigo-600", icon: CheckCircle2 },
  rejected: { label: "Declined", cls: "bg-red-50 text-red-600", icon: AlertCircle },
  in_transit: { label: "Deploying", cls: "bg-blue-50 text-blue-600", icon: Loader2 },
  delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
  in_use: { label: "Live Operation", cls: "bg-purple-50 text-purple-600", icon: Info },
  return_in_transit: { label: "Returning", cls: "bg-blue-50 text-blue-600", icon: Loader2 },
  returned: { label: "Reclaimed", cls: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
  completed: { label: "Archive", cls: "bg-slate-50 text-slate-400", icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: "bg-slate-50 text-slate-400", icon: Info };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${cfg.cls}`}>
      <Icon size={10} className={status.includes("transit") ? "animate-spin" : ""} />
      {cfg.label}
    </span>
  );
};

/* ─── Alert ─────────────────────────────────────────────────────── */
const AlertBanner = ({ type = "info", children }) => {
  const config = {
    info: { icon: Info, cls: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    error: { icon: AlertCircle, cls: "bg-red-50 text-red-600 border-red-100" },
    success: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  };
  const { icon: Icon, cls } = config[type] || config.info;
  return (
    <div className={`flex items-start gap-4 p-6 rounded-[2rem] border animate-in fade-in duration-500 ${cls}`}>
      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon size={18} />
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed mt-1.5">{children}</p>
    </div>
  );
};

/* ─── Rental request card ───────────────────────────────────────── */
const RequestCard = ({ request, userId, isNew, onUpdate, onRateExperience }) => {
  const product = request.product || {};
  const owner = request.owner || {};
  const isCompleted = request.status === "completed";

  const imgSrc = product.images?.[0]
    ? `${baseUrl}${product.images[0]}`
    : null;

  return (
    <div className={`group relative bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isNew ? "border-indigo-200 shadow-2xl shadow-indigo-100/50" : "border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50"} ${isCompleted ? "opacity-60 grayscale-[0.2]" : ""}`}>
      {isNew && (
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-600 to-blue-500" />
      )}

      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Visual Identity */}
          <div className="w-full lg:w-48 h-48 rounded-[2rem] bg-slate-50 overflow-hidden flex-shrink-0 relative group-hover:scale-[1.02] transition-transform duration-700">
            {imgSrc ? (
              <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200">
                <Info size={48} strokeWidth={1} />
              </div>
            )}
            {isNew && (
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                Incoming
              </div>
            )}
          </div>

          {/* Operational Details */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{product.name || "Unknown Asset"}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Request ID: #{request._id?.slice(-8).toUpperCase()}</p>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asset Yield</p>
                <p className="text-sm font-black text-slate-900">₹{product.rentalPrice} <span className="text-[10px] text-slate-400">/ DAY</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Collateral</p>
                <p className="text-sm font-black text-slate-900">₹{product.securityDeposit || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 sm:col-span-2 lg:col-span-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Accountability</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black uppercase">
                    {owner.name?.[0] || "?"}
                  </div>
                  <span className="text-xs font-black text-indigo-900 tracking-tight">{owner.name}</span>
                </div>
              </div>
            </div>

            {/* Operational Windows */}
            <div className="flex flex-wrap items-center gap-10 py-6 border-y border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deployment window</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-900">{format(new Date(request.startDate), "MMM dd, yyyy")}</span>
                  <div className="w-4 h-px bg-slate-200" />
                  <span className="text-xs font-black text-slate-900">{format(new Date(request.endDate), "MMM dd, yyyy")}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rental Cycle</p>
                <span className="text-xs font-black text-slate-900">{formatDistance(new Date(request.startDate), new Date(request.endDate))}</span>
              </div>
            </div>

            {/* Execution Roadmap */}
            {request.status !== "rejected" && !isCompleted && (
              <div className="pt-4">
                <Suspense fallback={<div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50"><Loader2 size={16} className="animate-spin text-slate-400" /> <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing state...</span></div>}>
                  <RentalProgress
                    request={request}
                    userId={userId}
                    onUpdate={onUpdate}
                  />
                </Suspense>
              </div>
            )}

            {isCompleted && (
              <button
                onClick={() => onRateExperience(request)}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-indigo-600 text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Star size={16} /> Finalize Account & Rate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ────────────────────────────────────────────── */
const RentalRequests = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCompletedRequest, setSelectedCompletedRequest] = useState(null);
  const [filters, setFilters] = useState({
    productName: "",
    selectedStatuses: [],
    startDate: "",
    endDate: "",
    selectedCategories: [],
    minPrice: "",
    maxPrice: "",
    locationArea: "",
  });

  const userId = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?._id; }
    catch { return null; }
  })();

  useEffect(() => {
    axios.get(`${baseUrl}/api/categories`)
      .then(({ data }) => setCategories(data))
      .catch(() => { });
  }, []);

  const fetchRequests = async (type) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/api/rental-requests`, { params: { userId, type } });
      const sorted = (data.requests || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(sorted);
      setError("");
    } catch {
      setError("Strategic data retrieval failed. Please verify connection.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchRequests(activeTab); }, [activeTab, userId]);

  useEffect(() => {
    const filtered = requests.filter((r) => {
      const p = r.product || {};
      return (
        (p.name || "").toLowerCase().includes(filters.productName.toLowerCase()) &&
        (filters.selectedStatuses.length === 0 || filters.selectedStatuses.includes(r.status)) &&
        (!filters.startDate || new Date(r.startDate) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(r.endDate) <= new Date(filters.endDate)) &&
        (filters.selectedCategories.length === 0 || filters.selectedCategories.includes(p.category)) &&
        (!filters.minPrice || p.rentalPrice >= parseFloat(filters.minPrice)) &&
        (!filters.maxPrice || p.rentalPrice <= parseFloat(filters.maxPrice)) &&
        (!filters.locationArea || (p.location?.area || "").toLowerCase().includes(filters.locationArea.toLowerCase()))
      );
    });
    setFilteredRequests(filtered);
  }, [requests, filters]);

  const handleFilterChange = (e) => setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleResetFilters = () => setFilters({ productName: "", selectedStatuses: [], startDate: "", endDate: "", selectedCategories: [], minPrice: "", maxPrice: "", locationArea: "" });

  const TABS = [
    { id: "received", label: "Inbound Pipeline" },
    { id: "sent", label: "Outbound Requests" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Rental Operations</h1>
          <p className="text-base font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] text-xs">Execute & Coordinate Asset Rentals</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Requests</p>
            <p className="text-sm font-black text-slate-900">{filteredRequests.length < 10 ? `0${filteredRequests.length}` : filteredRequests.length} <span className="text-[10px] text-slate-300">Total</span></p>
          </div>
        </div>
      </div>

      {/* Control Interface */}
      <div className="space-y-10">
        <FilterComponent
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Tabbed Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-[1.5rem] w-fit">
          {TABS.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all
                  ${isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                    : "text-slate-400 hover:text-slate-900 hover:bg-white"
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stream */}
      {loading ? (
        <LoadingPage />
      ) : error ? (
        <AlertBanner type="error">{error}</AlertBanner>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-8 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
            <Clock size={32} strokeWidth={1.5} />
          </div>
          <p className="text-xl font-black text-slate-900 tracking-tight">Pipeline Clear</p>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest text-center max-w-sm">
            {activeTab === "received"
              ? "No incoming requests registered in the command center."
              : "No outbound deployment requests detected."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              userId={userId}
              isNew={differenceInHours(new Date(), new Date(request.createdAt)) < 24}
              onUpdate={(updated) =>
                setRequests((prev) => prev.map((r) => r._id === updated._id ? updated : r))
              }
              onRateExperience={setSelectedCompletedRequest}
            />
          ))}
        </div>
      )}

      {selectedCompletedRequest && (
        <RatingPopup
          request={selectedCompletedRequest}
          userId={userId}
          onClose={() => setSelectedCompletedRequest(null)}
        />
      )}
    </div>
  );
};

export default RentalRequests;
