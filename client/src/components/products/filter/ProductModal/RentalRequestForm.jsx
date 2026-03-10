import React from "react";
import { toast } from "react-toastify";
import useRentalRequest from "./hooks/useRentalRequest";
import PriceBreakdown from "./PriceBreakdown";
import LoadingPage from "../../../loadingpages/LoadingForLocation";

const statusLabel = {
  pending: "Pending review",
  approved: "Approved",
  in_transit: "Shipped",
  delivered: "Delivered",
  in_use: "Active rental",
  return_in_transit: "Returning",
  returned: "Returned",
  completed: "Completed",
  rejected: "Rejected",
};

const InfoPill = ({ label, value }) => (
  <div className="rounded-3 border border-gray-200 bg-white px-3 py-2">
    <p className="mb-1 text-uppercase text-muted small fw-semibold">{label}</p>
    <p className="mb-0 fw-semibold text-dark">{value}</p>
  </div>
);

const BookingNotice = ({ title, body, tone = "light" }) => {
  const tones = {
    light: "border-primary-subtle bg-primary-subtle text-dark",
    success: "border-success-subtle bg-success-subtle text-dark",
    warning: "border-warning-subtle bg-warning-subtle text-dark",
  };

  return (
    <div className={`rounded-4 border p-3 ${tones[tone] || tones.light}`}>
      <p className="mb-1 fw-semibold">{title}</p>
      <p className="mb-0 small">{body}</p>
    </div>
  );
};

