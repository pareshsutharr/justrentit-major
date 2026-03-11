const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.get("/stats", verifyToken, verifyAdmin, adminController.getAdminStats);
router.get("/analytics/users", verifyToken, verifyAdmin, adminController.getUserAnalytics);
router.get("/analytics/products", verifyToken, verifyAdmin, adminController.getProductAnalytics);
router.get("/analytics/rentals", verifyToken, verifyAdmin, adminController.getRentalAnalytics);
router.get("/generate-report", verifyToken, verifyAdmin, adminController.generateReport);

module.exports = router;
