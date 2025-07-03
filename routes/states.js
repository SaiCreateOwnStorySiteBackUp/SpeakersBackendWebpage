// routes/states.js
const express = require('express');
const router = express.Router();
const State = require('../models/state');

// ✅ GET all states
router.get('/', async (req, res) => {
  try {
    // const states = await State.find({}, { state: 1, _id: 0 });
    const states = await State.find({}, { state: 1 });  // ✅ _id is included by default
    res.json({ success: true, states });
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch states' });
  }
});
// GET all states
router.get('/states', async (req, res) => {
  try {
    const states = await State.find().sort({ name: 1 });
    res.status(200).json(states);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch states' });
  }
});

// ✅ POST /states/add
router.post('/add', async (req, res) => {
  const { state } = req.body;

  if (!state || !state.trim()) {
    return res.status(400).json({ success: false, message: 'State name is required.' });
  }

  try {
    const exists = await State.findOne({ state: state.trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'State already exists.' });
    }

    const newState = new State({ state: state.trim() });
    await newState.save();

    res.json({ success: true, message: 'State added successfully.' });
  } catch (err) {
    console.error('❌ Error adding state:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
// ✅ PUT /states/update/:id
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { state } = req.body;

  if (!state || !state.trim()) {
    return res.status(400).json({ success: false, message: 'State name is required.' });
  }

  try {
    const existingState = await State.findOne({
      _id: { $ne: id },
      state: { $regex: new RegExp(`^${state.trim()}$`, 'i') } // case-insensitive duplicate check
    });

    if (existingState) {
      return res.status(409).json({ success: false, message: 'State already exists.' });
    }

    const updated = await State.findByIdAndUpdate(id, { state: state.trim() }, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'State not found.' });
    }

    res.json({ success: true, message: 'State updated successfully.', state: updated });
  } catch (err) {
    console.error('Error updating state:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
// ✅ DELETE /states/delete/:id
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await State.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'State not found.' });
    }

    res.json({ success: true, message: 'State deleted successfully.' });
  } catch (err) {
    console.error('Error deleting state:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
