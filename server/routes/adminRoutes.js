// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, adminCheck } = require('../middleware/auth');
const User = require('../models/Users');

// Get all users (with pagination, search, and sorting)
router.get('/', verifyToken, adminCheck, async (req, res) => {
  try {
    const { search, sort, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    const sortOptions = {};
    if (sort) {
      sortOptions[sort] = 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .select('-password -googleId'); // Exclude sensitive fields

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNumber);

    res.json({
      users,
      totalPages,
      currentPage: pageNumber
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.patch('/:userId/role', verifyToken, adminCheck, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['User', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password -googleId');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:userId', verifyToken, adminCheck, async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;