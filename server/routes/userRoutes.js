const express = require("express");
const router = express.Router();
const UserModel = require("../models/Users");
const userController = require("../controllers/userController");
const { verifyToken, adminCheck } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Multer setup for profile photo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Profile Routes
router.get("/profile", userController.getUserProfile);
router.post("/profile/update", upload.single("profilePhoto"), userController.updateProfile);
router.delete("/account", verifyToken, userController.deleteAccount);

// Admin Routes
router.get("/", verifyToken, adminCheck, async (req, res) => {
  try {
    const users = await UserModel.find({}, "-password -googleId");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

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

router.delete("/:id", verifyToken, adminCheck, async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
});

module.exports = router;
