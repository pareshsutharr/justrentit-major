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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trending near you
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Discover the most popular items people are renting right now.
            </p>
          </div>
          <div className="hidden sm:block">
            <Link to="/products" className="text-primary hover:text-primary-hover font-semibold flex items-center gap-2">
              View all items <FiArrowRight />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl aspect-[4/3] mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))
          ) : (
            listings.map((item) => (
              <Link key={item._id} to={`/product/${item._id}`} className="group flex flex-col">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                   <img 
                      src={getImageUrl(item.images?.[0]) || 'https://via.placeholder.com/640x480?text=No+Image'} 
                      alt={item.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                   />
                   <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-900 shadow-sm">
                      {formatINR(item.rentalPrice)} / {item.rentalDuration || 'day'}
                   </div>
                </div>
                
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg truncate pr-4">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900 shrink-0">
                    <FiStar className="fill-yellow-400 text-yellow-400" />
                    {item.rating?.toFixed ? item.rating.toFixed(1) : item.rating}
                  </div>
                </div>
                
                <div className="flex text-sm text-gray-500 items-center justify-between mt-auto">
                   <span className="flex items-center gap-1">
                     <FiMapPin className="text-gray-400" />
                     {item.location || 'Local'}
                   </span>
                   <span className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                     {item.category}
                   </span>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-10 sm:hidden flex justify-center">
           <Link to="/products" className="w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition-colors">
              View all items
           </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingPreviewSection;
