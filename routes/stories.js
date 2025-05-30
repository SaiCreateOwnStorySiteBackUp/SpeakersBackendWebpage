// const express = require('express');
// const router = express.Router();
// const Story = require('../models/Story');
// const User = require('../models/User');
//
// // GET stories by email (?email=user@example.com)
// router.get('/', async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) return res.status(400).json({ error: 'Missing email parameter' });
//
//     const stories = await Story.find({ email }).sort({ createdAt: -1 });
//     res.json(stories);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error fetching stories.' });
//   }
// });
//
// // GET one story by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//     res.json(story);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error fetching story.' });
//   }
// });
//
// // DELETE story by ID
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Story.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ error: 'Story not found' });
//     res.json({ message: 'Story deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error deleting story.' });
//   }
// });
//
//
// // POST (create story)
// router.post('/', async (req, res) => {
//   try {
//     const { email, title, intro, description, imageUrl } = req.body;
//     if (!email || !title || !description) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }
//     const newStory = new Story({ email, title, intro, description, imageUrl });
//     await newStory.save();
//     res.status(201).json(newStory);
//   } catch (err) {
//     res.status(400).json({ error: 'Error creating story.' });
//   }
// });
//
// // PUT (update story by ID)
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, intro, description, imageUrl } = req.body;
//     const updated = await Story.findByIdAndUpdate(
//       req.params.id,
//       { title, intro, description, imageUrl },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ error: 'Story not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: 'Error updating story.' });
//   }
// });
//
// // Reaction handling
// router.post('/:id/react', async (req, res) => {
//   const { like, dislike } = req.body;
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     if (like) story.likes = (story.likes || 0) + 1;
//     else if (typeof like === 'boolean' && !like && story.likes > 0) story.likes--;
//
//     if (dislike) story.dislikes = (story.dislikes || 0) + 1;
//     else if (typeof dislike === 'boolean' && !dislike && story.dislikes > 0) story.dislikes--;
//
//     await story.save();
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error updating reactions.' });
//   }
// });
//
// // Like/Unlike/Dislike/Undislike individual routes
// router.post('/:id/like', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.likes = (story.likes || 0) + 1;
//     story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error liking story' });
//   }
// });
//
// router.post('/:id/unlike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.likes = Math.max((story.likes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error unliking story' });
//   }
// });
//
// router.post('/:id/dislike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.dislikes = (story.dislikes || 0) + 1;
//     story.likes = Math.max((story.likes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error disliking story' });
//   }
// });
//
// router.post('/:id/undislike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error undisliking story' });
//   }
// });
//
// router.get('/:email', async (req, res) => {
//   const email = req.params.email;
//   try {
//     const stories = await Story.find({ email });
//     res.json(stories);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch stories' });
//   }
// });
//
// // Update a story
// router.put('/:id', async (req, res) => {
//   const { id } = req.params;
//   const updatedStory = req.body;
//   try {
//     await Story.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updatedStory }
//     );
//     res.sendStatus(200);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update story' });
//   }
// });
//
// // Delete a story
// router.delete('/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await Story.deleteOne({ _id: new ObjectId(id) });
//     res.sendStatus(200);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete story' });
//   }
// });
//
// module.exports = router;

// ****************************************Before 23-May-2025******************Implemented new thing below for mongoDB
// const express = require('express');
// const router = express.Router();
// const Story = require('../models/Story');
// // const mongoose = require('mongoose');
//
// // ✅ GET all stories by email (query param)
// router.get('/', async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) return res.status(400).json({ error: 'Missing email parameter' });
//
//     const stories = await Story.find({ email }).sort({ createdAt: -1 });
//     res.json(stories);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error fetching stories.' });
//   }
// });
//
// // ✅ GET one story by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//     res.json(story);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error fetching story.' });
//   }
// });
//
// // ✅ CREATE story
// router.post('/', async (req, res) => {
//   try {
//     const { email, title, intro, description, imageUrl, youtubeLink } = req.body;
//     if (!email || !title || !description) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }
//     const newStory = new Story({ email, title, intro, description, imageUrl, youtubeLink });
//     await newStory.save();
//     res.status(201).json(newStory);
//   } catch (err) {
//     res.status(400).json({ error: 'Error creating story.' });
//   }
// });
//
// // ✅ UPDATE story by ID
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, intro, description, imageUrl, youtubeLink } = req.body;
//     const updated = await Story.findByIdAndUpdate(
//       req.params.id,
//       { title, intro, description, imageUrl, youtubeLink },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ error: 'Story not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: 'Error updating story.' });
//   }
// });
//
// // ✅ DELETE story by ID
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Story.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ error: 'Story not found' });
//     res.json({ message: 'Story deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error deleting story.' });
//   }
// });
//
// // ✅ Reactions (combined like/dislike logic)
// router.post('/:id/react', async (req, res) => {
//   const { like, dislike } = req.body;
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     if (like === true) story.likes = (story.likes || 0) + 1;
//     else if (like === false && story.likes > 0) story.likes--;
//
//     if (dislike === true) story.dislikes = (story.dislikes || 0) + 1;
//     else if (dislike === false && story.dislikes > 0) story.dislikes--;
//
//     await story.save();
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error updating reactions.' });
//   }
// });
//
// // ✅ Individual reaction routes
// router.post('/:id/like', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.likes = (story.likes || 0) + 1;
//     story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error liking story' });
//   }
// });
//
// router.post('/:id/unlike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.likes = Math.max((story.likes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error unliking story' });
//   }
// });
//
// router.post('/:id/dislike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.dislikes = (story.dislikes || 0) + 1;
//     story.likes = Math.max((story.likes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error disliking story' });
//   }
// });
//
// router.post('/:id/undislike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error undisliking story' });
//   }
// });
//
// module.exports = router;

