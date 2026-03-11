import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiHeart } from 'react-icons/fi';
import { formatINR, getImageUrl } from '../../utils/productHelpers';
import { isFavoriteProduct, toggleFavoriteProduct } from '../../utils/favorites';

const ProductGrid = ({ products }) => {
  const [favoriteIds, setFavoriteIds] = React.useState([]);

  React.useEffect(() => {
    const sync = () => setFavoriteIds(products.map((item) => item._id).filter((id) => isFavoriteProduct(id)));
    sync();
    window.addEventListener("favorites:changed", sync);
    return () => window.removeEventListener("favorites:changed", sync);
  }, [products]);

  const handleToggleFavorite = (event, productId) => {
    event.preventDefault();
    event.stopPropagation();
    const next = toggleFavoriteProduct(productId);
    setFavoriteIds(next);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((item) => (
        <Link key={item._id} to={`/product/${item._id}`} className="group flex flex-col bg-white border border-slate-100 rounded-[2.5rem] p-4 hover:shadow-premium hover:border-transparent hover:-translate-y-1.5 transition-all duration-500">
          <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 mb-6 border border-slate-100/50">
            <img
              src={getImageUrl(item.images?.[0]) || 'https://via.placeholder.com/640x800?text=No+Image'}
              alt={item.name}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <button
              type="button"
              onClick={(event) => handleToggleFavorite(event, item._id)}
              className="absolute top-4 left-4 bg-white/95 hover:bg-white backdrop-blur-md p-2.5 rounded-2xl text-slate-700 shadow-premium transition-all hover:scale-110 active:scale-95 z-10"
              aria-label="Toggle favorite"
            >
              <FiHeart
                className={`w-4 h-4 transition-colors ${favoriteIds.includes(item._id) ? "fill-red-500 text-red-500" : "text-slate-400 group-hover:text-slate-600"}`}
              />
            </button>

            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg z-10">
              {formatINR(item.rentalPrice)} <span className="text-slate-400 font-medium">/ {item.rentalDuration || 'day'}</span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
              <div className="bg-white text-slate-900 text-center py-3 rounded-2xl font-bold text-sm shadow-xl tracking-tight">
                View Details
              </div>
            </div>
          </div>

          <div className="px-2">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-slate-900 text-lg leading-tight truncate pr-2 group-hover:text-indigo-600 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 shrink-0 bg-slate-50 px-2 py-1 rounded-lg">
                <FiStar className="fill-yellow-400 text-yellow-400 w-3.5 h-3.5" />
                {item.rating?.toFixed ? item.rating.toFixed(1) : (item.rating || '5.0')}
              </div>
            </div>

            <div className="flex text-sm font-medium text-slate-500 items-center justify-between mt-auto">
              <span className="flex items-center gap-1.5">
                <FiMapPin className="text-slate-400 w-4 h-4" />
                {item.location || 'Local'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border border-indigo-100">
                {item.category}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
