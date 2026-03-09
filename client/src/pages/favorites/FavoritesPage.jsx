import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppLayout from "../../components/layout/AppLayout";
import ProductGrid from "../../components/products/ProductGrid";
import { FiHeart } from "react-icons/fi";
import { getFavoriteProductIds } from "../../utils/favorites";
import { getApiBaseUrl, normalizeListProduct } from "../../utils/productHelpers";

const baseUrl = getApiBaseUrl();

const FavoritesPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(getFavoriteProductIds());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(getFavoriteProductIds());
    window.addEventListener("favorites:changed", syncFavorites);
    return () => window.removeEventListener("favorites:changed", syncFavorites);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${baseUrl}/api/products`),
          axios.get(`${baseUrl}/api/categories`),
        ]);

        const rawProducts = productsResponse?.data?.products || [];
        const rawCategories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];
        const categoryMap = new Map(rawCategories.map((item) => [item._id, item.name]));

        const normalized = rawProducts
          .map((product) => normalizeListProduct(product, categoryMap))
          .filter((product) => product.available);

        setAllProducts(normalized);
      } catch (error) {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const favoriteProducts = useMemo(() => {
    const ids = new Set(favoriteIds.map(String));
    return allProducts.filter((product) => ids.has(String(product._id)));
  }, [allProducts, favoriteIds]);

  return (
    <AppLayout>
      <div className="bg-white min-h-screen pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 border-b border-gray-100 pb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Favorites</h1>
            <p className="text-gray-500 mt-1">
              {loading ? "Loading saved items..." : `${favoriteProducts.length} saved items`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-[4/3] mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : favoriteProducts.length > 0 ? (
            <ProductGrid products={favoriteProducts} />
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FiHeart className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No favorites yet</h3>
              <p className="text-gray-500">Tap the heart on any product to save it here.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default FavoritesPage;
