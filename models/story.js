const mongoose = require('mongoose');
//
// const storySchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   title: { type: String, required: true },
//   intro: { type: String, required: true },
//   description: { type: String, required: true },
//   imageUrl:     { type: String, required: function() {
//                    return this.status === 'published' && !this.youtubeLink;
//                  }},
//   youtubeLink: { type: String },
//   /* ─── NEW FIELD ───────────────────────────────────────────── */
//     status: {
//       type: String,
//       enum: ["draft", "published"],
//       default: "published"
//     },
//     /* ──────────────────────────────────────────────────────────── */
//   likes: { type: Number, default: 0 },
//   dislikes: { type: Number, default: 0 }
// }, { timestamps: true });
//
// module.exports = mongoose.models.Story || mongoose.model('Story', storySchema);

const storySchema = new mongoose.Schema(
  {
    email:       { type: String, required: true },
    title:       { type: String, required: true },
    intro:       { type: String, required: true },
    description: { type: String, required: true },

    // ─────────  media fields are NOT individually required  ─────────
    imageUrl:   { type: String, trim: true },
    youtubeLink:{ type: String, trim: true },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },

    likes:    { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
  },
  { timestamps: true }
);
/* ─── PRE‑VALIDATE HOOK: “exactly one of imageUrl or youtubeLink when published” ─── */
storySchema.pre('validate', function (next) {
  if (this.status === 'draft') return next();    // drafts may omit media

  const hasImage   = !!this.imageUrl;
  const hasYouTube = !!this.youtubeLink;
  const totalMedia = [hasImage, hasYouTube].filter(Boolean).length;

  if (totalMedia === 0) {
    this.invalidate(
      'imageUrl',
      'Either imageUrl or youtubeLink is required for published stories.'
    );
  }
  if (totalMedia > 1) {
    this.invalidate(
      'youtubeLink',
      'Choose only ONE media field (imageUrl OR youtubeLink).'
    );
  }
  next();
});
/* ──────────────────────────────────────────────────────────────────────────────── */
module.exports = mongoose.models.Story || mongoose.model('Story', storySchema);
