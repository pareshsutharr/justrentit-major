import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const useRentalRequest = (selectedProduct) => {
  const [requestDates, setRequestDates] = useState({ start: "", end: "", message: "" });
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = JSON.parse(localStorage.getItem("user"));
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const checkOwnershipAndRequests = async () => {
      if (userId && selectedProduct) {
        const ownerCheck = userId._id === selectedProduct.userId._id;
        setIsOwner(ownerCheck);

        if (!ownerCheck) {
          try {
            const response = await fetch(
              `${baseUrl}/api/rental-requests/check?productId=${selectedProduct._id}&requesterId=${userId._id}`
            );
            const data = await response.json();
            if (data.exists) {
              setExistingRequest(data.request);
              setRequestSubmitted(true);
              setRequestDates({
                start: new Date(data.request.startDate).toISOString().split("T")[0],
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

  useEffect(() => {
    calculatePrice();
  }, [requestDates.start, requestDates.end]);

  const handleRequest = async () => {
    if (!userId) return alert("Please login to send request");
    if (isOwner) return;

    try {
      setIsSubmitting(true);
      let response;

      if (existingRequest) {
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
      if (!response.ok) throw new Error(data.message || "Error processing request");

      setRequestSubmitted(true);
      setExistingRequest(data.request);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
  

  return {
    requestDates,
    setRequestDates,
    totalPrice,
    error,
    isSubmitting,
    isOwner,
    existingRequest,
    requestSubmitted,
    setRequestSubmitted,
    handleRequest,
    handleDelete
  };
};

export default useRentalRequest;