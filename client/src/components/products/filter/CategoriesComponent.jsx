import React, { useState, useEffect } from "react";
import FiltersComponent from "./FiltersComponent";
import PublicProduct from "./ProductsComponent";
import Fuse from "fuse.js"; // For fuzzy search
import LoadingPage from "../../loadingpages/LoadingPage";
import "./CategoriesComponent.css";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const CategoriesComponent = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // For search results
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // For search input

  // State for filters
  const [filters, setFilters] = useState({
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    state: "",
    condition: "",
    rentalDuration: "",
  });

  // Fetch products from the backend
  const fetchProducts = async () => {
    setLoading(true);
    setApiError("");
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseUrl}/products?${query}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Products API failed (${response.status}): ${text}`);
      }
      const data = await response.json();
      const nextProducts = Array.isArray(data) ? data : [];
      setProducts(nextProducts);
      setFilteredProducts(nextProducts); // Initialize filtered products with all products
      // console.log("Fetched Products:", data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setFilteredProducts([]);
      setApiError("Unable to load products right now.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/categories`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Categories API failed (${response.status}): ${text}`);
        }
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
        setApiError((prev) => prev || "Unable to load categories right now.");
      }
    };
    fetchCategories();
    fetchProducts();
  }, []);

  // Refetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handle search input changes
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query) {
      setFilteredProducts(products); // Reset to all products if search is empty
      return;
    }

    // Use Fuse.js for fuzzy search
    const fuse = new Fuse(products, {
      keys: ["name"], // Search by product name
      includeScore: true,
      threshold: 0.3, // Adjust threshold for similarity
    });

    const results = fuse.search(query).map((result) => result.item);
    setFilteredProducts(results);
  };

  return (
    // <div className="p-6 bg-gray-100 w-full max-w-[1400px] h-100vh flex flex-col items-center" style={{backgroundImage:'url(images/bghome.png)'}}>
    <div className="categories-page w-100 d-flex flex-column align-items-center">
      {/* <Header/> */}
      <FiltersComponent
        categories={categories}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
        onSearch={handleSearch} // Pass search handler
        searchQuery={searchQuery} // Pass search query
      />

      {loading ? (
        <div><LoadingPage/></div>
      ) : (
        <>
          {apiError && (
            <div className="alert alert-warning w-100 text-center api-warning" role="alert">
              {apiError}
            </div>
          )}
          <PublicProduct products={filteredProducts} ownerDetails={true} />
        </>
      )}
      {/* <Footer/> */}
    </div>
  );
};

export default CategoriesComponent;
