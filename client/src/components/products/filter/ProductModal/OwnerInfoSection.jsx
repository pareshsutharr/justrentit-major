import React from 'react';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const OwnerInfoSection = ({ selectedProduct }) => (
  <div className="mb-2">
    <div className="d-flex align-items-center bg-light p-3 rounded-3">
      <img
        src={selectedProduct.userId?.profilePhoto.startsWith("http") ? selectedProduct.userId?.profilePhoto : `${baseUrl}${selectedProduct.userId?.profilePhoto}`}
        alt="Owner"
        className="rounded-circle me-3"
        style={{ width: "60px", height: "60px", objectFit: "cover" }}
      />
      <div>
        <h5 className="mb-1 fw-bold">{selectedProduct.userId?.name}</h5>
        <p className="mb-1 small text-muted">
          <i className="bi bi-envelope me-2"></i>
          {selectedProduct.userId?.email}
        </p>
        <p className="mb-0 small text-muted">
          <i className="bi bi-telephone me-2"></i>
          {selectedProduct.userId?.phone}
        </p>
      </div>
    </div>
  </div>
);

export default OwnerInfoSection;