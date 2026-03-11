const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const RentProduct = require("../models/RentProduct");
const Category = require("../models/Category");

// Multer setup for product images
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

// --- Public Product Routes ---

// Search route for products and categories
router.get("/products/search", async (req, res) => {
  try {
    const query = req.query.query || "";
    const categories = await Category.find({
      name: { $regex: query, $options: "i" },
    });

    const products = await RentProduct.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $in: categories.map((c) => c._id) } },
      ],
    }).populate("category");

    res.json({
      success: true,
      products: products,
      categories: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await RentProduct.find().populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Authenticated Product Routes ---

router.post("/rentproduct/add", verifyToken, upload.array("images", 5), productController.addProduct);
router.get("/my-products", verifyToken, productController.getMyProducts);
router.put("/update-product/:productId", verifyToken, upload.array("images", 5), productController.updateProduct);

module.exports = router;
