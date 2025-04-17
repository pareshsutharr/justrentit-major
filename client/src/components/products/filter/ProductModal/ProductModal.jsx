import React from "react";
import ProductImageGallery from "./ProductImageGallery";
import OwnerInfoSection from "./OwnerInfoSection";
import RentalRequestForm from "./RentalRequestForm";
import RequestToast from "./RequestToast";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const ProductModal = ({
  selectedProduct,
  activeImageIndex,
  handlePrev,
  handleNext,
  closeProductView,
}) => {
  const navigate = useNavigate();

  const handleOpenChat = (product) => {
    navigate("/dashboard", {
      state: {
        openChatWith: product.userId._id,
      },
    });
  };

  if (!selectedProduct) return null;
  // Create handlers with product ID for image navigation
  const handleModalPrev = () => handlePrev(selectedProduct._id);
  const handleModalNext = () => handleNext(selectedProduct._id);

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1050 }}
      onClick={(e) => e.target === e.currentTarget && closeProductView()}
    >
      <RequestToast />

      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content rounded-4 overflow-hidden">
          <div className="modal-header border-0 pb-0"></div>

          <div className="modal-body pt-0">
            <div className="row g-5">
              <div className="col-lg-7">
                <ProductImageGallery
                  selectedProduct={selectedProduct}
                  activeImageIndex={activeImageIndex}
                  handlePrev={handleModalPrev}
                  handleNext={handleModalNext}
                />
              </div>

              <div
                className="col-lg-5 overflow-auto"
                style={{ maxHeight: "80vh" }}
              >
                <div className="d-flex justify-content-end w-100">
                  <button
                    type="button"
                    className="btn-close bg-light rounded-circle p-2 cursor-pointer"
                    onClick={closeProductView}
                    aria-label="Close"
                  ></button>
                </div>

                <h2 className="fw-bold mb-4">{selectedProduct.name}</h2>

                <p
                  className="text-muted mb-4"
                  style={{ wordBreak: "break-word" }}
                >
                  {selectedProduct.description}
                </p>

                <div className="d-flex gap-2 mb-4">
                  <a
                    href={`mailto:${selectedProduct.userId?.email}`}
                    className="btn btn-primary rounded-pill px-4 d-flex align-items-center"
                  >
                    <i className="bi bi-envelope me-2"></i>Email
                  </a>
                  <a
                    href={`tel:${selectedProduct.userId?.phone}`}
                    className="btn btn-success rounded-pill px-4 d-flex align-items-center"
                  >
                    <i className="bi bi-telephone me-2"></i>Call
                  </a>

                  <button
                    className="btn btn-dark rounded-pill px-4 d-flex align-items-center"
                    onClick={() => handleOpenChat(selectedProduct)}
                  >
                    <i className="bi bi-chat-dots me-2"></i>Chat
                  </button>
                </div>

                <div className="d-flex gap-2 mb-4">
                  <OwnerInfoSection selectedProduct={selectedProduct} />
                </div>

                <RentalRequestForm selectedProduct={selectedProduct} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
