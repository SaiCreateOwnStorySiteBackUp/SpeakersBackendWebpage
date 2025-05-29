// // models/User.js
// const mongoose = require('mongoose');
//
// const userSchema = new mongoose.Schema({
//   name: { type: String },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   role: { type: String, default: 'speaker' },
//   allowedPage: { type: String }  // Needed for routing permissions
// }, { timestamps: true });
//
// module.exports = mongoose.models.User || mongoose.model('User', userSchema);

// const mongoose = require("mongoose");
//
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   country: { type: String, required: true },
//   mobile: { type: String, required: true },
//   gender: { type: String, required: true },
//   role: { type: String, required: true }, // e.g., 'Speaker', 'Admin', or 'Both'
//   password: { type: String, required: true },
//   isEnabled: { type: Boolean, default: true }, // Used for enable/disable login
// });
//
// module.exports = mongoose.model("User", userSchema);

// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['speaker', 'admin', 'both'],
    default: 'speaker'
  },

  country: { type: String, required: true },

  mobile: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[0-9]{10,15}$/.test(v);  // supports +91 and similar
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  // createdAt: {
  //   type: Date,
  //   default: Date.now  // This ensures the date is automatically set if not provided
  // },

  allowedPage: { type: Boolean, default: true }, // For speaker-specific page routing

  isEnabled: { type: Boolean, default: true } // For enable/disable login access

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
