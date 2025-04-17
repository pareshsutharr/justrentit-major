import React, { Suspense, useEffect, useState } from 'react';
import LoadingPage from '../../loadingpages/LoadingPage';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal/ProductModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// const baseUrl = import.meta.env.VITE_API_BASE_URL;
function PublicProduct({ products, loading }) {
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(8); 
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const initialIndexes = {};
    products.forEach((product) => {
      initialIndexes[product._id] = 0;
    });
    setActiveImageIndex(initialIndexes);
  }, [products]);

  const openProductView = (product) => {
    setSelectedProduct(product);
  };

  const closeProductView = () => {
    setSelectedProduct(null);
  };

  const handlePrev = (productId) => {
    setActiveImageIndex((prev) => {
      const currentIndex = prev[productId];
      const productImages = products.find((p) => p._id === productId).images;
      const newIndex = (currentIndex - 1 + productImages.length) % productImages.length;
      return { ...prev, [productId]: newIndex };
    });
  };

  const handleNext = (productId) => {
    setActiveImageIndex((prev) => {
      const currentIndex = prev[productId];
      const productImages = products.find((p) => p._id === productId).images;
      const newIndex = (currentIndex + 1) % productImages.length;
      return { ...prev, [productId]: newIndex };
    });
  };

  const loadMoreProducts = () => {
    const newVisibleCount = visibleProducts + 8;
    setVisibleProducts(newVisibleCount);

    if (newVisibleCount >= products.length) {
      setHasMore(false); // Hide button when all products are shown
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container-fluid px-4 py-5" style={{ background: 'white', zIndex: '1' }}>
      <div className="mx-auto" style={{ maxWidth: '1400px' }}>
        <Suspense fallback={<LoadingPage />}>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {products
              .filter((product) => product.available)
              .slice(0, visibleProducts) // Incrementally show products
              .map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  activeImageIndex={activeImageIndex}
                  handlePrev={handlePrev}
                  handleNext={handleNext}
                  openProductView={openProductView}
                />
              ))}
          </div>
        </Suspense>

        {hasMore && (
          <div className="text-center mt-4">
            <button className="btn btn-primary" onClick={loadMoreProducts}>
              Show More 🙇🏻‍♂️
            </button>
          </div>
        )}

        {selectedProduct && (
          <ProductModal
            selectedProduct={selectedProduct}
            activeImageIndex={activeImageIndex}
            handlePrev={handlePrev}
            handleNext={handleNext}
            closeProductView={closeProductView}
          />
        )}
      </div>
    </div>
  );
}

export default PublicProduct;

