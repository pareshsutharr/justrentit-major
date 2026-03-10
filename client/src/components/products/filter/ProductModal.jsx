import React from "react";
import { openRazorpayPaymentLink } from "../../../utils/paymentLink";
import RentalRequestForm from "./ProductModal/RentalRequestForm";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const ProductModal = ({
  selectedProduct,
  activeImageIndex,
  handlePrev,
  handleNext,
  closeProductView,
}) => {
  if (!selectedProduct) return null;

  const currentImage = selectedProduct.images?.[activeImageIndex[selectedProduct._id]] || selectedProduct.images?.[0];

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(15,23,42,0.72)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content rounded-4 overflow-hidden border-0 shadow-lg">
          <div className="modal-header border-0 bg-white pb-0">
            <button
              type="button"
              className="btn-close bg-light rounded-circle p-2"
              onClick={closeProductView}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body bg-white pt-0">
            <div className="row g-4 g-lg-5">
              <div className="col-lg-7">
                <div className="position-relative rounded-4 overflow-hidden bg-light shadow-sm">
                  <img
                    src={`${baseUrl}${currentImage}`}
                    className="w-100"
                    style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
                    alt={selectedProduct.name}
                  />
                </div>

                {selectedProduct.images?.length > 1 && (
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
                )}
              </div>

              <div className="col-lg-5">
                <div className="d-flex flex-column gap-4">
                  <div>
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                      <div>
                        <p className="text-uppercase text-muted small fw-semibold mb-1">
                          {Array.isArray(selectedProduct.category)
                            ? selectedProduct.category.join(", ")
                            : selectedProduct.category || "Product"}
                        </p>
                        <h2 className="fw-bold mb-2">{selectedProduct.name}</h2>
                      </div>
                      <span className={`badge rounded-pill ${selectedProduct.available ? "text-bg-success" : "text-bg-secondary"}`}>
                        {selectedProduct.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <p className="text-muted mb-0">{selectedProduct.description}</p>
                  </div>

                  <div className="rounded-4 border border-gray-200 bg-light p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1 text-uppercase text-muted small fw-semibold">Rental price</p>
                        <h3 className="mb-0 fw-bold text-dark">₹{selectedProduct.rentalPrice}</h3>
                      </div>
                      <div className="text-end">
                        <p className="mb-1 text-uppercase text-muted small fw-semibold">Duration</p>
                        <p className="mb-0 fw-semibold text-dark text-capitalize">{selectedProduct.rentalDuration}</p>
                      </div>
                    </div>
                    {selectedProduct.securityDeposit > 0 && (
                      <div className="mt-3 rounded-4 bg-white border border-gray-200 px-3 py-2 small text-muted">
                        Security deposit: <span className="fw-semibold text-dark">₹{selectedProduct.securityDeposit}</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-4 border border-gray-200 bg-white p-4">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={
                          selectedProduct.userId?.profilePhoto?.startsWith("http")
                            ? selectedProduct.userId.profilePhoto
                            : `${baseUrl}${selectedProduct.userId?.profilePhoto || ""}`
                        }
                        alt={selectedProduct.userId?.name || "Owner"}
                        className="rounded-circle"
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-bold">{selectedProduct.userId?.name}</p>
                        <p className="mb-0 small text-muted">{selectedProduct.userId?.email}</p>
                      </div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap mt-3">
                      <a
                        href={`mailto:${selectedProduct.userId?.email}`}
                        className="btn btn-outline-primary rounded-pill px-4"
                      >
                        <i className="bi bi-envelope me-2"></i>Email
                      </a>
                      <a
                        href={`tel:${selectedProduct.userId?.phone}`}
                        className="btn btn-outline-success rounded-pill px-4"
                      >
                        <i className="bi bi-telephone me-2"></i>Call
                      </a>
                      <button
                        type="button"
                        className="btn btn-outline-dark rounded-pill px-4"
                        onClick={openRazorpayPaymentLink}
                      >
                        <i className="bi bi-credit-card me-2"></i>Pay
                      </button>
                    </div>
                  </div>

                  <RentalRequestForm selectedProduct={selectedProduct} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
