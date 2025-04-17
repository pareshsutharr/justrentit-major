const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  // _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  profilePhoto: { type: String },
  address: { type: String, default: '' },
  currentLocation: { // New field
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  about: { type: String, default: '' },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },
  ratings: { type: Number, default: 0 },
  // ratings: {
  //   totalRatings: { type: Number, default: 0 },
  //   averageRating: { type: Number, default: 0 }
  // },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
