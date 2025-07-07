const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: { type: String, index: true },
  /* round every value to 8 dp on the way IN
+      (stored as JavaScript Number ≈ MongoDB double) */
   latitude  : { type:Number, set:v => v == null ? v : +(+v).toFixed(8) },
   longitude : { type:Number, set:v => v == null ? v : +(+v).toFixed(8) },
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
