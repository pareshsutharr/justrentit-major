
const mongoose = require('mongoose');
const Category = require('./Category');  // Import Category model

const RentProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  rentalPrice: { type: Number, required: true },
  securityDeposit: { type: Number, default: 0 },  // Refundable deposit
  rentalDuration: { type: String, enum: ['hour', 'day', 'week', 'month'], required: true }, // Rental duration type
  condition: { type: String, enum: ['new', 'used', 'excellent', 'good', 'fair'], required: true }, // Product condition
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }], 
  images: [{ type: String }], 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  available: { 
    type: Boolean,
    default: true,
    required: true 
  },
  isForSale: { 
    type: Boolean,
    default: false,
    required: true 
  },
  featured: { 
    type: Boolean,
    default: false,
    required: true 
  },
  sellingPrice: {
    type: Number,
    default: 0,
    validate: {
      validator: function(v) {
        return this.isForSale ? v > 0 : true;
      },
      message: 'Selling price must be greater than 0 when product is for sale'
    }
  },
  pendingRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalRequest'
  }],
  location: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    area: { type: String, required: true },
    pincode: { type: String, required: true },
  },

  ratings: {
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  },
 
  verified: { type: Boolean, default: false }, // Admin verification
}, { timestamps: true });  // Adds createdAt & updatedAt automatically

const RentProduct = mongoose.model('RentProduct', RentProductSchema);
module.exports = RentProduct;
