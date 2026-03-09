import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import FilterSidebar from '../../components/filters/FilterSidebar';
import ProductGrid from '../../components/products/ProductGrid';
import { FiSearch, FiSliders } from 'react-icons/fi';
import axios from 'axios';
import { useDebounce } from '../../hooks/useDebounce';
import { getApiBaseUrl, normalizeListProduct } from '../../utils/productHelpers';

const baseUrl = getApiBaseUrl();
const DEFAULT_FILTERS = {
  category: 'All',
  minPrice: 0,
  maxPrice: 1000,
  rating: 0
};

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${baseUrl}/api/products`),
          axios.get(`${baseUrl}/api/categories`)
        ]);

        const rawProducts = productsResponse?.data?.products || [];
        const rawCategories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];
        const categoryMap = new Map(rawCategories.map((item) => [item._id, item.name]));

        const normalizedProducts = rawProducts
          .map((product) => normalizeListProduct(product, categoryMap))
          .filter((product) => product.available);

        const categoryNames = Array.from(
          new Set(rawCategories.map((item) => item?.name).filter(Boolean))
        );

        setAllProducts(normalizedProducts);
        setCategories(['All', ...categoryNames]);
      } catch (error) {
        console.error('Error fetching products:', error);
        setAllProducts([]);
        setCategories(['All']);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const searchTerm = debouncedSearch.trim().toLowerCase();

    return allProducts.filter((product) => {
      const categoryMatch =
        filters.category === 'All' || product.category.split(',').map((entry) => entry.trim()).includes(filters.category);
      const minPriceMatch = product.rentalPrice >= filters.minPrice;
      const maxPriceMatch = product.rentalPrice <= filters.maxPrice;
      const ratingMatch = filters.rating === 0 || product.rating >= filters.rating;
      const searchMatch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm);

      return categoryMatch && minPriceMatch && maxPriceMatch && ratingMatch && searchMatch;
    });
  }, [allProducts, debouncedSearch, filters]);

  return (
    <AppLayout>
      <div className="bg-white min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore Items</h1>
              <p className="text-gray-500 mt-1">
                {loading ? 'Finding items...' : `Showing ${filteredProducts.length} results`}
              </p>
            </div>

            <div className="w-full md:w-auto flex gap-3">
              <div className="relative flex-grow md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <FiSliders /> Filters
              </button>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="hidden md:block w-64 shrink-0">
              <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
            </div>

            {/* Mobile Filters Modal (simplified) */}
            {isMobileFiltersOpen && (
               <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-4/5 bg-white p-6 shadow-xl overflow-y-auto">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Filters</h2>
                        <button onClick={() => setIsMobileFiltersOpen(false)} className="text-gray-500">Close</button>
                     </div>
                     <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
                  </div>
               </div>
            )}

            {/* Product Grid */}
            <div className="flex-grow">
              {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {Array.from({length: 6}).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-2xl aspect-[4/3] mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                   ))}
                 </div>
              ) : (
                 filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                 ) : (
                    <div className="text-center py-20">
                       <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                         <FiSearch className="w-6 h-6 text-gray-400" />
                       </div>
                       <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
                       <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                       <button 
                         onClick={() => {
                           setSearchQuery('');
                           setFilters(DEFAULT_FILTERS);
                         }}
                         className="mt-6 text-primary font-medium hover:text-primary-hover"
                       >
                         Clear filters
                       </button>
                    </div>
                 )
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default SearchPage;
