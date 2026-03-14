import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import FilterSidebar from '../../components/filters/FilterSidebar';
import ProductGrid from '../../components/products/ProductGrid';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import axios from 'axios';
import { useDebounce } from '../../hooks/useDebounce';
import { getApiBaseUrl, normalizeListProduct } from '../../utils/productHelpers';
import Seo from '../../components/seo/Seo';

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
      <Seo
        title="Explore Rentals"
        description="Browse rentable products by category, price, and rating on JustRentIt. Discover local listings for electronics, tools, camping gear, party items, and more."
        path="/products"
        keywords={["rentals", "browse rental products", "local rental listings", "rent electronics", "rent tools"]}
      />
      <div className="bg-white min-h-screen pt-12 pb-24 relative overflow-hidden">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 blur-[100px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50/50 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Enhanced Search Header Area */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="max-w-xl">
                <h1 className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-3">Discovery</h1>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Explore the Marketplace</h2>
                <p className="text-lg text-slate-500 mt-3 leading-relaxed">
                  {loading ? 'Analyzing the inventory...' : `Found ${filteredProducts.length} premium items available for rent.`}
                </p>
              </div>

              <div className="w-full lg:w-auto flex gap-3">
                <div className="relative flex-grow lg:w-[400px] group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <FiSearch className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                    placeholder="Search by name, category, or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
                <button
                  className="lg:hidden flex items-center gap-2 px-6 py-3.5 bg-slate-900 rounded-2xl text-white font-bold transition-transform active:scale-95 shadow-lg shadow-slate-200"
                  onClick={() => setIsMobileFiltersOpen(true)}
                >
                  <FiSliders /> Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block w-72 shrink-0 sticky top-28 h-fit">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
                <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
              </div>
            </div>

            {/* Mobile Filters Drawer */}
            {isMobileFiltersOpen && (
              <div className="fixed inset-0 z-[2000] lg:hidden animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-8 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
                </div>
              </div>
            )}

            {/* Result Area */}
            <div className="flex-grow">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-slate-100 rounded-[2.5rem] aspect-[4/5] mb-6"></div>
                      <div className="h-5 bg-slate-100 rounded-full w-3/4 mb-3"></div>
                      <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                filteredProducts.length > 0 ? (
                  <ProductGrid products={filteredProducts} />
                ) : (
                  <div className="text-center py-24 flex flex-col items-center bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-premium mb-8 transform -rotate-6">
                      <FiSearch className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">No results matched your search</h3>
                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Try adjusting your filters or use more general keywords to discover amazing rentals.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilters(DEFAULT_FILTERS);
                      }}
                      className="mt-10 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                      Clear all filters
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
