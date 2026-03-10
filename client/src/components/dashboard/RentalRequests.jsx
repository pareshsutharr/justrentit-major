import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { format, formatDistance, differenceInHours } from "date-fns";
import { Loader2, AlertCircle, Info, Clock, CheckCircle2 } from "lucide-react";
import LoadingPage from "../loadingpages/LoadingPage";
import RatingPopup from "./RatingPopup";
import FilterComponent from "./FilterComponent";

const RentalProgress = React.lazy(() => import("./RentalProgress"));

const baseUrl = import.meta.env.VITE_API_BASE_URL;

/* ─── Status config ─────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: { label: "Pending", cls: "bg-warning-light text-warning" },
  approved: { label: "Approved", cls: "bg-success-light text-success" },
  rejected: { label: "Rejected", cls: "bg-error-light text-error" },
  in_transit: { label: "In Transit", cls: "bg-info-light text-info" },
  delivered: { label: "Delivered", cls: "bg-primary-light text-primary" },
  in_use: { label: "In Use", cls: "bg-purple-50 text-purple-600" },
  return_in_transit: { label: "Return Transit", cls: "bg-info-light text-info" },
  returned: { label: "Returned", cls: "bg-success-light text-success" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-600" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

/* ─── Alert ─────────────────────────────────────────────────────── */
const AlertBanner = ({ type = "info", children }) => {
  const config = {
    info: { icon: Info, cls: "bg-info-light text-info border-info/20" },
    error: { icon: AlertCircle, cls: "bg-error-light text-error border-error/20" },
    success: { icon: CheckCircle2, cls: "bg-success-light text-success border-success/20" },
  };
  const { icon: Icon, cls } = config[type] || config.info;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${cls}`}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <p className="text-sm">{children}</p>
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
    <div className={`bg-white rounded-2xl border shadow-card overflow-hidden ${isNew ? "border-primary/40" : "border-gray-100"} ${isCompleted ? "opacity-70" : ""}`}>
      {isNew && (
        <div className="h-0.5 bg-gradient-to-r from-primary to-primary-dark w-full" />
      )}
      <div className="p-5">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
            {imgSrc ? (
              <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name || "Unknown product"}</h3>
              <div className="flex-shrink-0 flex items-center gap-2">
                {isNew && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">New</span>
                )}
                <StatusBadge status={request.status} />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-gray-900">₹{product.rentalPrice}<span className="text-xs font-normal text-gray-400">/day</span></span>
              {product.securityDeposit > 0 && (
                <span className="text-xs text-gray-400">· Deposit ₹{product.securityDeposit}</span>
              )}
            </div>

            {/* Owner info */}
            {owner.name && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  {owner.profilePhoto ? (
                    <img
                      src={owner.profilePhoto.startsWith("http") ? owner.profilePhoto : `${baseUrl}${owner.profilePhoto}`}
                      alt={owner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold">
                      {owner.name[0]}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">{owner.name}</span>
                {owner.ratings && (
                  <span className="text-xs text-gray-400">· ⭐ {owner.ratings}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dates row */}
        <div className="mt-4 grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Start</p>
            <p className="text-xs font-semibold text-gray-800">{format(new Date(request.startDate), "d MMM yy")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">End</p>
            <p className="text-xs font-semibold text-gray-800">{format(new Date(request.endDate), "d MMM yy")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Duration</p>
            <p className="text-xs font-semibold text-gray-800">{formatDistance(new Date(request.startDate), new Date(request.endDate))}</p>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <p className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">{product.description}</p>
        )}

        {request.payment?.status && (
          <div className="mt-3 rounded-xl border border-primary/10 bg-primary-light/50 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-primary">
                Payment {request.payment.status === "paid" ? "Done" : "Pending Verification"}
              </span>
              {request.invoiceNumber && (
                <span className="text-xs text-gray-600">Invoice {request.invoiceNumber}</span>
              )}
            </div>
            {request.payment.amount > 0 && (
              <p className="mt-1 text-xs text-gray-600">Paid amount: ₹{request.payment.amount}</p>
            )}
          </div>
        )}

        {/* Progress tracker */}
        {request.status !== "rejected" && !isCompleted && (
          <div className="mt-4">
            <Suspense fallback={<div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 size={14} className="animate-spin" />Loading tracker…</div>}>
              <RentalProgress
                request={request}
                userId={userId}
                onUpdate={onUpdate}
              />
            </Suspense>
          </div>
        )}

        {/* Rate experience */}
        {isCompleted && (
          <div className="mt-4">
            <button
              onClick={() => onRateExperience(request)}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-primary border border-primary/30 hover:bg-primary-light transition-colors"
            >
              ⭐ Rate Your Experience
            </button>
          </div>
        )}
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

  /* Fetch categories */
  useEffect(() => {
    axios.get(`${baseUrl}/api/categories`)
      .then(({ data }) => setCategories(data))
      .catch(() => { });
  }, []);

  /* Fetch requests */
  const fetchRequests = async (type) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/api/rental-requests`, { params: { userId, type } });
      const sorted = (data.requests || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(sorted);
      setError("");
    } catch {
      setError("Failed to fetch requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userId) fetchRequests(activeTab); }, [activeTab, userId]);

  /* Filter */
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
    { id: "received", label: "Received" },
    { id: "sent", label: "Sent" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rental Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track, manage and respond to rental requests</p>
      </div>

      {/* Filter */}
      <FilterComponent
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 mt-4 w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingPage />
      ) : error ? (
        <AlertBanner type="error">{error}</AlertBanner>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Clock size={24} />
          </div>
          <p className="empty-state-title">No requests found</p>
          <p className="empty-state-desc">
            {activeTab === "received"
              ? "You haven't received any rental requests yet."
              : "You haven't sent any rental requests yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
