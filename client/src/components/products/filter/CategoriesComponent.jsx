import React, { useState, useEffect } from "react";
import FiltersComponent from "./FiltersComponent";
import PublicProduct from "./ProductsComponent";
import Fuse from "fuse.js"; // For fuzzy search
import LoadingPage from "../../loadingpages/LoadingPage";
import Footer from "../../Footer";
import Header from "../../Header";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const CategoriesComponent = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // For search results
  const [loading, setLoading] = useState(false);
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
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`${baseUrl}/products?${query}`);
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data); // Initialize filtered products with all products
      // console.log("Fetched Products:", data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
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
    <div className="p-6 bg-gray-100 w-full max-w-[1400px] flex flex-col items-center" style={{background:'linear-gradient(135deg, #2E8B57, #1E3A8A)'}}>
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
        <PublicProduct products={filteredProducts} ownerDetails={true} />
      )}
      {/* <Footer/> */}
    </div>
  );
};

export default CategoriesComponent;