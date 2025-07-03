// ***************************Correct one xss-clean is not working above method*****************
const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const xss = require('xss'); // Only using xss, not xss-clean
const striptags = require('striptags');
const fs = require('fs');
const path = require('path');
const Story = require('../models/story');
const mongoose = require('mongoose');

// ✅ Multer setup for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload and compress image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const filename = `story_${Date.now()}.jpg`;
    const outputPath = path.join(__dirname, '../public/uploads/', filename);

    await sharp(req.file.buffer)
      .resize({ width: 800 })  // Resize to 800px width
      .jpeg({ quality: 80 })   // Compress JPEG quality
      .toFile(outputPath);

    const imageUrl = `/uploads/${filename}`;
    res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Image processing failed' });
  }
});

router.get('/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid story ID.");
    }

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).send("Story not found.");
    }

    res.json(story);
  } catch (err) {
    console.error("Error fetching story by ID:", err);
    res.status(500).send("Internal server error.");
  }
});


// ✅ GET all stories by email
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    // if (!email) return res.status(400).json({ error: 'Missing email parameter' });
    //
    // console.log("Fetching stories for email:", email);
    // const stories = await Story.find({ email }).sort({ createdAt: -1 });
    const query = email ? { email }            // speaker dashboard: all stories
                       : { status: "published" }; // public site: live only

   const stories = await Story.find(query).sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: 'Server error fetching stories.' });
  }
});

// ✅ GET one story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching story.' });
  }
});

// ✅ CREATE a story
router.post('/', async (req, res) => {
  try {
    // const { email, title, intro, description, imageUrl, youtubeLink , status = "published" } = req.body;
    const {
     email,
     title,
     intro = "",
     description = "",
     imageUrl = "",
     youtubeLink = "",
     status = "published"          // default if flag not sent
   } = req.body;

    if (!email || !title || !description) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Strip all HTML tags, store plain text
    const cleanTitle = striptags(xss(title));
    const cleanIntro = striptags(xss(intro));
    const cleanDescription = striptags(xss(description));
    const cleanYoutubeLink = youtubeLink ? xss(youtubeLink) : null;

    const newStory = new Story({
      email,
      title: cleanTitle,
      intro: cleanIntro,
      description: cleanDescription,
      imageUrl,
      youtubeLink: cleanYoutubeLink,
      status,       // <‑‑ save the flag
      createdAt: new Date()
    });

    await newStory.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(400).json({ error: 'Error creating story.' });
  }
});
// ✅ UPDATE a story by ID
router.put('/upload/updateStory/:id', upload.single('image'), async (req, res) => {
  try {
    const storyId = req.params.id;
    const existingStory = await Story.findById(storyId);
    if (!existingStory) {
      return res.status(404).json({ success: false, message: "Story not found." });
    }

    // Clean input fields (strip HTML tags, sanitize)
    const updatedFields = {};
    if (req.body.title) {
      updatedFields.title = striptags(xss(req.body.title));
    }
    if (req.body.intro) {
      updatedFields.intro = striptags(xss(req.body.intro));
    }
    if (req.body.description) {
      updatedFields.description = striptags(xss(req.body.description));
    }
    if (req.body.youtubeLink) {
      updatedFields.youtubeLink = xss(req.body.youtubeLink);
    }
    if (req.body.status) {          // allow switching draft ↔ live
      updatedFields.status = req.body.status === "draft" ? "draft" : "published";
     }

    // If new image uploaded
    if (req.file) {
      const filename = `story_${Date.now()}.jpg`;
      const outputPath = path.join(__dirname, '../public/uploads/', filename);

      await sharp(req.file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      updatedFields.imageUrl = `/uploads/${filename}`;

      // Optionally delete old image from server if needed
      const oldImagePath = path.join(__dirname, '../public', existingStory.imageUrl || '');
      if (existingStory.imageUrl && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const updatedStory = await Story.findByIdAndUpdate(storyId, updatedFields, { new: true });
    res.json({ success: true, story: updatedStory });
  } catch (err) {
    console.error('Error updating story:', err);
    res.status(500).json({ success: false, message: 'Server error during update.' });
  }
});


// ✅ DELETE a story by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Story.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Story not found' });
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting story.' });
  }
});

// ✅ Combined reactions (like/dislike)
router.post('/:id/react', async (req, res) => {
  const { like, dislike } = req.body;
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (like === true) story.likes = (story.likes || 0) + 1;
    else if (like === false && story.likes > 0) story.likes--;

    if (dislike === true) story.dislikes = (story.dislikes || 0) + 1;
    else if (dislike === false && story.dislikes > 0) story.dislikes--;

    await story.save();
    res.json({ likes: story.likes, dislikes: story.dislikes });
  } catch (err) {
    res.status(500).json({ error: 'Error updating reactions.' });
  }
});

// ✅ Individual reactions
router.post('/:id/like', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.likes = (story.likes || 0) + 1;
    story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
    await story.save();

    res.json({ likes: story.likes, dislikes: story.dislikes });
  } catch (err) {
    res.status(500).json({ error: 'Error liking story' });
  }
});

router.post('/:id/unlike', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.likes = Math.max((story.likes || 0) - 1, 0);
    await story.save();

    res.json({ likes: story.likes, dislikes: story.dislikes });
  } catch (err) {
    res.status(500).json({ error: 'Error unliking story' });
  }
});

router.post('/:id/dislike', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.dislikes = (story.dislikes || 0) + 1;
    story.likes = Math.max((story.likes || 0) - 1, 0);
    await story.save();

    res.json({ likes: story.likes, dislikes: story.dislikes });
  } catch (err) {
    res.status(500).json({ error: 'Error disliking story' });
  }
});

router.post('/:id/undislike', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
    await story.save();

    res.json({ likes: story.likes, dislikes: story.dislikes });
  } catch (err) {
    res.status(500).json({ error: 'Error undisliking story' });
  }
});

module.exports = router;
