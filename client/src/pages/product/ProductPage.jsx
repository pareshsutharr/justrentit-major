import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { FiStar, FiMapPin, FiPhoneCall, FiMail, FiShield, FiHeart } from 'react-icons/fi';
import axios from 'axios';
import {
  formatINR,
  getApiBaseUrl,
  getImageUrl,
  normalizeDetailProduct
} from '../../utils/productHelpers';
import { isFavoriteProduct, toggleFavoriteProduct } from '../../utils/favorites';

const baseUrl = getApiBaseUrl();

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

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

        // /api/products/:id may return product without owner details; enrich using /api/products aggregate payload.
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
        console.error('Error fetching product:', error);
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
    if (!product?.chatUserId) return;

    window.dispatchEvent(
      new CustomEvent("chat:open-user", {
        detail: {
          _id: product.chatUserId,
          name: product.authorDetails?.name || "Owner",
          profilePhoto: product.authorDetails?.profilePhoto || "",
        },
      })
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen pt-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-200 aspect-square rounded-2xl w-full"></div>
              <div className="space-y-4">
                 <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                 <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                 <div className="h-32 bg-gray-200 rounded w-full mt-8"></div>
              </div>
           </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <button onClick={() => navigate('/products')} className="text-primary hover:underline">Browse all items</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Image Gallery */}
            <div className="space-y-4">
               <div className="aspect-square relative rounded-3xl overflow-hidden bg-gray-100">
                  <img 
                     src={getImageUrl(product.images?.[activeImage]) || 'https://via.placeholder.com/1000x1000?text=No+Image'}
                     alt={product.name}
                     className="absolute inset-0 w-full h-full object-cover"
                  />
               </div>
               {product.images.length > 1 && (
                 <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {product.images.map((img, idx) => (
                       <button 
                         key={idx}
                         onClick={() => setActiveImage(idx)}
                         className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                       >
                          <img 
                            src={getImageUrl(img) || 'https://via.placeholder.com/160x160?text=No+Image'}
                            alt="thumbnail"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                       </button>
                    ))}
                 </div>
               )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
               <div className="mb-6">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary px-3 py-1 bg-primary/10 rounded-full">
                       {product.category}
                    </span>
                    <button
                      type="button"
                      onClick={handleFavoriteToggle}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      aria-label="Toggle favorite"
                    >
                      <FiHeart
                        size={24}
                        className={isFavorite ? "fill-red-500 text-red-500" : ""}
                      />
                    </button>
                 </div>
                 <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
                   {product.name}
                 </h1>
                 
                 <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center text-gray-900 font-medium">
                       <FiStar className="fill-yellow-400 text-yellow-400 mr-1" />
                       {product.rating.toFixed(1)} <span className="text-gray-400 font-normal ml-1">({product.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center">
                       <FiMapPin className="mr-1" /> {product.location}
                    </div>
                 </div>
                 
                 <div className="flex items-end gap-2 mb-8">
                    <span className="text-4xl font-bold text-gray-900">{formatINR(product.rentalPrice)}</span>
                    <span className="text-gray-500 mb-1">/ {product.rentalDuration || 'day'}</span>
                 </div>
               </div>

               <div className="prose prose-sm text-gray-600 mb-10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="leading-relaxed">{product.description}</p>
               </div>

               <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Rented by</h3>
                 <div className="flex items-center gap-4">
                     <img 
                       src={getImageUrl(product.authorDetails?.profilePhoto) || 'https://via.placeholder.com/120x120?text=Owner'}
                       alt={product.authorDetails?.name}
                       className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                     />
                     <div className="flex-grow">
                        <p className="font-bold text-gray-900">{product.authorDetails?.name}</p>
                        <p className="text-xs text-gray-500">Member since {product.authorDetails?.memberSince || '2023'} • {product.authorDetails?.completedRentals || 0} rentals</p>
                     </div>
                     <div className="flex items-center text-primary text-sm font-medium">
                        <FiShield className="mr-1"/> {product.verified ? "Verified" : "Profile checked"}
                     </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="mt-auto">
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <button 
                      onClick={handleOpenMessageChat}
                      disabled={!product.chatUserId}
                      className="flex items-center justify-center gap-2 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
                    >
                       <FiMail /> message
                    </button>
                    <button 
                      onClick={() => product.authorDetails?.phone && (window.location.href = `tel:${product.authorDetails.phone}`)}
                      disabled={!product.authorDetails?.phone}
                      className="flex items-center justify-center gap-2 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
                    >
                       <FiPhoneCall /> call
                    </button>
                 </div>
                 <button className="w-full flex items-center justify-center py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/30">
                    Request to Book
                 </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductPage;
