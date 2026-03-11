import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';
import {
  formatINR,
  getApiBaseUrl,
  getImageUrl,
  normalizeListProduct
} from '../../utils/productHelpers';

const baseUrl = getApiBaseUrl();

const ListingPreviewSection = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${baseUrl}/api/products`),
          axios.get(`${baseUrl}/api/categories`)
        ]);

        const products = productsResponse?.data?.products || [];
        const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];
        const categoryMap = new Map(categories.map((item) => [item._id, item.name]));

        const normalizedProducts = products
          .map((product) => normalizeListProduct(product, categoryMap))
          .filter((product) => product.available)
          .slice(0, 4);

        setListings(normalizedProducts);
      } catch (error) {
        console.error('Error fetching listing previews:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-3">Featured Listings</h2>
            <p className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Trending near you
            </p>
            <p className="text-lg text-slate-500">
              Discover the most popular items people are renting right now in your neighborhood.
            </p>
          </div>
          <div className="hidden md:block">
            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-colors">
              View all marketplace <FiArrowRight />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-100 rounded-[2rem] aspect-[4/5] mb-6"></div>
                <div className="h-5 bg-slate-100 rounded-full w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-6"></div>
                <div className="h-8 bg-slate-100 rounded-xl w-1/3"></div>
              </div>
            ))
          ) : (
            listings.map((item) => (
              <Link key={item._id} to={`/product/${item._id}`} className="group flex flex-col">
                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-100 mb-6 shadow-sm border border-slate-100">
                  <img
                    src={getImageUrl(item.images?.[0]) || 'https://via.placeholder.com/640x800?text=No+Image'}
                    alt={item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 shadow-premium">
                    {formatINR(item.rentalPrice)} / {item.rentalDuration || 'day'}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-indigo-600 text-white text-center py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-indigo-200">
                      View Details
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-2 px-1">
                  <h3 className="font-bold text-slate-900 text-xl truncate pr-2 group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 shrink-0 bg-slate-50 px-2 py-1 rounded-lg">
                    <FiStar className="fill-yellow-400 text-yellow-400 w-3.5 h-3.5" />
                    {item.rating?.toFixed ? item.rating.toFixed(1) : (item.rating || '5.0')}
                  </div>
                </div>

                <div className="flex text-sm font-medium text-slate-500 items-center justify-between mt-auto px-1">
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="text-slate-400 w-4 h-4" />
                    {item.location || 'Local'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border border-indigo-100">
                    {item.category}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-12 md:hidden">
          <Link to="/products" className="flex items-center justify-center gap-2 w-full text-center bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]">
            View all marketplace <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingPreviewSection;
