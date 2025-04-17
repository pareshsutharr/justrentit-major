// routes/userManagementRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, adminCheck } = require('../middleware/auth');
const User = require('../models/Users');

// Get all users (with search)
router.get('/admin/users', verifyToken, adminCheck, async (req, res) => {

  try {
    const search = req.query.search || '';
    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    };

    const users = await User.find(query).select('-password -googleId');
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update user role
router.put('/admin/users/:id/role', verifyToken, adminCheck, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password -googleId');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete user
router.delete('/admin/users/:id', verifyToken, adminCheck, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Add to routes/userManagementRoutes.js
router.put('/admin/users/:id/verify', verifyToken, adminCheck, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.verified },
      { new: true }
    ).select('-password -googleId');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Add to routes/userManagementRoutes.js
router.post('/admin/users/bulk-verify', verifyToken, adminCheck, async (req, res) => {
  try {
    const { userIds, verified } = req.body;
    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { isVerified: verified } }
    );
    res.json({ message: `${userIds.length} users updated` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;