// ************************************Impelmented new type of storage in mongo DB for images and Bold,italicDescriptions
// const express = require('express');
// const router = express.Router();
// const sanitizeHtml = require('sanitize-html');
// const Story = require('../models/Story');
//
// // ✅ GET all stories by email (query param)
// router.get('/', async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) return res.status(400).json({ error: 'Missing email parameter' });
//
//     const stories = await Story.find({ email }).sort({ createdAt: -1 });
//     res.json(stories);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error fetching stories.' });
//   }
// });
//
// // ✅ GET one story by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//     res.json(story);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error fetching story.' });
//   }
// });
//
// // ✅ CREATE story
// router.post('/', async (req, res) => {
//   try {
//     let { email, title, intro, description, imageUrl, youtubeLink } = req.body;
//
//     if (!email || !title || !description) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }
//
//     // Sanitize title and intro to remove HTML tags
//     title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} }).trim();
//     intro = sanitizeHtml(intro, { allowedTags: [], allowedAttributes: {} }).trim();
//
//     // Block base64 image uploads in description
//     if (description.includes('data:image')) {
//       return res.status(400).json({ error: 'Base64 images are not allowed. Please upload and use image URLs.' });
//     }
//
//     const newStory = new Story({
//       email,
//       title,
//       intro,
//       description,
//       imageUrl,
//       youtubeLink
//     });
//
//     await newStory.save();
//     res.status(201).json(newStory);
//   } catch (err) {
//     res.status(400).json({ error: 'Error creating story.' });
//   }
// });
//
// // ✅ UPDATE story by ID
// router.put('/:id', async (req, res) => {
//   try {
//     let { title, intro, description, imageUrl, youtubeLink } = req.body;
//
//     if (!title || !description) {
//       return res.status(400).json({ error: 'Title and description are required.' });
//     }
//
//     // Sanitize
//     title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} }).trim();
//     intro = sanitizeHtml(intro, { allowedTags: [], allowedAttributes: {} }).trim();
//
//     if (description.includes('data:image')) {
//       return res.status(400).json({ error: 'Base64 images are not allowed. Please upload and use image URLs.' });
//     }
//
//     const updated = await Story.findByIdAndUpdate(
//       req.params.id,
//       { title, intro, description, imageUrl, youtubeLink },
//       { new: true }
//     );
//
//     if (!updated) return res.status(404).json({ error: 'Story not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: 'Error updating story.' });
//   }
// });
//
// // ✅ DELETE story by ID
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Story.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ error: 'Story not found' });
//     res.json({ message: 'Story deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error deleting story.' });
//   }
// });
//
// // ✅ Reactions (combined like/dislike logic)
// router.post('/:id/react', async (req, res) => {
//   const { like, dislike } = req.body;
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     if (like === true) story.likes = (story.likes || 0) + 1;
//     else if (like === false && story.likes > 0) story.likes--;
//
//     if (dislike === true) story.dislikes = (story.dislikes || 0) + 1;
//     else if (dislike === false && story.dislikes > 0) story.dislikes--;
//
//     await story.save();
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error updating reactions.' });
//   }
// });
//
// // ✅ Individual reaction routes
// router.post('/:id/like', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.likes = (story.likes || 0) + 1;
//     story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error liking story' });
//   }
// });
//
// router.post('/:id/unlike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.likes = Math.max((story.likes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error unliking story' });
//   }
// });
//
// router.post('/:id/dislike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.dislikes = (story.dislikes || 0) + 1;
//     story.likes = Math.max((story.likes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error disliking story' });
//   }
// });
//
// router.post('/:id/undislike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error undisliking story' });
//   }
// });
//
// module.exports = router;

