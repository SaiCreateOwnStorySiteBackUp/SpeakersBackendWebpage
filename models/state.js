// models/state.js

const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  localities: {
    type: [String],
    default: []
  }
}, {
  timestamps: true // optional: adds createdAt and updatedAt fields
});

module.exports = mongoose.model('State', stateSchema);
