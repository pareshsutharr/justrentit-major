// routes/dashboard.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/auth');
const RentProduct = require('../models/RentProduct');
const RentalRequest = require('../models/RentalRequest');
const UserModel = require('../models/Users');

const buildDashboardStats = async (userId) => {
  const normalizedUserId = new mongoose.Types.ObjectId(userId);

  const productStats = await RentProduct.aggregate([
    { $match: { userId: normalizedUserId } },
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

  const requestStats = await RentalRequest.aggregate([
    {
      $match: {
        $or: [
          { owner: normalizedUserId },
          { requester: normalizedUserId }
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
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);

  const formattedRequestStats = requestStats.reduce((acc, curr) => {
    acc[curr._id] = { count: curr.count, avgDuration: curr.totalDuration };
    return acc;
  }, {});

  const completedRentals = await RentalRequest.countDocuments({
    $or: [
      { owner: userId, status: 'completed' },
      { requester: userId, status: 'completed' }
    ]
  });

  const pendingRequests = await RentalRequest.countDocuments({
    owner: userId,
    status: 'pending'
  });

  const rentedProducts = await RentalRequest.countDocuments({
    owner: userId,
    status: { $in: ['approved', 'in_transit', 'delivered', 'in_use'] }
  });

  const earningsResult = await RentalRequest.aggregate([
    {
      $match: {
        owner: normalizedUserId,
        status: 'completed',
        'payment.amount': { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$payment.amount" }
      }
    }
  ]);

  const user = await UserModel.findById(userId).select('ratings').lean();

  return {
    totalProducts: productStats[0]?.totalProducts || 0,
    availableProducts: productStats[0]?.availableProducts || 0,
    productsForSale: productStats[0]?.productsForSale || 0,
    avgRentalPrice: productStats[0]?.avgRentalPrice || 0,
    requests: formattedRequestStats,
    completedRentals,
    pendingRequests,
    rentedProducts,
    estimatedEarnings: earningsResult[0]?.total || 0,
    averageRating: Number(user?.ratings || 0),
  };
};

router.get('/dashboard-stats', verifyToken, async (req, res) => {
  try {
    const stats = await buildDashboardStats(req.user._id);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error });
  }
});

router.get('/stats/:userId', async (req, res) => {
  try {
    const stats = await buildDashboardStats(req.params.userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error });
  }
});

module.exports = router;
