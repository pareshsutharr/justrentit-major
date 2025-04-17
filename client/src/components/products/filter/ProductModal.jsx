import React, { useState, useEffect, useRef } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import Swal from "sweetalert2"
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const ProductModal = ({
  selectedProduct,
  activeImageIndex,
  handlePrev,
  handleNext,
  closeProductView,
  currentUser,
}) => {
  const [requestDates, setRequestDates] = useState({
    start: "",
    end: "",
    message: "",
  });
  const rightColumnRef = useRef(null);

  const [totalPrice, setTotalPrice] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  useEffect(() => {
    if (!requestSubmitted && rightColumnRef.current) {
      // Scroll to top when form becomes visible
      rightColumnRef.current.scrollTo(0, 0);
    }
  }, [requestSubmitted]);

  useEffect(() => {
    calculatePrice();
    console.log("Stored userId:", localStorage.getItem("userId"));
  }, [requestDates.start, requestDates.end]);
  const userId = JSON.parse(localStorage.getItem("user")); // Ensure this runs at login
  useEffect(() => {
    const checkOwnershipAndRequests = async () => {
      if (userId && selectedProduct) {
        // Check if user is owner
        const ownerCheck = userId._id === selectedProduct.userId._id;
        setIsOwner(ownerCheck);

        // Check for existing request if not owner
        if (!ownerCheck) {
          try {
            const response = await fetch(
            `${baseUrl}/api/rental-requests/check?productId=${selectedProduct._id}&requesterId=${userId._id}`
            );
            const data = await response.json();
            if (data.exists) {
              setExistingRequest(data.request);
              setRequestSubmitted(true);
              // Pre-fill existing request data
              setRequestDates({
                start: new Date(data.request.startDate)
                  .toISOString()
                  .split("T")[0],
                end: new Date(data.request.endDate).toISOString().split("T")[0],
                message: data.request.message,
              });
            }
          } catch (error) {
            console.error("Error checking existing request:", error);
          }
        }
      }
    };
    checkOwnershipAndRequests();
  }, [selectedProduct, userId]);

  const calculatePrice = () => {
    if (!requestDates.start || !requestDates.end) return;

    const startDate = new Date(requestDates.start);
    const endDate = new Date(requestDates.end);

    if (startDate >= endDate) {
      setError("End date must be after start date");
      return;
    }

    const timeDiff = endDate - startDate;
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let duration;
    switch (selectedProduct.rentalDuration) {
      case "hour":
        duration = Math.ceil(timeDiff / (1000 * 3600));
        break;
      case "day":
        duration = days;
        break;
      case "week":
        duration = Math.ceil(days / 7);
        break;
      case "month":
        duration = Math.ceil(days / 30);
        break;
      default:
        duration = days;
    }

    setTotalPrice(duration * selectedProduct.rentalPrice);
    setError("");
  };

  const handleRequest = async () => {
    if (!userId) return alert("Please login to send request");
    if (isOwner) return;

    try {
      setIsSubmitting(true);
      let response;

      if (existingRequest) {
        // Update existing request
        response = await fetch(
         `${baseUrl}/api/rental-requests/${existingRequest._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startDate: new Date(requestDates.start),
              endDate: new Date(requestDates.end),
              message: requestDates.message,
            }),
          }
        );
      } else {
        // Create new request
        response = await fetch(`${baseUrl}/api/rental-requests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: selectedProduct._id,
            requester: userId._id,
            owner: selectedProduct.userId._id,
            startDate: new Date(requestDates.start),
            endDate: new Date(requestDates.end),
            message: requestDates.message,
          }),
        });
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Error processing request");

      setShowToast(true);
      setRequestSubmitted(true);
      setTimeout(() => setShowToast(false), 3000);
      setExistingRequest(data.request); // Store the updated/created request
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!selectedProduct) return null;

  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${baseUrl}/api/rental-requests/${existingRequest._id}`,
            { method: "DELETE" }
          );
  
          if (!response.ok) throw new Error("Failed to delete request");
  
          setExistingRequest(null);
          setRequestSubmitted(false);
          setRequestDates({ start: "", end: "", message: "" });
  
          Swal.fire({
            title: "Deleted!",
            text: "Your rental request has been successfully deleted.",
            icon: "success"
          });
  
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
          setError(error.message);
          Swal.fire({
            title: "Error!",
            text: "Something went wrong while deleting the request.",
            icon: "error"
          });
        }
      }
    });
  };
  
  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1050 }}
    >
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
        >
          <Toast.Header className="bg-success text-white">
            <strong className="me-auto">Success!</strong>
          </Toast.Header>
          <Toast.Body>Rental request sent successfully!</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content rounded-4 overflow-hidden">
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn-close bg-light rounded-circle p-2"
              onClick={closeProductView}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body pt-0">
            <div className="row g-5">
              <div className="col-lg-7">
                <div className="ratio ratio-1x1 rounded-3 overflow-hidden shadow-lg">
                  <img
                    src={`${baseUrl}${
                      selectedProduct.images[
                        activeImageIndex[selectedProduct._id]
                      ]
                    }`}
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
              </div>

              <div
                ref={rightColumnRef}
                className="col-lg-5 overflow-auto"
                style={{ maxHeight: "80vh" }}
              >
                <h2 className="fw-bold mb-4">{selectedProduct.name}</h2>
                <p className="text-muted mb-4">{selectedProduct.description}</p>

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
                    onClick={() => alert("Chat feature coming soon!")}
                  >
                    <i className="bi bi-chat-dots me-2"></i>Chat
                  </button>
                </div>
                <div className="mb-2">
                  <div className="d-flex align-items-center bg-light p-3 rounded-3">
                    <img
                      src={`${baseUrl}${selectedProduct.userId?.profilePhoto}`}
                      alt="Owner"
                      className="rounded-circle me-3"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h5 className="mb-1 fw-bold">
                        {selectedProduct.userId?.name}
                      </h5>
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

                {isOwner && (
                  <div className="alert alert-warning mb-4">
                    You cannot send rental requests for your own products.
                  </div>
                )}

                {/* Rental Request Section */}
                <div className="bg-light p-4 rounded-3 mb-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted fs-5">
                      {selectedProduct.rentalDuration.charAt(0).toUpperCase() +
                        selectedProduct.rentalDuration.slice(1)}{" "}
                      Rate:
                    </span>
                    <h2 className="text-danger mb-0">
                      ₹{selectedProduct.rentalPrice}
                    </h2>
                  </div>

                  {!requestSubmitted ? (
                    <>
                      <div className="date-picker-group mb-3">
                        <div className="form-group">
                          <label>Start Date</label>
                          <input
                            type="date"
                            value={requestDates.start}
                            onChange={(e) =>
                              setRequestDates({
                                ...requestDates,
                                start: e.target.value,
                              })
                            }
                            className="form-control"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="form-group">
                          <label>End Date</label>
                          <input
                            type="date"
                            value={requestDates.end}
                            onChange={(e) =>
                              setRequestDates({
                                ...requestDates,
                                end: e.target.value,
                              })
                            }
                            className="form-control"
                            min={
                              requestDates.start ||
                              new Date().toISOString().split("T")[0]
                            }
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}

                      <div className="mb-3">
                        <label>Message to Owner</label>
                        <textarea
                          value={requestDates.message}
                          onChange={(e) =>
                            setRequestDates({
                              ...requestDates,
                              message: e.target.value,
                            })
                          }
                          className="form-control"
                          placeholder="Add a message..."
                          rows="3"
                        />
                      </div>

                      <div className="price-breakdown mb-4">
                        <div className="d-flex justify-content-between">
                          <span>Rental Cost:</span>
                          <span>₹{totalPrice}</span>
                        </div>
                        {selectedProduct.securityDeposit > 0 && (
                          <div className="d-flex justify-content-between">
                            <span>Security Deposit:</span>
                            <span>₹{selectedProduct.securityDeposit}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total Payable:</span>
                          <span>
                            ₹{totalPrice + selectedProduct.securityDeposit}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleRequest}
                        className="btn btn-primary w-100 rounded-pill py-3 fw-bold"
                        disabled={isSubmitting || !!error || isOwner}
                      >
                        {isSubmitting ? (
                          <div
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            {existingRequest
                              ? "Update Request"
                              : "Request to Rent"}
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
                      <h4>Request Submitted!</h4>
                      <p className="text-muted">
                        Your rental request has been sent to the owner. You'll
                        be notified once they respond.
                      </p>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setRequestSubmitted(false);
                          }}
                        >
                          Edit Request
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={handleDelete}
                        >
                          Delete Request
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .rental-details-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          margin-top: 2rem;
        }

        .date-picker-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1rem 0;
        }

        .message-input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          min-height: 100px;
          margin: 1rem 0;
        }

        .request-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          transition: transform 0.2s ease;
        }

        .request-button:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default ProductModal;
