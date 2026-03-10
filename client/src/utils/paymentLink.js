import Swal from "sweetalert2";

export const razorpayPaymentLink =
  import.meta.env.VITE_RAZORPAY_PAYMENT_LINK || "https://rzp.io/rzp/OZrKqQ7";

export const openRazorpayPaymentLink = () => {
  if (!razorpayPaymentLink) return;
  window.open(razorpayPaymentLink, "_blank", "noopener,noreferrer");
};

export const collectTestModePayment = async ({ amount, productName }) => {
  if (!razorpayPaymentLink) {
    throw new Error("Razorpay test payment link is not configured");
  }

  window.open(razorpayPaymentLink, "_blank", "noopener,noreferrer");

  const result = await Swal.fire({
    title: "Complete Test Payment",
    text: `A Razorpay test payment page opened for ${productName || "this product"}. Finish the test payment there, then confirm here to continue.`,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Payment Completed",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#00a877",
  });

  if (!result.isConfirmed) {
    throw new Error("Payment was not completed");
  }

  return {
    provider: "razorpay_test_link",
    status: "paid",
    amount: Number(amount || 0),
    currency: "INR",
    paymentId: `testpay_${Date.now()}`,
    orderId: `testorder_${Date.now()}`,
    signature: "test-mode",
    paidAt: new Date().toISOString(),
  };
};
