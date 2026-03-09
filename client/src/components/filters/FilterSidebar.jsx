import React from 'react';
import { FiStar } from 'react-icons/fi';

const fallbackCategories = ['All'];

const FilterSidebar = ({ filters, setFilters, categories = fallbackCategories }) => {
  
  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category });
  };

  const handlePriceChange = (e) => {
    setFilters({ ...filters, maxPrice: Number(e.target.value) });
  };

  return (
    <div className="space-y-8 pr-4">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Categories</h3>
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => handleCategoryChange(cat)}
                className={`text-sm w-full text-left flex justify-between items-center px-3 py-2 rounded-lg transition-colors ${
                  filters.category === cat 
                    ? 'bg-primary text-white font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Max Price: ₹{filters.maxPrice}/day</h3>
        <div className="px-2">
          <input 
            type="range" 
            min="0" 
            max="1000" 
            step="10"
            value={filters.maxPrice}
            onChange={handlePriceChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹0</span>
            <span>₹1000+</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Minimum Rating</h3>
        <div className="space-y-2">
           {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center cursor-pointer group">
                 <input 
                    type="radio" 
                    name="rating"
                    checked={filters.rating === rating}
                    onChange={() => setFilters({ ...filters, rating })}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
                 />
                 <span className="ml-3 flex items-center text-sm text-gray-600 group-hover:text-gray-900">
                    {Array.from({ length: 5 }).map((_, i) => (
                       <FiStar key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="ml-1">& Up</span>
                 </span>
              </label>
           ))}
        </div>
      </div>

    </div>
  );
};

export default FilterSidebar;
