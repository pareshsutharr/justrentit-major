const express = require("express");
const router = express.Router();
const Notification = require("../models/notificationModel"); // Adjust path as needed

// Get notifications for a user
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.query.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
