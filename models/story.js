const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  email: { type: String, required: true },
  title: { type: String, required: true },
  intro: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  youtubeLink: { type: String },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Story || mongoose.model('Story', storySchema);



// const mongoose = require('mongoose');
//
// const storySchema = new mongoose.Schema(
//   {
//     // Speaker's email (used to group stories)
//     email: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true
//     },
//
//     // Story title
//     title: {
//       type: String,
//       required: true,
//       trim: true
//     },
//
//     // Short intro or summary
//     intro: {
//       type: String,
//       required: true,
//       trim: true
//     },
//
//     // Full description or story content
//     description: {
//       type: String,
//       required: true
//     },
//
//     // Image URL associated with the story
//     imageUrl: {
//       type: String,
//       required: true
//     },
//
//     // Optional YouTube video link (if any)
//     youtubeLink: {
//       type: String,
//       default: ''
//     },
//
//     // Like count (anonymous, persistent per story)
//     likes: {
//       type: Number,
//       default: 0
//     },
//
//     // Dislike count
//     dislikes: {
//       type: Number,
//       default: 0
//     }
//   },
//   {
//     timestamps: true // Automatically adds createdAt and updatedAt fields
//   }
// );
//
// // Prevent model overwrite during dev with hot-reload
// module.exports = mongoose.models.Story || mongoose.model('Story', storySchema);
