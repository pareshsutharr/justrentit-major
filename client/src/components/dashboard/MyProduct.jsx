import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductModal from "./ProductModal";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Star,
  Info,
  AlertCircle,
  Package,
} from "lucide-react";
import Swal from "sweetalert2";
import LoadingPage from "../loadingpages/LoadingPage";
import { getApiBaseUrl } from "../../utils/productHelpers";

const baseUrl = getApiBaseUrl();

/* ─── Status badge helpers ──────────────────────────────────────── */
const conditionConfig = {
  new: { label: "New", bg: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
  excellent: { label: "Excellent", bg: "bg-indigo-50 text-indigo-600", icon: Star },
  good: { label: "Good", bg: "bg-blue-50 text-blue-600", icon: Star },
  fair: { label: "Fair", bg: "bg-amber-50 text-amber-600", icon: Info },
  poor: { label: "Poor", bg: "bg-slate-50 text-slate-500", icon: AlertCircle },
};

const ConditionBadge = ({ condition }) => {
  const cfg = conditionConfig[condition] || { label: condition, bg: "bg-slate-50 text-slate-400", icon: Info };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${cfg.bg}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
};

const StarRating = ({ rating, total }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-slate-100"}
        />
      ))}
    </div>
    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{total || 0} Reviews</span>
  </div>
);

/* ─── Product card ──────────────────────────────────────────────── */
const ProductCard = ({ product, currentImageIndex, onPrev, onNext, onEdit, onDelete }) => {
  const images = product.images || [];
  const imgIdx = currentImageIndex ?? 0;
  const imgSrc = images.length > 0
    ? `${baseUrl}${images[imgIdx]}`
    : null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500 overflow-hidden flex flex-col group h-full">
      {/* Visual Workspace */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden m-4 rounded-[2rem]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <Package size={48} strokeWidth={1} />
          </div>
        )}

        {/* Dynamic Navigation */}
        {images.length > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:bg-white hover:text-indigo-600 shadow-xl transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:bg-white hover:text-indigo-600 shadow-xl transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/40 backdrop-blur-md text-[10px] font-black text-white/90 uppercase tracking-tighter">
              {imgIdx + 1} of {images.length}
            </div>
          </div>
        )}

        {/* Global Markers */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.available ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 border border-emerald-400/20 shadow-lg shadow-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live Deployment
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md text-[10px] font-black text-white/90 uppercase tracking-widest border border-white/10">
              Inactive
            </div>
          )}
        </div>

        {/* Operation Control */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 scale-90 group-hover:scale-100 transition-transform duration-500 origin-top-right">
          <button
            onClick={onEdit}
            className="w-11 h-11 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:rotate-6 transition-all"
          >
            <Pencil size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={onDelete}
            className="w-11 h-11 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:-rotate-6 transition-all"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Strategic Data */}
      <div className="px-8 pb-8 flex flex-col flex-1">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight line-clamp-1">{product.name}</h3>
            <ConditionBadge condition={product.condition} />
          </div>
          <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest line-clamp-2">{product.description}</p>
        </div>

        <div className="mt-auto space-y-6">
          <StarRating rating={product.ratings?.averageRating || 0} total={product.ratings?.totalRatings} />

          <div className="flex items-end justify-between pt-6 border-t border-slate-50">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Rental Yield</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{product.rentalPrice}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/{product.rentalDuration}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Security</p>
              <p className="text-xs font-black text-slate-900">₹{product.securityDeposit || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Pagination ────────────────────────────────────────────────── */
const Pagination = ({ currentPage, totalPages, onPage }) => (
  <div className="flex items-center justify-center gap-3">
    <button
      onClick={() => onPage(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 disabled:opacity-30 hover:bg-slate-50 hover:text-indigo-600 transition-all text-slate-400"
    >
      <ChevronLeft size={20} />
    </button>
    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPage(page)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black tracking-widest transition-all ${currentPage === page
            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
            : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          {page < 10 ? `0${page}` : page}
        </button>
      ))}
    </div>
    <button
      onClick={() => onPage(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 disabled:opacity-30 hover:bg-slate-50 hover:text-indigo-600 transition-all text-slate-400"
    >
      <ChevronRight size={20} />
    </button>
  </div>
);

/* ─── Main component ────────────────────────────────────────────── */
export default function MyProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageIndexMap, setImageIndexMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const userId = (() => {
      try {
        const u = localStorage.getItem("user");
        if (u) { const d = JSON.parse(u); if (d._id) return d._id; }
        const id = localStorage.getItem("userId");
        return id ? id.replace(/['"]+/g, "") : null;
      } catch { return null; }
    })();

    if (!userId) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }
    axios.get(`${baseUrl}/api/my-products?userId=${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(({ data }) => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          setImageIndexMap(data.products.reduce((acc, p) => ({ ...acc, [p._id]: 0 }), {}));
        } else {
          toast.error(data.message || "Unexpected response");
        }
      })
      .catch(() => toast.error("Error fetching products"))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteProduct = (productId) => {
    Swal.fire({
      title: "Delete this product?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    }).then(({ isConfirmed }) => {
      if (!isConfirmed) return;
      axios.delete(`${baseUrl}/api/delete-product/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then(({ data }) => {
          if (data.success) {
            setProducts((prev) => {
              const next = prev.filter((p) => p._id !== productId);
              const maxPage = Math.max(1, Math.ceil(next.length / ITEMS_PER_PAGE));
              if (currentPage > maxPage) setCurrentPage(maxPage);
              return next;
            });
            toast.success("Product deleted");
          }
        })
        .catch(() => toast.error("Error deleting product"));
    });
  };

  const shiftImage = (productId, dir) => {
    const total = products.find((p) => p._id === productId)?.images?.length || 1;
    setImageIndexMap((prev) => ({
      ...prev,
      [productId]: (prev[productId] + dir + total) % total,
    }));
  };

  if (loading) return <LoadingPage />;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = products.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Market Inventory</h1>
          <p className="text-base font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] text-xs">Manage & Monitor Your Deployment Base</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Assets</p>
            <p className="text-sm font-black text-slate-900">{products.length < 10 ? `0${products.length}` : products.length} <span className="text-[10px] text-slate-300">Listed</span></p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
            <Package size={32} strokeWidth={1.5} />
          </div>
          <p className="text-xl font-black text-slate-900 tracking-tight">No active deployments</p>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest text-center max-w-sm">Your inventory is currently empty. Initialize a new asset to start earning.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            {paginated.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                currentImageIndex={imageIndexMap[product._id]}
                onPrev={() => shiftImage(product._id, -1)}
                onNext={() => shiftImage(product._id, +1)}
                onEdit={() => setSelectedProduct(product)}
                onDelete={() => handleDeleteProduct(product._id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPage={setCurrentPage}
            />
          )}
        </>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={(updated) =>
            setProducts((prev) =>
              prev.map((p) => p._id === updated._id ? { ...p, ...updated } : p)
            )
          }
        />
      )}

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </div>
  );
}
