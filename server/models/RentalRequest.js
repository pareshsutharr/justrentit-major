const mongoose = require('mongoose');

const RentalRequestSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'RentProduct', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: [
      'pending', 'approved', 'in_transit', 
      'delivered', 'in_use', 'return_in_transit',
      'returned', 'completed',  'rejected' 
    ],
    default: 'pending'
  },
  message: String,
  deliveryOTP: String,
  returnOTP: String,
  deliveryConfirmedAt: Date,
  returnConfirmedAt: Date,
  currentStatus: [{
    stage: String,
    timestamp: Date,
    description: String
  }]
}, { timestamps: true });

// Static methods
RentalRequestSchema.statics.getStatusDescription = function(status) {
  const descriptions = {
    pending: 'Request pending review',
    approved: 'Rental approved by owner',
    rejected: 'Request rejected by owner',
    in_transit: 'Product shipped for delivery',
    delivered: 'Product delivered to renter',
    in_use: 'Product currently in use',
    return_in_transit: 'Product shipped for return',
    returned: 'Product returned to owner',
    completed: 'Rental process completed'
  };
  return descriptions[status] || 'Status update';
};

module.exports = mongoose.model('RentalRequest', RentalRequestSchema);