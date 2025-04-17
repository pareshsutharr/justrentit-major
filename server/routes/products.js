// server.js or routes/products.js
const express = require('express');
const router = express.Router();
const RentProduct = require('../models/RentProduct'); // RentProduct model
const Category = require('../models/Category');     // Category model

// Search route for products and categories
router.get('/api/products/search', async (req, res) => {
  try {
    const query = req.query.query || '';

    // Search for categories matching the query
    const categories = await Category.find({
      name: { $regex: query, $options: 'i' }, // Case-insensitive search
    });

    // Search for products matching the query in name or category name
    const products = await RentProduct.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $in: categories.map(c => c._id) } },
      ]
    }).populate('category');

    res.json({
      success: true,
      products: products,
      categories: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
