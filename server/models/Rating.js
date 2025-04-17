const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ratedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'RentProduct' },
  rentalRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalRequest', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  type: { type: String, enum: ['user', 'product'], required: true }
}, { timestamps: true });

RatingSchema.pre('validate', function(next) {
  if (this.type === 'user' && !this.ratedUser) {
    next(new Error('ratedUser required for user ratings'));
  } else if (this.type === 'product' && !this.ratedProduct) {
    next(new Error('ratedProduct required for product ratings'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Rating', RatingSchema);