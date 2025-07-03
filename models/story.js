const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  email: { type: String, required: true },
  title: { type: String, required: true },
  intro: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl:     { type: String, required: function() {
                   return this.status === 'published' && !this.youtubeLink;
                 }},
  youtubeLink: { type: String },
  /* ─── NEW FIELD ───────────────────────────────────────────── */
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published"
    },
    /* ──────────────────────────────────────────────────────────── */
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Story || mongoose.model('Story', storySchema);
