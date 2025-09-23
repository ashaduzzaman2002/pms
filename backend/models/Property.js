const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  location: { type: String, required: true },
  address: String,
  price: { type: Number, required: true },
  bedrooms: Number,
  bathrooms: Number,
  maxGuests: Number,
  amenities: [String],
  images: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviews: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
