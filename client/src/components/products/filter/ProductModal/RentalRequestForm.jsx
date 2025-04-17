import React from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRentalRequest from "./hooks/useRentalRequest";
import PriceBreakdown from "./PriceBreakdown";
import LoadingPage from "../../../loadingpages/LoadingForLocation";

const RentalRequestForm = ({ selectedProduct }) => {
  const {
    requestDates,
    setRequestDates,
    totalPrice,
    error,
    isSubmitting,
    isOwner,
    existingRequest,
    handleRequest,
    handleDelete,
  } = useRentalRequest(selectedProduct);

  const handleSubmit = async () => {
    try {
      await handleRequest();
      toast.success("Rental request sent successfully!");
    } catch (err) {
      toast.error("Failed to send rental request. Please try again.");
    }
  };

  if (isOwner)
    return (
      <div className="alert alert-warning mb-4">
        You cannot send rental requests for your own products.
      </div>
    );

  return (
    <div className="bg-light p-4 rounded-3 mb-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted fs-5">
          {selectedProduct.rentalDuration.charAt(0).toUpperCase() +
            selectedProduct.rentalDuration.slice(1)}{" "}
          Rate:
        </span>
        <h2 className="text-danger mb-0">₹{selectedProduct.rentalPrice}</h2>
      </div>

      {/* Show the last request details above the form */}
      {existingRequest ? (
        <div className="alert alert-info p-3 mb-3">
          <h5 className="mb-3">Your Rental Request</h5>
          <div className="mb-2">
            <strong>Start Date:</strong>{" "}
            {existingRequest?.startDate
              ? new Date(existingRequest.startDate).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="mb-2">
            <strong>End Date:</strong>{" "}
            {existingRequest?.endDate
              ? new Date(existingRequest.endDate).toLocaleDateString()
              : "N/A"}
          </div>
          <div className="mb-3">
            <strong>Message:</strong>
            <div className="bg-white p-2 rounded mt-1" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
              {existingRequest.message || "No message provided"}
            </div>
          </div>
          <small className="text-muted">
            <i className="bi bi-clock-history me-1"></i>
            First message sent on{" "}
            {existingRequest.createdAt
              ? new Date(existingRequest.createdAt).toLocaleString()
              : "N/A"}
          </small>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-outline-danger" onClick={handleDelete}>
              <i className="bi bi-trash me-2"></i>
              Delete Request
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Rental Request Form */}
          <h4 className="mb-3">Submit a New Rental Request</h4>
          <div className="date-picker-group mb-3">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={requestDates.start || ""}
                onChange={(e) =>
                  setRequestDates({ ...requestDates, start: e.target.value })
                }
                className="form-control"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={requestDates.end || ""}
                onChange={(e) =>
                  setRequestDates({ ...requestDates, end: e.target.value })
                }
                className="form-control"
                min={requestDates.start || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label>Message to Owner</label>
            <textarea
              value={requestDates.message || ""}
              onChange={(e) =>
                setRequestDates({ ...requestDates, message: e.target.value })
              }
              className="form-control"
              placeholder="Add a message..."
              rows="3"
            />
          </div>

          <PriceBreakdown
            totalPrice={totalPrice}
            securityDeposit={selectedProduct.securityDeposit}
          />

          <button
            onClick={handleSubmit}
            className="btn btn-primary w-100 rounded-pill py-3 fw-bold"
            disabled={isSubmitting || !!error}
          >
            {isSubmitting ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden"><LoadingPage/></span>
              </div>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                Submit Request
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default RentalRequestForm;