// ***********************More Protection Impelemented for data storage in MongoDB images,title,descriptionEditor
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const sharp = require('sharp');
// const xss = require('xss-clean');
// const fs = require('fs');
// const path = require('path');
// const Story = require('../models/Story');
//
// // ✅ Middleware: XSS protection
// // router.use(xss());
// // const xss = require('xss');
// // const sanitizedTitle = xss(req.body.title);
//
// // ✅ Multer setup for image uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
//
// // ✅ Upload and compress image
// router.post('/upload-image', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
//
//     const filename = `story_${Date.now()}.jpg`;
//     const outputPath = path.join(__dirname, '../public/uploads/', filename);
//
//     await sharp(req.file.buffer)
//       .resize({ width: 800 })  // Resize to 800px width
//       .jpeg({ quality: 80 })   // Compress JPEG quality
//       .toFile(outputPath);
//
//     const imageUrl = `/uploads/${filename}`;
//     res.status(200).json({ url: imageUrl });
//   } catch (err) {
//     console.error('Image upload error:', err);
//     res.status(500).json({ error: 'Image processing failed' });
//   }
// });
//
// // ✅ GET all stories by email
// router.get('/', async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) return res.status(400).json({ error: 'Missing email parameter' });
//
//     console.log("Fetching stories for email:", email);
//     const stories = await Story.find({ email }).sort({ createdAt: -1 });
//     res.json(stories);
//   } catch (err) {
//     console.error('Error fetching stories:', err);
//     res.status(500).json({ error: 'Server error fetching stories.' });
//   }
// });
//
// // ✅ GET one story by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//     res.json(story);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error fetching story.' });
//   }
// });
//
// // ✅ CREATE a story
// router.post('/', async (req, res) => {
//   try {
//     const { email, title, intro, description, imageUrl, youtubeLink } = req.body;
//     if (!email || !title || !description) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }
//     const newStory = new Story({ email, title, intro, description, imageUrl, youtubeLink });
//     await newStory.save();
//     res.status(201).json(newStory);
//   } catch (err) {
//     res.status(400).json({ error: 'Error creating story.' });
//   }
// });
//
// // ✅ UPDATE a story by ID
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, intro, description, imageUrl, youtubeLink } = req.body;
//     const updated = await Story.findByIdAndUpdate(
//       req.params.id,
//       { title, intro, description, imageUrl, youtubeLink },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ error: 'Story not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: 'Error updating story.' });
//   }
// });
//
// // ✅ DELETE a story by ID
// router.delete('/:id', async (req, res) => {
//   try {
//     const deleted = await Story.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ error: 'Story not found' });
//     res.json({ message: 'Story deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error deleting story.' });
//   }
// });
//
// // ✅ Combined reactions (like/dislike)
// router.post('/:id/react', async (req, res) => {
//   const { like, dislike } = req.body;
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     if (like === true) story.likes = (story.likes || 0) + 1;
//     else if (like === false && story.likes > 0) story.likes--;
//
//     if (dislike === true) story.dislikes = (story.dislikes || 0) + 1;
//     else if (dislike === false && story.dislikes > 0) story.dislikes--;
//
//     await story.save();
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error updating reactions.' });
//   }
// });
//
// // ✅ Individual reactions
// router.post('/:id/like', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.likes = (story.likes || 0) + 1;
//     story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error liking story' });
//   }
// });
//
// router.post('/:id/unlike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.likes = Math.max((story.likes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error unliking story' });
//   }
// });
//
// router.post('/:id/dislike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.dislikes = (story.dislikes || 0) + 1;
//     story.likes = Math.max((story.likes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error disliking story' });
//   }
// });
//
// router.post('/:id/undislike', async (req, res) => {
//   try {
//     const story = await Story.findById(req.params.id);
//     if (!story) return res.status(404).json({ error: 'Story not found' });
//
//     story.dislikes = Math.max((story.dislikes || 0) - 1, 0);
//     await story.save();
//
//     res.json({ likes: story.likes, dislikes: story.dislikes });
//   } catch (err) {
//     res.status(500).json({ error: 'Error undisliking story' });
//   }
// });
//
// module.exports = router;

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
    if (!email) return res.status(400).json({ error: 'Missing email parameter' });

    console.log("Fetching stories for email:", email);
    const stories = await Story.find({ email }).sort({ createdAt: -1 });
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
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'Invalid story ID.' });
//     }
//
//     const story = await Story.findById(id);
//     if (!story) {
//       return res.status(404).json({ error: 'Story not found' });
//     }
//
//     res.json(story);
//   } catch (err) {
//     console.error('Error fetching story by ID:', err);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// });

// ✅ CREATE a story
router.post('/', async (req, res) => {
  try {
    const { email, title, intro, description, imageUrl, youtubeLink } = req.body;
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
      youtubeLink: cleanYoutubeLink
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

// ✅ UPDATE a story by ID
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, intro, description, imageUrl, youtubeLink } = req.body;
//
//     // ✅ Sanitize inputs
//     const cleanTitle = striptags(xss(title));
//     const cleanIntro = striptags(xss(intro));
//     const cleanDescription = striptags(xss(description));
//     const cleanYoutubeLink = youtubeLink ? xss(youtubeLink) : null;
//
//     const updated = await Story.findByIdAndUpdate(
//       req.params.id,
//       {
//         title: cleanTitle,
//         intro: cleanIntro,
//         description: cleanDescription,
//         imageUrl,
//         youtubeLink: cleanYoutubeLink
//       },
//       { new: true }
//     );
//
//     if (!updated) return res.status(404).json({ error: 'Story not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: 'Error updating story.' });
//   }
// });
