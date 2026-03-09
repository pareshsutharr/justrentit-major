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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((item) => (
        <Link key={item._id} to={`/product/${item._id}`} className="group flex flex-col bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-xl hover:border-transparent transition-all duration-300">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img 
                src={getImageUrl(item.images?.[0]) || 'https://via.placeholder.com/640x480?text=No+Image'} 
                alt={item.name} 
                className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 bg-gray-50"
              />
              <button
                type="button"
                onClick={(event) => handleToggleFavorite(event, item._id)}
                className="absolute top-3 left-3 bg-white/90 hover:bg-white backdrop-blur-sm p-2 rounded-full text-gray-700 shadow-sm"
                aria-label="Toggle favorite"
              >
                <FiHeart
                  className={favoriteIds.includes(item._id) ? "fill-red-500 text-red-500" : "text-gray-600"}
                  size={16}
                />
              </button>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm">
                {formatINR(item.rentalPrice)} / {item.rentalDuration || 'day'}
              </div>
          </div>
          
          <div className="px-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 text-base leading-tight truncate pr-4">
                {item.name}
              </h3>
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 shrink-0">
                <FiStar className="fill-yellow-400 text-yellow-400" />
                {item.rating?.toFixed ? item.rating.toFixed(1) : item.rating}
              </div>
            </div>
            
            <div className="flex text-sm text-gray-500 items-center justify-between mt-auto">
                <span className="flex items-center gap-1 text-xs font-medium">
                  <FiMapPin className="text-gray-400 w-3 h-3" />
                  {item.location || 'Local'}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
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
