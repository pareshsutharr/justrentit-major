const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const RentalRequest = require('../models/RentalRequest');
const RentProduct = require('../models/RentProduct');
const User = require('../models/Users');

// Check pending ratings
router.get('/check/:requestId', async (req, res) => {
  try {
    console.log("Fetching rental request for ID:", req.params.requestId);
    const request = await RentalRequest.findById(req.params.requestId)
      .populate('product owner requester');

    if (!request) {
      return res.status(404).json({ error: "Rental request not found" });
    }

    console.log("Fetched request:", request);

    const results = {
      owner: !await Rating.exists({
        rentalRequest: request._id,
        rater: req.user?._id, // Ensure req.user exists
        type: 'user',
        ratedUser: request.owner?._id
      }),
      product: !await Rating.exists({
        rentalRequest: request._id,
        rater: req.user?._id,
        type: 'product',
        ratedProduct: request.product?._id
      }),
      renter: !await Rating.exists({
        rentalRequest: request._id,
        rater: req.user?._id,
        type: 'user',
        ratedUser: request.requester?._id
      })
    };

    console.log("Rating check results:", results);
    res.json(results);
  } catch (err) {
    console.error("Error in /check/:requestId:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit rating
router.post('/', async (req, res) => {
  try {
    const { rentalRequest, type, ratedUser, ratedProduct, rating, comment } = req.body;
    
    const newRating = new Rating({
      rater: req.user._id,
      rentalRequest,
      type,
      ratedUser,
      ratedProduct,
      rating,
      comment
    });

    await newRating.save();
    
    // Update relevant ratings
    if (type === 'product') {
      await updateProductRatings(ratedProduct);
    } else {
      await updateUserRatings(ratedUser);
    }

    res.status(201).json(newRating);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

async function updateProductRatings(productId) {
  const stats = await Rating.aggregate([
    { $match: { ratedProduct: productId } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  await RentProduct.findByIdAndUpdate(productId, {
    'ratings.averageRating': stats[0]?.average || 0,
    'ratings.totalRatings': stats[0]?.count || 0
  });
}

async function updateUserRatings(userId) {
  const stats = await Rating.aggregate([
    { $match: { ratedUser: userId } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  await User.findByIdAndUpdate(userId, {
    ratings: stats[0]?.average || 0
  });
}

module.exports = router;