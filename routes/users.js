const express = require('express');
const router = express.Router();
const User = require('../models/user'); // ✅ Ensure lowercase if file is named 'user.js'

// GET: Fetch user by email
router.get('/email/:email', async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email parameter is required' });
    }

    const user = await User.findOne({ email }).select('-password -__v'); // ✅ Exclude sensitive data

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
      // res.status(200).json(user);
res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, error: 'Server error fetching user' });
  }
});

// In routes/users.js
router.get('/speakers', async (req, res) => {
  try {
    const speakers = await User.find({ role: { $in: ['speaker', 'both'] } });
    res.json(speakers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching speakers' });
  }
});


module.exports = router; // ✅ Important: must export router

// ********************old 21-May-2025****************************
// Existing route (keep if you need it elsewhere)
// router.get('/email/:email', async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.params.email });
//     if (!user) return res.status(404).json({ error: 'User not found' });
//     res.json(user); // NOTE: returns full user object — use with caution
//   } catch (err) {
//     res.status(500).json({ error: 'Server error fetching user.' });
//   }
// });

// ********************New 21-May-2025****************************

// ✅ New safer route for speakerEditButton.html
// router.get('/me', async (req, res) => {
//   const { email } = req.query;
//   if (!email) return res.status(400).json({ error: 'Email query is required' });
//
//   try {
//     const user = await User.findOne({ email: email });
//     if (!user) return res.status(404).json({ error: 'User not found' });
//
//     // Return only necessary fields
//     res.json({ name: user.name });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });
//
// module.exports = router;
