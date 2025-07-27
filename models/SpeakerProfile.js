const mongoose = require("mongoose");

const speakerProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  profileImage: String,
  publicId: String,
  topic: String, // ✅ Add this line
  intro: String,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SpeakerProfile", speakerProfileSchema, "speakersProfile");
