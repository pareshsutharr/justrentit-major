const express = require("express");
const router = express.Router();
const UserModel = require("../models/Users");
const { verifyToken, adminCheck } = require("../middleware/auth");

// Get all users (Admin only)
router.get("/", verifyToken, adminCheck, async (req, res) => {
  try {
    const users = await UserModel.find({}, "-password -googleId");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// Update user role (Admin only)
router.put("/:id", verifyToken, adminCheck, async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
      ).select("-password -googleId");
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user" });
  }
});

// Delete user (Admin only)
router.delete("/:id", verifyToken, adminCheck, async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

module.exports = router;
