const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const RentalRequest = require('../models/RentalRequest');
const RentProduct = require('../models/RentProduct');
const User = require('../models/Users');
const { verifyToken } = require('../middleware/auth');

// Check pending ratings
router.get('/check/:requestId', verifyToken, async (req, res) => {
  try {
    const request = await RentalRequest.findById(req.params.requestId)
      .populate('product owner requester');

    if (!request) {
      return res.status(404).json({ error: "Rental request not found" });
    }

    const currentUserId = req.user._id.toString();
    const ownerId = request.owner?._id?.toString();
    const requesterId = request.requester?._id?.toString();
    if (currentUserId !== ownerId && currentUserId !== requesterId) {
      return res.status(403).json({ error: "Not authorized to rate this request" });
    }

    const results = {
      owner: !await Rating.exists({
        rentalRequest: request._id,
        rater: req.user._id,
        type: 'user',
        ratedUser: request.owner?._id
      }),
      product: !await Rating.exists({
        rentalRequest: request._id,
        rater: req.user._id,
        type: 'product',
        ratedProduct: request.product?._id
      }),
      renter: !await Rating.exists({
        rentalRequest: request._id,
        rater: req.user._id,
        type: 'user',
        ratedUser: request.requester?._id
      })
    };

    // Do not allow users to rate themselves.
    if (currentUserId === ownerId) {
      results.owner = false;
    }
    if (currentUserId === requesterId) {
      results.renter = false;
    }

    res.json(results);
  } catch (err) {
    console.error("Error in /check/:requestId:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit rating
router.post('/', verifyToken, async (req, res) => {
  try {
    const { rentalRequest, type, ratedUser, ratedProduct, rating, comment } = req.body;
    const request = await RentalRequest.findById(rentalRequest);
    if (!request) {
      return res.status(404).json({ error: "Rental request not found" });
    }

    if (request.status !== "completed") {
      return res.status(400).json({ error: "Ratings are allowed only after completion" });
    }

    const raterId = req.user._id.toString();
    const ownerId = request.owner.toString();
    const requesterId = request.requester.toString();
    if (raterId !== ownerId && raterId !== requesterId) {
      return res.status(403).json({ error: "Not authorized to submit rating for this request" });
    }

    if (type === "user" && ratedUser && raterId === ratedUser.toString()) {
      return res.status(400).json({ error: "You cannot rate yourself" });
    }

    const duplicate = await Rating.findOne({
      rentalRequest,
      rater: req.user._id,
      type,
      ...(type === "product" ? { ratedProduct } : { ratedUser }),
    });
    if (duplicate) {
      return res.status(409).json({ error: "Rating already submitted" });
    }

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

// Get product ratings
router.get('/product/:productId', async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedProduct: req.params.productId, type: 'product' })
      .populate('rater', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user ratings
router.get('/user/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUser: req.params.userId, type: 'user' })
      .populate('rater', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
