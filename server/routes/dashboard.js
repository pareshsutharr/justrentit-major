// routes/dashboard.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/auth');
const RentProduct = require('../models/RentProduct');
const RentalRequest = require('../models/RentalRequest');
const UserModel = require('../models/Users');

// Add stats endpoint
router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Product Statistics
    const productStats = await RentProduct.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { 
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          availableProducts: { 
            $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] }
          },
          productsForSale: {
            $sum: { $cond: [{ $eq: ["$isForSale", true] }, 1, 0] }
          },
          avgRentalPrice: { $avg: "$rentalPrice" }
        }
      }
    ]);

    // Rental Request Statistics
    const requestStats = await RentalRequest.aggregate([
      { 
        $match: { 
          $or: [
            { owner: mongoose.Types.ObjectId(userId) },
            { requester: mongoose.Types.ObjectId(userId) }
          ]
        } 
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalDuration: {
            $avg: {
              $divide: [
                { $subtract: ["$endDate", "$startDate"] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        }
      }
    ]);

    // Convert request stats to object format
    const formattedRequestStats = requestStats.reduce((acc, curr) => {
      acc[curr._id] = { count: curr.count, avgDuration: curr.totalDuration };
      return acc;
    }, {});

    // Completed Rentals
    const completedRentals = await RentalRequest.countDocuments({
      $or: [
        { owner: userId, status: 'completed' },
        { requester: userId, status: 'completed' }
      ]
    });

    res.json({
      success: true,
      stats: {
        products: productStats[0] || {},
        requests: formattedRequestStats,
        completedRentals
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error });
  }
});

module.exports = router;