const RentalRequestForm = ({ selectedProduct }) => {
  const {
    requestDates,
    setRequestDates,
    totalPrice,
    payableAmount,
    error,
    isSubmitting,
    isOwner,
    isAuthenticated,
    existingRequest,
    hasPaidRequest,
    handleRequest,
    handleDelete,
  } = useRentalRequest(selectedProduct);
  const handleSubmit = async () => {
    try {
      await handleRequest();
      toast.success("Payment completed and booking created.");
    } catch {
      toast.error("Unable to complete payment and request.");
    }
  };

  if (!selectedProduct) return null;

  if (isOwner) {
    return (
      <div className="rounded-4 border border-warning-subtle bg-warning-subtle p-4">
        <p className="mb-1 fw-semibold text-dark">Owner access</p>
        <p className="mb-0 small text-muted">
          You cannot create a rental request for your own product.
        </p>
      </div>
    );
  }

  if (!selectedProduct.available && !existingRequest) {
    return (
      <div className="rounded-4 border border-secondary-subtle bg-light p-4">
        <p className="mb-1 fw-semibold text-dark">Currently unavailable</p>
        <p className="mb-0 small text-muted">
          This item already has an active booking. Check back after it is returned.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-4 border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-bottom border-gray-100 bg-light px-4 py-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
          <div>
            <p className="mb-1 text-uppercase text-muted small fw-semibold">Booking & Payment</p>
            <h3 className="mb-1 h4 fw-bold text-dark">Reserve this product</h3>
            <p className="mb-0 small text-muted">
              Choose dates, review the amount, then finish the Razorpay test payment to activate the request.
            </p>
          </div>
          <div className="d-grid gap-2" style={{ minWidth: "210px" }}>
            <InfoPill
              label={`${selectedProduct.rentalDuration} rate`}
              value={`₹${selectedProduct.rentalPrice}`}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {!isAuthenticated && (
          <BookingNotice
            title="Login required"
            body="Please sign in before starting a booking request."
            tone="warning"
          />
        )}

        {existingRequest ? (
          <div className="d-grid gap-3">
            <BookingNotice
              title={hasPaidRequest ? "Payment completed" : "Request already created"}
              body={
                hasPaidRequest
                  ? `Your payment is done. Invoice ${existingRequest.invoiceNumber || "is being generated"} and active rental details are available in the dashboard.`
                  : "You already have an active request for this product. You can review or delete it below."
              }
              tone={hasPaidRequest ? "success" : "light"}
            />

            <div className="row g-3">
              <div className="col-md-4">
                <InfoPill
                  label="Start date"
                  value={existingRequest?.startDate ? new Date(existingRequest.startDate).toLocaleDateString() : "N/A"}
                />
              </div>
              <div className="col-md-4">
                <InfoPill
                  label="End date"
                  value={existingRequest?.endDate ? new Date(existingRequest.endDate).toLocaleDateString() : "N/A"}
                />
              </div>
              <div className="col-md-4">
                <InfoPill
                  label="Status"
                  value={statusLabel[existingRequest?.status] || existingRequest?.status || "Active"}
                />
              </div>
            </div>

            {existingRequest?.message && (
              <div className="rounded-4 border border-gray-200 bg-light p-3">
                <p className="mb-1 text-uppercase text-muted small fw-semibold">Message</p>
                <p className="mb-0 small text-dark">{existingRequest.message}</p>
              </div>
            )}

            {existingRequest?.payment?.amount > 0 && (
              <div className="rounded-4 border border-primary-subtle bg-primary-subtle p-3">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                  <div>
                    <p className="mb-1 fw-semibold text-dark">Payment Summary</p>
                    <p className="mb-0 small text-muted">
                      Paid amount: ₹{existingRequest.payment.amount}
                    </p>
                  </div>
                  {existingRequest?.invoiceNumber && (
                    <p className="mb-0 small fw-semibold text-primary">
                      Invoice {existingRequest.invoiceNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!hasPaidRequest && (
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-outline-danger rounded-pill px-4" onClick={handleDelete}>
                  Delete Request
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="d-grid gap-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small text-muted fw-semibold">Start Date</label>
                <input
                  type="date"
                  value={requestDates.start || ""}
                  onChange={(event) =>
                    setRequestDates({ ...requestDates, start: event.target.value })
                  }
                  className="form-control form-control-lg rounded-4"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted fw-semibold">End Date</label>
                <input
                  type="date"
                  value={requestDates.end || ""}
                  onChange={(event) =>
                    setRequestDates({ ...requestDates, end: event.target.value })
                  }
                  className="form-control form-control-lg rounded-4"
                  min={requestDates.start || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div>
              <label className="form-label small text-muted fw-semibold">Message to owner</label>
              <textarea
                value={requestDates.message || ""}
                onChange={(event) =>
                  setRequestDates({ ...requestDates, message: event.target.value })
                }
                className="form-control rounded-4"
                placeholder="Share delivery notes, purpose, or any booking context..."
                rows="4"
              />
            </div>

            {error && (
              <div className="rounded-4 border border-danger-subtle bg-danger-subtle px-3 py-2 small text-danger-emphasis">
                {error}
              </div>
            )}

            <div className="rounded-4 border border-gray-200 bg-light p-3">
              <div className="row g-3">
                <div className="col-md-7">
                  <PriceBreakdown
                    totalPrice={totalPrice}
                    securityDeposit={selectedProduct.securityDeposit}
                  />
                </div>
                <div className="col-md-5">
                  <div className="rounded-4 bg-white border border-gray-200 p-3 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <p className="mb-1 fw-semibold text-dark">What happens next</p>
                      <ul className="mb-0 ps-3 small text-muted">
                        <li>Open Razorpay test mode</li>
                        <li>Complete the test payment</li>
                        <li>Request activates and invoice appears in dashboard</li>
                      </ul>
                    </div>
                    <p className="mb-0 mt-3 small fw-semibold text-primary">
                      Total payable now: ₹{payableAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !!error || !isAuthenticated}
                className="btn border-0 rounded-pill px-4 px-md-5"
                style={{
                  minHeight: "62px",
                  minWidth: "280px",
                  background: isSubmitting || !!error || !isAuthenticated
                    ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                    : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  letterSpacing: "0.01em",
                  boxShadow: isSubmitting || !!error || !isAuthenticated
                    ? "none"
                    : "0 18px 38px rgba(22, 163, 74, 0.22)",
                }}
              >
                {isSubmitting ? (
                  <span className="d-inline-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span className="visually-hidden"><LoadingPage /></span>
                    Processing payment...
                  </span>
                ) : (
                  <span className="d-inline-flex align-items-center gap-2">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-25"
                      style={{ width: "36px", height: "36px" }}
                    >
                      <i className="bi bi-credit-card fs-5"></i>
                    </span>
                    <span>Pay & Confirm Booking</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RentalRequestForm;
