const express = require('express');
const RentalRequest = require('../models/RentalRequest');
const RentProduct = require('../models/RentProduct');
const router = express.Router();
const Notification = require("../models/notificationModel");
const Users = require('../models/Users');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Fetch rental requests
router.get("/", async (req, res) => {
  try {
    const { userId, type } = req.query;
    let query = {};

    if (type === "received") {
      query.owner = userId;
    } else if (type === "sent") {
      query.requester = userId;
    }

    const requests = await RentalRequest.find(query)
      .populate("product", "name images rentalPrice description")
      .populate("requester", "name profilePhoto")
      .populate("owner", "name profilePhoto");

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching requests" });
  }
});

// Create Rental Request
router.post("/", async (req, res) => {
  try {
    const { product, requester, startDate, endDate, message } = req.body;
    const productDoc = await RentProduct.findById(product).populate("userId");
    if (!productDoc) return res.status(404).json({ success: false, message: "Product not found" });

    const requesterDoc = await Users.findById(requester);
    if (!requesterDoc) {
      console.error("Requester not found:", requester);
      return res.status(404).json({ success: false, message: "Requester not found" });
    }
  
    const newRequest = new RentalRequest({
      product,
      requester,
      owner: productDoc.userId._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      message,
    });

    await newRequest.save();
     try {
          await Notification.create({
            userId: productDoc.userId._id,
            message: `New request for "${productDoc.name}" from "${requesterDoc.name}""`,
            type: "product_request_send",
            metadata: {
              productId: product,
            }
          });
        } catch (err) {
          console.error("Notification creation error:", err);
        }
    res.json({ success: true, request: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating request", error: error.message });
  }
});

// Check for existing request
router.get("/check", async (req, res) => {
  try {
    const { productId, requesterId } = req.query;
    const request = await RentalRequest.findOne({ product: productId, requester: requesterId, status: "pending" });
    res.json({ exists: !!request, request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking request" });
  }
});

// Update rental request
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const updatedRequest = await RentalRequest.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedRequest) return res.status(404).json({ success: false, message: "Request not found" });

    res.json({ success: true, request: updatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete rental request
router.delete("/:id", async (req, res) => {
  try {
    const deletedRequest = await RentalRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ success: false, message: "Request not found" });
    res.json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update rental request status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, otp } = req.body;
    const request = await RentalRequest.findById(req.params.id).populate('product').populate('requester').populate('owner');
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const validTransitions = {
      pending: ['approved', 'rejected'],
      approved: ['in_transit'],
      in_transit: ['delivered'],
      delivered: ['in_use'],
      in_use: ['return_in_transit'],
      return_in_transit: ['returned'],
      returned: ['completed'],
      rejected: [],
      completed: []
    };

    if (!validTransitions[request.status].includes(status)) {
      return res.status(400).json({ error: `Invalid status transition from ${request.status} to ${status}` });
    }

    if (status === 'in_transit') request.deliveryOTP = generateOTP();
    if (status === 'delivered' && otp !== request.deliveryOTP) return res.status(400).json({ error: 'Invalid delivery OTP' });
    if (status === 'return_in_transit') request.returnOTP = generateOTP();
    if (status === 'returned' && otp !== request.returnOTP) return res.status(400).json({ error: 'Invalid return OTP' });

    if (status === 'approved') await RentProduct.findByIdAndUpdate(request.product._id, { available: false });
    if (status === 'completed') await RentProduct.findByIdAndUpdate(request.product._id, { available: true });

    request.status = status;
    request.currentStatus.push({ stage: status, timestamp: new Date(), description: RentalRequest.getStatusDescription(status) });

    await request.save();
    res.json(request);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm OTP for status update
router.put('/confirm-otp', async (req, res) => {
  try {
    const { requestId, otpType, otp } = req.body;
    const request = await RentalRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (otpType === 'delivery' && request.deliveryOTP === otp) {
      request.status = 'delivered';
      request.deliveryConfirmedAt = new Date();
    } else if (otpType === 'return' && request.returnOTP === otp) {
      request.status = 'returned';
      request.returnConfirmedAt = new Date();
    } else {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
