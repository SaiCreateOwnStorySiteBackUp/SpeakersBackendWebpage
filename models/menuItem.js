const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  menuOrder: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("MenuItem", menuItemSchema);
