import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductModal from "./ProductModal";
import { Pencil, Trash2, ChevronLeft, ChevronRight, CheckCircle, Star } from "lucide-react";
import Swal from "sweetalert2";
import LoadingPage from "../loadingpages/LoadingPage";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

/* ─── Status badge helpers ──────────────────────────────────────── */
const conditionConfig = {
  new: { label: "New", bg: "bg-success-light text-success" },
  excellent: { bg: "bg-info-light text-info", label: "Excellent" },
  good: { bg: "bg-amber-50 text-amber-600", label: "Good" },
  fair: { bg: "bg-warning-light text-warning", label: "Fair" },
  poor: { bg: "bg-error-light text-error", label: "Poor" },
};

const ConditionBadge = ({ condition }) => {
  const cfg = conditionConfig[condition] || { label: condition, bg: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
};

const StarRating = ({ rating, total }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
    <span className="text-xs text-gray-400">({total || 0})</span>
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="relative h-52 bg-gray-50 overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Image nav */}
        {images.length > 1 && (
          <>
            <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </>
        )}

        {/* Badges — top overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success text-white">
              <CheckCircle size={11} /> Verified
            </span>
          )}
          {product.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
              Featured
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-error transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{product.name}</h3>
          <ConditionBadge condition={product.condition} />
        </div>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{product.description}</p>

        <StarRating rating={product.ratings?.averageRating || 0} total={product.ratings?.totalRatings} />

        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-gray-900">
                ₹{product.rentalPrice}
                <span className="text-xs font-normal text-gray-400">/{product.rentalDuration}</span>
              </p>
              {product.securityDeposit > 0 && (
                <p className="text-xs text-gray-400">Deposit ₹{product.securityDeposit}</p>
              )}
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${product.available ? "bg-success-light text-success" : "bg-gray-100 text-gray-500"}`}>
              {product.available ? "Available" : "Unavailable"}
            </span>
          </div>
          {product.location?.area && (
            <p className="text-xs text-gray-400 mt-1.5 truncate">
              📍 {product.location.area}, {product.location.state}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Pagination ────────────────────────────────────────────────── */
const Pagination = ({ currentPage, totalPages, onPage }) => (
  <div className="flex items-center justify-center gap-1">
    <button
      onClick={() => onPage(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm border border-gray-200 disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
    >
      <ChevronLeft size={16} />
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        onClick={() => onPage(page)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium border transition-colors ${currentPage === page
            ? "bg-primary text-white border-primary"
            : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
          }`}
      >
        {page}
      </button>
    ))}
    <button
      onClick={() => onPage(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm border border-gray-200 disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
    >
      <ChevronRight size={16} />
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
        return id ? id.replace(/['\"]+/g, "") : null;
      } catch { return null; }
    })();

    if (!userId) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }
    axios.get(`${baseUrl}/api/my-products?userId=${userId}`)
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
      axios.delete(`${baseUrl}/api/delete-product/${productId}`)
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} item{products.length !== 1 ? "s" : ""} listed
          </p>
        </div>
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <polyline points="16 3 12 7 8 3" />
            </svg>
          </div>
          <p className="empty-state-title">No products yet</p>
          <p className="empty-state-desc">You haven't listed any products. Start by adding your first item to rent out.</p>
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
