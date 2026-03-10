// components/RatingPopup.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Rating, Textarea, Alert } from "@mantine/core";
import axios from "axios";
import Swal from "sweetalert2";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const RatingPopup = ({ request, userId, onClose }) => {
  const [open, setOpen] = useState(true);
  const [ratingsToSubmit, setRatingsToSubmit] = useState({
    owner: false,
    product: false,
    renter: false,
  });

  const [ratings, setRatings] = useState({
    owner: { value: 0, comment: "" },
    product: { value: 0, comment: "" },
    renter: { value: 0, comment: "" },
  });

  useEffect(() => {
    if (!request?._id) return;
    const checkPendingRatings = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/api/ratings/check/${request._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setRatingsToSubmit(res.data);
      } catch (err) {
        console.error("Error checking ratings:", err);
      }
    };

    checkPendingRatings();
  }, [request?._id]);

  const ownerName = request?.owner?.name || "Owner";
  const renterName = request?.requester?.name || "Renter";
  const productName = request?.product?.name || "Product";

  const handleSubmit = async (type) => {
    try {
      if (!request?._id) {
        Swal.fire("Error!", "Rental request details are unavailable", "error");
        return;
      }
      if (!ratings[type].value) {
        Swal.fire(
          "Error!",
          "Please provide a rating before submitting",
          "error"
        );
        return;
      }

      let payload = {
        rentalRequest: request._id,
        rater: userId,
        rating: ratings[type].value,
        comment: ratings[type].comment,
        type: type === "product" ? "product" : "user",
      };

      if (type === "product") {
        if (!request?.product?._id) {
          Swal.fire("Error!", "Product details are unavailable", "error");
          return;
        }
        payload.ratedProduct = request.product._id;
      } else {
        const targetUserId =
          type === "owner" ? request?.owner?._id : request?.requester?._id;
        if (!targetUserId) {
          Swal.fire("Error!", "User details are unavailable", "error");
          return;
        }
        payload.ratedUser =
          targetUserId;
      }

      await axios.post(`${baseUrl}/api/ratings`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const nextRatingsToSubmit = { ...ratingsToSubmit, [type]: false };
      setRatingsToSubmit(nextRatingsToSubmit);
      Swal.fire("Success!", "Rating submitted successfully", "success");

      if (!Object.values(nextRatingsToSubmit).some((v) => v)) {
        onClose();
      }
    } catch (err) {
      Swal.fire(
        "Error!",
        err.response?.data?.error || "Failed to submit rating",
        "error"
      );
    }
  };

  return (
    <Modal
      opened={open}
      onClose={() => {
        setOpen(false);
        onClose();
      }}
      title="Rate Your Experience"
      size="lg"
      centered
    >
      {ratingsToSubmit.owner && (
        <div className="mb-4">
          <h4>Rate Owner ({ownerName})</h4>
          <Rating
            value={ratings.owner.value}
            onChange={(value) =>
              setRatings((prev) => ({
                ...prev,
                owner: { ...prev.owner, value },
              }))
            }
          />
          <Textarea
            label="Comment (optional)"
            value={ratings.owner.comment}
            onChange={(e) =>
              setRatings((prev) => ({
                ...prev,
                owner: { ...prev.owner, comment: e.target.value },
              }))
            }
            mt="sm"
          />
          <Button
            onClick={() => handleSubmit("owner")}
            disabled={ratings.owner.value === 0}
            mt="sm"
          >
            Submit Owner Rating
          </Button>
        </div>
      )}

      {ratingsToSubmit.product && (
        <div className="mb-4">
          <h4>Rate Product ({productName})</h4>
          <Rating
            value={ratings.product.value}
            onChange={(value) =>
              setRatings((prev) => ({
                ...prev,
                product: { ...prev.product, value },
              }))
            }
          />
          <Textarea
            label="Comment (optional)"
            value={ratings.product.comment}
            onChange={(e) =>
              setRatings((prev) => ({
                ...prev,
                product: { ...prev.product, comment: e.target.value },
              }))
            }
            mt="sm"
          />
          <Button
            onClick={() => handleSubmit("product")}
            disabled={ratings.product.value === 0}
            mt="sm"
          >
            Submit Product Rating
          </Button>
        </div>
      )}

      {ratingsToSubmit.renter && (
        <div className="mb-4">
          <h4>Rate Renter ({renterName})</h4>
          <Rating
            value={ratings.renter.value}
            onChange={(value) =>
              setRatings((prev) => ({
                ...prev,
                renter: { ...prev.renter, value },
              }))
            }
          />
          <Textarea
            label="Comment (optional)"
            value={ratings.renter.comment}
            onChange={(e) =>
              setRatings((prev) => ({
                ...prev,
                renter: { ...prev.renter, comment: e.target.value },
              }))
            }
            mt="sm"
          />
          <Button
            onClick={() => handleSubmit("renter")}
            disabled={ratings.renter.value === 0}
            mt="sm"
          >
            Submit Renter Rating
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default RatingPopup;
