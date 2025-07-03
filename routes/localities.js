// // File: routes/localities.js
// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const State = require('../models/state'); // Use central model
//
// // ✅ GET localities for a specific state
// router.get('/:state', async (req, res) => {
//   try {
//     const stateDoc = await State.findOne({ state: req.params.state });
//     if (!stateDoc) {
//       return res.json({ success: true, localities: [] });
//     }
//     res.json({ success: true, localities: stateDoc.localities });
//   } catch (err) {
//     console.error('Error fetching localities:', err);
//     res.status(500).json({ success: false, message: 'Failed to fetch localities' });
//   }
// });
// // GET localities for a state
// router.get('/localities', async (req, res) => {
//   try {
//     const { state } = req.query;
//     const localities = await Locality.find({ state }).sort({ name: 1 });
//     res.status(200).json(localities);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch localities' });
//   }
// });
//
// // ✅ POST new locality under a state
// router.post('/add', async (req, res) => {
//   const { state, locality } = req.body;
//
//   if (!state || !locality) {
//     return res.status(400).json({ success: false, message: 'State and locality are required.' });
//   }
//
//   try {
//     let stateDoc = await State.findOne({ state });
//
//     if (!stateDoc) {
//       // Create new state with the locality
//       stateDoc = new State({ state, localities: [locality] });
//     } else {
//       // Add locality only if it's not already present
//       if (stateDoc.localities.includes(locality)) {
//         return res.status(400).json({ success: false, message: 'Locality already exists in this state.' });
//       }
//       stateDoc.localities.push(locality);
//     }
//
//     await stateDoc.save();
//     res.json({ success: true, message: '✅ Locality added successfully!' });
//   } catch (err) {
//     console.error('Error adding locality:', err);
//     res.status(500).json({ success: false, message: 'Failed to add locality.' });
//   }
// });
//
// // PUT /localities/update
// router.put('/update', async (req, res) => {
//   const { state, oldLocality, newLocality } = req.body;
//   if (!state || !oldLocality || !newLocality) {
//     return res.status(400).json({ success: false, message: "All fields are required." });
//   }
//
//   const localityRecord = await Locality.findOne({ state });
//   if (!localityRecord) {
//     return res.status(404).json({ success: false, message: "State not found." });
//   }
//
//   const index = localityRecord.localities.indexOf(oldLocality);
//   if (index === -1) {
//     return res.status(404).json({ success: false, message: "Old locality not found." });
//   }
//
//   // Check for duplicates
//   if (localityRecord.localities.includes(newLocality)) {
//     return res.status(400).json({ success: false, message: "Locality already exists." });
//   }
//
//   localityRecord.localities[index] = newLocality;
//   await localityRecord.save();
//
//   res.json({ success: true, message: "Locality updated." });
// });
//
// // DELETE /localities/delete
// router.delete('/delete', async (req, res) => {
//   const { state, locality } = req.body;
//   const record = await Locality.findOne({ state });
//   if (!record) return res.status(404).json({ success: false, message: "State not found." });
//
//   record.localities = record.localities.filter(l => l !== locality);
//   await record.save();
//
//   res.json({ success: true, message: "Locality deleted successfully." });
// });
//
//
// module.exports = router;
// File: routes/localities.js
const express = require('express');
const router = express.Router();
const State = require('../models/state'); // ✅ Use central model

// ✅ GET localities for a specific state
router.get('/:state', async (req, res) => {
  try {
    const stateDoc = await State.findOne({ state: req.params.state });
    if (!stateDoc) {
      return res.json({ success: true, localities: [] });
    }
    res.json({ success: true, localities: stateDoc.localities });
  } catch (err) {
    console.error('Error fetching localities:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch localities' });
  }
});

// ✅ POST new locality under a state
router.post('/add', async (req, res) => {
  const { state, locality } = req.body;

  if (!state || !locality) {
    return res.status(400).json({ success: false, message: 'State and locality are required.' });
  }

  try {
    let stateDoc = await State.findOne({ state });

    if (!stateDoc) {
      // Create new state with the locality
      stateDoc = new State({ state, localities: [locality] });
    } else {
      // Add locality only if it's not already present
      if (stateDoc.localities.includes(locality)) {
        return res.status(400).json({ success: false, message: 'Locality already exists in this state.' });
      }
      stateDoc.localities.push(locality);
    }

    await stateDoc.save();
    res.json({ success: true, message: '✅ Locality added successfully!' });
  } catch (err) {
    console.error('Error adding locality:', err);
    res.status(500).json({ success: false, message: 'Failed to add locality.' });
  }
});

// ✅ PUT /localities/update
router.put('/update', async (req, res) => {
  const { state, oldLocality, newLocality } = req.body;
  if (!state || !oldLocality || !newLocality) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const stateDoc = await State.findOne({ state });
    if (!stateDoc) {
      return res.status(404).json({ success: false, message: "State not found." });
    }

    const index = stateDoc.localities.indexOf(oldLocality);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Old locality not found." });
    }

    if (stateDoc.localities.includes(newLocality)) {
      return res.status(400).json({ success: false, message: "Locality already exists." });
    }

    stateDoc.localities[index] = newLocality;
    await stateDoc.save();

    res.json({ success: true, message: "✅ Locality updated." });
  } catch (err) {
    console.error("Error updating locality:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ✅ DELETE /localities/delete
router.delete('/delete', async (req, res) => {
  const { state, locality } = req.body;
  if (!state || !locality) {
    return res.status(400).json({ success: false, message: "State and locality are required." });
  }

  try {
    const stateDoc = await State.findOne({ state });
    if (!stateDoc) {
      return res.status(404).json({ success: false, message: "State not found." });
    }

    stateDoc.localities = stateDoc.localities.filter(l => l !== locality);
    await stateDoc.save();

    res.json({ success: true, message: "✅ Locality deleted successfully." });
  } catch (err) {
    console.error("Error deleting locality:", err);
    res.status(500).json({ success: false, message: "Failed to delete locality." });
  }
});

module.exports = router;
