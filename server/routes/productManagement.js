
const express = require('express');
const router = express.Router();
const { adminCheck, verifyToken } = require('../middleware/auth');
const RentProduct = require('../models/RentProduct');
// Product Management Routes
router.get('/admin/products', adminCheck, verifyToken, async (req, res) => {
    try {
      const { status, featured, searchTerm, page = 1 } = req.query;
      const query = {};
      
      if (status && status !== 'all') query.verified = status === 'approved';
      if (featured && featured !== 'all') query.featured = featured === 'featured';
      if (searchTerm) {
        query.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ];
      }
  
      const products = await RentProduct.find(query)
        .populate('userId', 'name email')
        .populate('category', 'name')
        .skip((page - 1) * 10)
        .limit(10)
        .lean();
  
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.put('/admin/products/:id/verify',  adminCheck, verifyToken, async (req, res) => {
    try {
      const product = await RentProduct.findByIdAndUpdate(
        req.params.id,
        { verified: req.body.status === 'approved' },
        { new: true }
      );
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Verification update failed' });
    }
  });
  
  router.put('/admin/products/:id/feature',  adminCheck, verifyToken, async (req, res) => {
    try {
      const product = await RentProduct.findByIdAndUpdate(
        req.params.id,
        { featured: req.body.featured },
        { new: true }
      );
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Feature update failed' });
    }
  });
  
  router.put('/admin/products/:id',  adminCheck, verifyToken, async (req, res) => {
    try {
      const product = await RentProduct.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Update failed' });
    }
  });
  
  router.delete('/admin/products/:id',  adminCheck, verifyToken, async (req, res) => {
    try {
      await RentProduct.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Deletion failed' });
    }
  });

  module.exports = router;
