const mongoose = require("mongoose");

const splSpeakerProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  profileImage: String,
  publicId: String,
  topic: String,
  intro: String,
  updatedAt: { type: Date, default: Date.now }
});

module.exports =
  mongoose.models.SplSpeakerProfile ||
  mongoose.model("SplSpeakerProfile", splSpeakerProfileSchema, "splSpeakersProfile");
