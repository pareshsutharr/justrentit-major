import React from 'react';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const ProductImageGallery = ({ selectedProduct, activeImageIndex, handlePrev, handleNext }) => (
  <>
    <div className="ratio ratio-1x1 rounded-3 overflow-hidden shadow-lg">
      <img
        src={`${baseUrl}${selectedProduct.images[activeImageIndex[selectedProduct._id]]}`}
        className="w-100 h-100 object-fit-cover"
        alt="Selected Product"
      />
    </div>
    <div className="d-flex justify-content-center mt-4">
      <div className="btn-group shadow-sm">
        <button
          className="btn btn-outline-dark rounded-start-pill px-4"
          onClick={() => handlePrev(selectedProduct._id)}
        >
          <i className="bi bi-chevron-left me-2"></i>Prev
        </button>
        <button
          className="btn btn-outline-dark rounded-end-pill px-4"
          onClick={() => handleNext(selectedProduct._id)}
        >
          Next <i className="bi bi-chevron-right ms-2"></i>
        </button>
      </div>
    </div>
  </>
);

export default ProductImageGallery;