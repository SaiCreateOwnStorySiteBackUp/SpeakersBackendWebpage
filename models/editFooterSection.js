const mongoose = require("mongoose");

const footerItemSchema = new mongoose.Schema({
  type: String,            // e.g., youtube, facebook, whatsapp, etc.
  value: String,           // e.g., URL or email
  enabled: Boolean         // true or false
});

module.exports = mongoose.model("editFooterSection", footerItemSchema);
