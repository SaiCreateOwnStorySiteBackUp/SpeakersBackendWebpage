// const mongoose = require('mongoose');
//
// const splUploadSchema = new mongoose.Schema({
//   email: String,
//   title: String,
//   description: String,
//   youtubeLink: String,
//   imageUrl: String,
//   state: String,
//   locality: String,
//   createdAt: { type: Date, default: Date.now }
// });
//
// module.exports = mongoose.model('splUpload', splUploadSchema);
const mongoose = require('mongoose');

const splUploadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  youtubeLink: {
    type: String,
    default: null,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  locality: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('splUpload', splUploadSchema);
