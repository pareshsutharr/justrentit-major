const { verifyAdmin, verifyToken, adminCheck } = require("../middleware/auth");
const RentalRequest = require("../models/RentalRequest");
const express = require('express');
const router = express.Router();
// Rental Routes
router.get('/admin/rentals',adminCheck, verifyToken, async (req, res) => {
    try {
      const { status, search, sort } = req.query;
      
      const query = {};
      if (status && status !== 'all') query.status = status;
      
      if (search) {
        query.$or = [
          { 'product.name': { $regex: search, $options: 'i' } },
          { 'requester.name': { $regex: search, $options: 'i' } },
          { 'owner.name': { $regex: search, $options: 'i' } }
        ];
      }
  
      const sortOptions = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
  
      const requests = await RentalRequest.find(query)
        .populate('product', 'name rentalPrice')
        .populate('requester', 'name')
        .populate('owner', 'name')
        .sort(sortOptions);
  
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.put('/admin/rentals/:id/status',adminCheck, verifyToken, async (req, res) => {
    try {
      const { status, message } = req.body;
      const request = await RentalRequest.findById(req.params.id);
  
      if (!request) return res.status(404).json({ message: 'Request not found' });
  
      request.status = status;
      request.currentStatus.push({
        stage: status,
        timestamp: new Date(),
        description: message
      });
  
      await request.save();
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;
