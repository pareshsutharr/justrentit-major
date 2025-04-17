const jwt = require('jsonwebtoken');
const User = require('../models/Users'); // Correctly imported as User
const { default: mongoose } = require('mongoose');
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    const message = error.name === 'TokenExpiredError' 
      ? 'Session expired. Please log in again.'
      : 'Invalid authentication token';
    res.status(401).json({ message });
  }
};

// Unified authentication middleware
exports.authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    a
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
exports.authenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user to the request
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};


exports.adminCheck = (req, res, next) => {
  // if (req.user?.role?.toLowerCase() !== 'admin') { // Case-insensitive check // i change to user for just try // admin
  //   return res.status(403).json({ message: 'Admin access required main' });
  // }
  if (req.user?.role == true) { // Case-insensitive check // i change to user for just try // admin
    return res.status(403).json({ message: 'Admin access required main' });
  }
  next();
};

exports.checkGoogleAuth = (req, res, next) => {
  if (req.user?.googleId) return next();
  res.status(403).json({ message: 'Google authentication required' });
};
// In your auth middleware
exports.verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'Admin') { // Match the enum exactly
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};