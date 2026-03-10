const express = require("express");
const router = express.Router();
const RentalRequest = require("../models/RentalRequest");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const invoices = await RentalRequest.find({
      $or: [{ requester: userId }, { owner: userId }],
      invoiceNumber: { $ne: null },
      "payment.status": "paid",
    })
      .populate("product", "name rentalPrice securityDeposit rentalDuration images")
      .populate("requester", "name email")
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, invoices });
  } catch (error) {
    console.error("Invoice fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to load invoices" });
  }
});

module.exports = router;
