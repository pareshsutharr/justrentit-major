import React from 'react';
import { FiStar, FiChevronRight } from 'react-icons/fi';

const fallbackCategories = ['All'];

const FilterSidebar = ({ filters, setFilters, categories = fallbackCategories }) => {

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category });
  };

  const handlePriceChange = (e) => {
    setFilters({ ...filters, maxPrice: Number(e.target.value) });
  };

  return (
    <div className="space-y-10">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-6 px-1">Categories</h3>
        <ul className="space-y-1.5">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => handleCategoryChange(cat)}
                className={`group text-sm w-full text-left flex justify-between items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${filters.category === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
              >
                <span>{cat}</span>
                <FiChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${filters.category === cat ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="pt-8 border-t border-slate-100">
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Max Price</h3>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">₹{filters.maxPrice}</span>
        </div>
        <div className="px-1">
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={filters.maxPrice}
            onChange={handlePriceChange}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-wider">
            <span>₹0</span>
            <span>₹1000+</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-6 px-1">Minimum Rating</h3>
        <div className="space-y-3 px-1">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => setFilters({ ...filters, rating })}
                  className="appearance-none w-5 h-5 rounded-md border-2 border-slate-200 checked:border-indigo-600 checked:bg-indigo-600 transition-all cursor-pointer"
                />
                {filters.rating === rating && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <span className="ml-4 flex items-center text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} className={`w-3.5 h-3.5 mr-0.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                ))}
                <span className="ml-2 font-semibold">& Up</span>
              </span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
};

export default FilterSidebar;
