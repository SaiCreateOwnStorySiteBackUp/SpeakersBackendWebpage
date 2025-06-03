const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: { type: String, index: true },
  latitude: Number,
  longitude: Number,
  visitCount: { type: Number, default: 0 },
  clicks: {
    type: Map,
    of: Number,
    default: {}
  },
  lastVisited: { type: Date, default: Date.now }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Visitor', visitorSchema);
