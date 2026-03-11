import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { FiStar, FiMapPin, FiPhoneCall, FiMail, FiShield, FiHeart, FiShare2, FiArrowLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import { ShieldCheck, MessageCircle, Phone, Calendar, Info, ChevronLeft, ChevronRight, X } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  formatINR,
  getApiBaseUrl,
  getImageUrl,
  normalizeDetailProduct
} from '../../utils/productHelpers';
import { isFavoriteProduct, toggleFavoriteProduct } from '../../utils/favorites';
import RentalRequestForm from '../../components/products/filter/ProductModal/RentalRequestForm';

const baseUrl = getApiBaseUrl();

const Badge = ({ children, variant = 'indigo' }) => {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border ${styles[variant]} inline-flex items-center gap-1.5`}>
      {children}
    </span>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          axios.get(`${baseUrl}/api/products/${id}`),
          axios.get(`${baseUrl}/api/categories`)
        ]);

        const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];
        const categoryMap = new Map(categories.map((item) => [item._id, item.name]));

        const apiPayload = productResponse?.data?.product || productResponse?.data || null;
        let mergedProduct = apiPayload;

        if (mergedProduct && !mergedProduct.authorDetails && (!mergedProduct.userId || typeof mergedProduct.userId === 'string')) {
          const allProductsResponse = await axios.get(`${baseUrl}/api/products`);
          const allProducts = allProductsResponse?.data?.products || [];
          const aggregateMatch = allProducts.find((item) => String(item._id) === String(id));
          if (aggregateMatch?.authorDetails) {
            mergedProduct = { ...mergedProduct, authorDetails: aggregateMatch.authorDetails };
          }
        }

        setProduct(mergedProduct ? normalizeDetailProduct(mergedProduct, categoryMap) : null);
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?._id]);

  useEffect(() => {
    if (!id) return;
    const sync = () => setIsFavorite(isFavoriteProduct(id));
    sync();
    window.addEventListener("favorites:changed", sync);
    return () => window.removeEventListener("favorites:changed", sync);
  }, [id]);

  useEffect(() => {
    if (searchParams.get('payment') !== 'success') return;

    const invoiceNumber = searchParams.get('invoice');
    Swal.fire({
      icon: 'success',
      title: 'Payment Secured',
      text: invoiceNumber
        ? `Transaction verified. Invoice ${invoiceNumber} is now available in your dashboard.`
        : 'Payment received. Your booking request is active.',
      confirmButtonColor: '#4f46e5',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-2xl px-8 py-3 font-bold'
      }
    }).then(() => {
      const nextParams = new URLSearchParams(searchParams);
      ['payment', 'invoice', 'requestId'].forEach(k => nextParams.delete(k));
      setSearchParams(nextParams, { replace: true });
    });
  }, [searchParams, setSearchParams]);

  const handleFavoriteToggle = () => {
    if (!product?._id) return;
    const updatedFavorites = toggleFavoriteProduct(product._id);
    setIsFavorite(updatedFavorites.includes(String(product._id)));
  };

  const handleOpenMessageChat = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const owner = product?.authorDetails || product?.userId || {};
    if (!product?.chatUserId) return;

    window.dispatchEvent(
      new CustomEvent("chat:open-user", {
        detail: {
          _id: product.chatUserId,
          name: owner?.name || "Owner",
          profilePhoto: owner?.profilePhoto || "",
          email: owner?.email || "",
        },
      })
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen pt-32 pb-24 max-w-7xl mx-auto px-6">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="bg-slate-50 aspect-square rounded-[3rem] border border-slate-100 shadow-premium"></div>
            <div className="space-y-8">
              <div className="h-4 bg-slate-50 rounded-full w-1/4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-slate-50 rounded-2xl w-3/4"></div>
                <div className="h-10 bg-slate-50 rounded-2xl w-1/2"></div>
              </div>
              <div className="h-4 bg-slate-50 rounded-full w-1/3"></div>
              <div className="h-32 bg-slate-50 rounded-[2rem] w-full mt-12"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center flex-col gap-6">
          <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-300">
            <Info size={40} />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Listing Unavailable</h2>
            <p className="text-slate-500 mt-2 font-medium">This item may have been removed or is no longer listed.</p>
          </div>
          <Link to="/products" className="px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-100">
            Explore Marketplace
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative pt-24 pb-32">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50/20 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Breadcrumbs / Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10 group hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Gallery Column */}
            <div className="space-y-6">
              <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-premium-lg group">
                <img
                  src={getImageUrl(product.images?.[activeImage]) || 'https://via.placeholder.com/1000x1200?text=Listing+Image'}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gallery Overlays */}
                <div className="absolute top-6 right-6">
                  <button
                    onClick={handleFavoriteToggle}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all shadow-xl active:scale-90
                        ${isFavorite
                        ? "bg-red-500 text-white"
                        : "bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white"}`}
                  >
                    <FiHeart size={20} className={isFavorite ? "fill-current" : ""} />
                  </button>
                </div>
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide py-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-24 h-28 rounded-2xl overflow-hidden shrink-0 transition-all shadow-sm
                           ${activeImage === idx
                          ? 'ring-4 ring-indigo-50 border-2 border-indigo-500 scale-105 shadow-xl shadow-indigo-100'
                          : 'border-2 border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img
                        src={getImageUrl(img) || 'https://via.placeholder.com/160x160?text=No+Image'}
                        alt={`view-${idx}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Column */}
            <div className="flex flex-col">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="indigo">{product.category}</Badge>
                  {product.verified && <Badge variant="emerald"><FiShield size={12} /> Verified Listing</Badge>}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-center gap-8 mb-10">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={18} className={i < Math.floor(product.rating) ? "fill-current" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{product.rating.toFixed(1)}</span>
                    <span className="text-sm font-medium text-slate-400">({product.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                      <FiMapPin size={14} className="text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{product.location}</span>
                  </div>
                </div>

                <div className="flex items-end gap-3 p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-premium shadow-indigo-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Rental Subscription</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tighter">₹{product.rentalPrice}</span>
                      <span className="text-lg font-medium opacity-70">/ {product.rentalDuration || 'day'}</span>
                    </div>
                  </div>
                  <div className="ml-auto hidden sm:block">
                    <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] font-bold uppercase tracking-widest">
                      Secured Transaction
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Description</h3>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Owner Card */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-8 mb-10 group hover:border-indigo-100 hover:shadow-premium-lg transition-all">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Listed By</h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={getImageUrl(product.authorDetails?.profilePhoto) || 'https://via.placeholder.com/120x120?text=Profile'}
                      alt={product.authorDetails?.name}
                      className="w-16 h-16 rounded-[1.25rem] object-cover border-4 border-slate-50 shadow-sm transition-transform group-hover:scale-105"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <FiCheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-xl font-bold text-slate-900 tracking-tight">{product.authorDetails?.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Member since {product.authorDetails?.memberSince || '2023'} • {product.authorDetails?.completedRentals || 0} Successful Rentals</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleOpenMessageChat}
                      disabled={!product.chatUserId}
                      className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-indigo-50 disabled:hover:text-indigo-600 shadow-sm"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button
                      onClick={() => product.authorDetails?.phone && (window.location.href = `tel:${product.authorDetails.phone}`)}
                      disabled={!product.authorDetails?.phone}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30 shadow-sm"
                    >
                      <Phone size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking CTA Column/Card */}
              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 text-indigo-400 mb-4">
                      <Calendar size={16} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Premium Checkout</p>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-3">
                      Instant Rental Activation
                    </h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                      Secure this item instantly. Our end-to-end encrypted process ensures your payment and rental period are protected.
                    </p>
                  </div>
                  <button
                    onClick={() => setBookingOpen(true)}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 group/btn"
                  >
                    Reserve Now
                    <FiChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {[
                    { icon: ShieldCheck, label: 'Secured Payment' },
                    { icon: FiCheckCircle, label: 'Insured Rental' },
                    { icon: FiShare2, label: 'Instant Connect' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <item.icon size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Booking Modal Redesign */}
      {bookingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-lg px-6">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[3rem] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.2)] flex flex-col scale-in-center">

            {/* Modal Header */}
            <div className="relative px-10 py-10 bg-slate-50 border-b border-slate-100 flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => setBookingOpen(false)}
                className="absolute right-8 top-8 w-12 h-12 rounded-2xl bg-white text-slate-400 hover:text-slate-900 border border-slate-100 shadow-sm flex items-center justify-center transition-all active:scale-90"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-indigo-100">
                <Calendar size={32} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-600 mb-2">Secure Reservation</p>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{product.name}</h2>
              <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm">
                Schedule your rental period below. All transactions are end-to-end encrypted.
              </p>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
              <RentalRequestForm selectedProduct={product} />
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        .scale-in-center { animation: scale-in-center 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes scale-in-center {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </AppLayout>
  );
};

export default ProductPage;
