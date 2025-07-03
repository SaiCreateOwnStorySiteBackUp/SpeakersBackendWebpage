const express = require('express');
const router = express.Router();
const multer = require('multer');
const splUploadModel = require('../models/splUpload');
const path = require('path');
const fs = require('fs');

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// ✅ GET /splStory/fetch?email=...
router.get('/fetch', async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const stories = await splUploadModel.find(query).sort({ createdAt: -1 });
    return res.status(200).json(stories);
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ message: 'Failed to fetch stories' });
  }
});

// ✅ GET by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await splUploadModel.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (err) {
    console.error("Fetch by ID error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST /splStory/upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const {
      email,
      title,
      description = '',
      state,
      locality,
      youtubeLink = '',
      imageUrl = ''
    } = req.body;

    const imageFile = req.file;

    if (!email || !title || !state || !locality) {
      return res.status(400).json({ success: false, message: 'Missing required fields (email, title, state, locality)' });
    }

    const hasImage = imageFile || imageUrl;
    const hasYouTube = youtubeLink && youtubeLink.trim() !== '';

    if (!hasImage && !hasYouTube) {
      return res.status(400).json({ success: false, message: 'Provide either an image or YouTube link' });
    }

    if (hasImage && hasYouTube) {
      return res.status(400).json({ success: false, message: 'Only one allowed: image or YouTube link' });
    }

    // ✅ Check for duplicate YouTube link or image URL
    const existingMedia = await splUploadModel.findOne({
      $or: [
        hasYouTube ? { youtubeLink: youtubeLink.trim() } : null,
        hasImage ? { imageUrl: imageFile ? `/uploads/${imageFile.filename}` : imageUrl } : null
      ].filter(Boolean)
    });

    if (existingMedia) {
      return res.status(409).json({
        success: false,
        message: '🚫 This image or YouTube link has already been posted.'
      });
    }

    // ✅ Check for duplicate title
    // const titleExists = await splUploadModel.findOne({
    //   title: { $regex: new RegExp(`^${title.trim()}$`, 'i') }
    // });
    //
    // if (titleExists) {
    //   return res.status(409).json({
    //     success: false,
    //     message: '🚫 Please change title, already used in old stories.'
    //   });
    // }
    // ✅ Check for duplicate title by same user
    // Backend: check duplicate title
    const escapedTitle = req.body.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleExists = await splUploadModel.findOne({
      email: req.body.email,
      title: { $regex: new RegExp("^" + escapedTitle + "$", "i") }
    });

    if (titleExists) {
      return res.status(400).json({
        success: false,
        message: "Already Title name is used in previous stories, Please update new title name."
      });
    }

    const finalImageUrl = imageFile
      ? `/uploads/${imageFile.filename}`
      : imageUrl || null;

    const story = new splUploadModel({
      email,
      title,
      description,
      state,
      locality,
      youtubeLink: hasYouTube ? youtubeLink.trim() : null,
      imageUrl: hasImage ? finalImageUrl : null,
      createdAt: new Date()
    });

    await story.save();
    return res.status(200).json({ success: true, message: '✅ Story uploaded', data: story });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// ✅ DELETE /splStory/:id
router.delete('/:id', async (req, res) => {
  try {
    const storyId = req.params.id;
    const deleted = await splUploadModel.findByIdAndDelete(storyId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    return res.status(200).json({ success: true, message: 'Story deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
