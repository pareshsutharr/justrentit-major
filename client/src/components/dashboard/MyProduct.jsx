import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductModal from "./ProductModal";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaStar, FaRegStar, FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import LoadingPage from "../loadingpages/LoadingPage";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
function MyProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    const getUserID = () => {
      try {
        // Check multiple storage locations
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData._id) return userData._id;
        }
        
        const userId = localStorage.getItem("userId");
        if (userId) return userId.replace(/['"]+/g, "");
        
        return null;
      } catch (error) {
        console.error('Error retrieving user ID:', error);
        return null;
      }
    };
  
    const userId = getUserID();
    
    if (!userId) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    axios
    .get(`${baseUrl}/api/my-products?userId=${userId}`)
      .then((response) => {
        if (response.data.success && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setCurrentImageIndex(
            response.data.products.reduce((acc, product) => {
              acc[product._id] = 0;
              return acc;
            }, {})
          );
        } else {
          toast.error(response.data.message || "Unexpected response format");
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Error fetching products");
        setLoading(false);
      });
  }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const saveProduct = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product._id === updatedProduct._id) {
          return {
            ...product,
            ...updatedProduct,
            // Ensure boolean values are properly typed
            available: Boolean(updatedProduct.available),
            isForSale: Boolean(updatedProduct.isForSale),
            featured: Boolean(updatedProduct.featured),
          };
        }
        return product;
      })
    );
  };

  const handleNextImage = (productId) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]:
        (prev[productId] + 1) %
        products.find((p) => p._id === productId)?.images.length,
    }));
  };

  const handlePreviousImage = (productId) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]:
        (prev[productId] -
          1 +
          products.find((p) => p._id === productId)?.images.length) %
        products.find((p) => p._id === productId)?.images.length,
    }));
  };

  const deleteProduct = (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${baseUrl}/api/delete-product/${productId}`)
          .then((response) => {
            if (response.data.success) {
              setProducts((prevProducts) => {
                const newProducts = prevProducts.filter(
                  (product) => product._id !== productId
                );
                const newTotalPages = Math.ceil(
                  newProducts.length / itemsPerPage
                );
                if (currentPage > newTotalPages) {
                  setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
                }
                return newProducts;
              });
              Swal.fire(
                "Deleted!",
                "Your product has been deleted.",
                "success"
              );
            }
          })
          .catch((error) => {
            Swal.fire("Error!", "Error deleting product", "error");
            console.error(error);
          });
      }
    });
  };

  const paginationButtonStyle = {
    padding: "8px 16px",
    border: "1px solid #007bff",
    borderRadius: "5px",
    backgroundColor: "#fff",
    color: "#007bff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":disabled": {
      backgroundColor: "#e9ecef",
      borderColor: "#dee2e6",
      color: "#6c757d",
      cursor: "not-allowed",
    },
  };

  if (loading) {
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2
        style={{
          fontSize: "2rem",
          color: "#2c3e50",
          marginBottom: "30px",
          fontWeight: "600",
        }}
      >
        My Products
      </h2>

      {products.length === 0 ? (
        <p style={{ fontSize: "1.2rem", color: "#7f8c8d" }}>
          No products found for your account.
        </p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "25px",
              padding: "15px",
            }}
          >
            {paginatedProducts.map((product) => (
              <div
                key={product._id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                  overflow: "hidden",
                  position: "relative",
                  transition: "transform 0.2s ease",
                  ":hover": {
                    transform: "translateY(-3px)",
                  },
                }}
              >
                {product.verified && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "-30px",
                      backgroundColor: "#27ae60",
                      color: "white",
                      padding: "5px 30px",
                      transform: "rotate(-45deg)",
                      fontSize: "0.8rem",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                      zIndex: 1,
                    }}
                  >
                    Verified
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    display: "flex",
                    gap: "10px",
                    zIndex: 1,
                  }}
                >
                  <button
                    onClick={() => openModal(product)}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    style={{
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <MdDelete size={20} />
                  </button>
                </div>

                <div
                  style={{
                    position: "relative",
                    height: "250px",
                    overflow: "hidden",
                  }}
                >
                  {product.images?.length > 1 && (
                    <>
                      <button
                        onClick={() => handlePreviousImage(product._id)}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "10px",
                          transform: "translateY(-50%)",
                          background: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "35px",
                          height: "35px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 2,
                        }}
                      >
                        &lt;
                      </button>
                      <button
                        onClick={() => handleNextImage(product._id)}
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          background: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "35px",
                          height: "35px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 2,
                        }}
                      >
                        &gt;
                      </button>
                    </>
                  )}
                  <img
                    src={`${baseUrl}${
                      product.images?.[currentImageIndex[product._id]] ||
                      "/placeholder-image.png"
                    }`}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderBottom: "2px solid #f8f9fa",
                    }}
                  />
                </div>

                <div style={{ padding: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.3rem",
                        color: "#2c3e50",
                        fontWeight: "600",
                      }}
                    >
                      {product.name}
                    </h3>
                    {product.verified && (
                      <FaCheckCircle color="#27ae60" size={20} />
                    )}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      backgroundColor:
                        product.condition === "new"
                          ? "#27ae6020"
                          : product.condition === "excellent"
                          ? "#2980b920"
                          : product.condition === "good"
                          ? "#f1c40f20"
                          : product.condition === "fair"
                          ? "#e67e2220"
                          : "#e74c3c20",
                      color:
                        product.condition === "new"
                          ? "#27ae60"
                          : product.condition === "excellent"
                          ? "#2980b9"
                          : product.condition === "good"
                          ? "#f1c40f"
                          : product.condition === "fair"
                          ? "#e67e22"
                          : "#e74c3c",
                      marginBottom: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      textTransform: "capitalize",
                    }}
                  >
                    {product.condition} condition
                  </div>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#7f8c8d",
                      marginBottom: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    {product.description}
                  </p>
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontWeight: "bold" }}>
                      No of Categories:
                    </span>{" "}
                    {product.category ? product.category.length : 0}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontWeight: "bold" }}>Location:</span>{" "}
                    {`${product?.location?.area}, ${product?.location?.state}, ${product?.location?.country} - ${product?.location?.pincode}`}
                  </div>
                  <div
                    style={{
                      marginTop: "15px",
                      borderTop: "1px solid #eee",
                      paddingTop: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: "600", color: "#2c3e50" }}>
                          Rent:
                        </span>
                        <span
                          style={{
                            color: "#27ae60",
                            fontWeight: "600",
                            marginLeft: "8px",
                          }}
                        >
                          ₹{product.rentalPrice}/{product.rentalDuration}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>
                          Deposit: ₹{product.securityDeposit}
                        </div>
                      </div>
                    </div>
                    {product.sellingPrice > 0 ? (
                      <div style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>
                        Available for Sale At: ₹{product.sellingPrice}
                      </div>
                    ) : null}

                    {/* Add Rating Stars */}
                    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "12px",
  }}
>
  {[...Array(5)].map((_, index) => {
    const avgRating = Math.round(product.ratings?.averageRating || 0);
    return avgRating > index ? (
      <FaStar key={index} color="#f1c40f" />
    ) : (
      <FaRegStar key={index} color="#bdc3c7" />
    );
  })}
  <span style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>
    ({product.ratings?.totalRatings || 0} reviews)
  </span>
</div>
                    {/* Availability Badge */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "10px",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: product.available
                            ? "#27ae6020"
                            : "#e74c3c20",
                          color: product.available ? "#27ae60" : "#e74c3c",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                        }}
                      >
                        {product.available
                          ? "Available Now"
                          : "Currently Unavailable"}
                      </span>
                      {product.featured && (
                        <span
                          style={{
                            backgroundColor: "#3498db20",
                            color: "#3498db",
                            padding: "5px 12px",
                            borderRadius: "20px",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                          }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  {product.updatedAt ? (
                    <div style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>
                      UpdatedAt:{" "}
                      {new Date(product.updatedAt).toLocaleDateString()}{" "}
                      {new Date(product.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "30px",
                padding: "20px 0",
              }}
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  ...paginationButtonStyle,
                  backgroundColor: currentPage === 1 ? "#f8f9fa" : "#fff",
                  borderColor: currentPage === 1 ? "#dee2e6" : "#007bff",
                  color: currentPage === 1 ? "#6c757d" : "#007bff",
                }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      ...paginationButtonStyle,
                      backgroundColor:
                        currentPage === page ? "#007bff" : "#fff",
                      color: currentPage === page ? "#fff" : "#007bff",
                    }}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  ...paginationButtonStyle,
                  backgroundColor:
                    currentPage === totalPages ? "#f8f9fa" : "#fff",
                  borderColor:
                    currentPage === totalPages ? "#dee2e6" : "#007bff",
                  color: currentPage === totalPages ? "#6c757d" : "#007bff",
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={closeModal}
          onSave={saveProduct}
        />
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default MyProduct;
