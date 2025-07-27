const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user'); // ✅ Ensure lowercase if file is named 'user.js'
// const { getCloudinarySignature } = require("../utils/cloudinary"); // if custom signature needed
const cloudinary = require('../utils/cloudinary');
const SpeakerProfile = require("../models/SpeakerProfile");
const SplSpeakerProfile = require("../models/splSpeakerProfile");
const upload = multer();

router.get('/admin/userByEmail', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send("Missing email");

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send("User not found");

  res.json({
    name: user.name,
    profileImage: user.profileImage,
    bio: user.bio
  });
});

router.get('/by-email', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET all speaker summaries for index.html or homepage
// router.get('/allSpeakers', async (req, res) => {
//   try {
//     const users = await User.find({ role: { $in: ['speaker', 'both'] } });
//
//     const speakers = await Promise.all(users.map(async (user) => {
//       const profile = await SpeakerProfile.findOne({ email: user.email });
//       return {
//         name: user.name,
//         email: user.email,
//         topic: profile?.topic || "", // from speakerProfile
//         profileImage: profile?.profileImage || "/images/default.jpg", // fallback
//         slug: user.email.split("@")[0].toLowerCase()
//       };
//     }));
//
//     res.status(200).json(speakers);
//   } catch (err) {
//     console.error("❌ Failed to fetch all speakers:", err);
//     res.status(500).json({ error: "Failed to fetch speakers" });
//   }
// });

router.get('/allSpeakers', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['speaker', 'both'] } }).sort({ name: 1 });

    const speakers = await Promise.all(users.map(async (user) => {
      const profile = await SplSpeakerProfile.findOne({ email: user.email })
              || await SpeakerProfile.findOne({ email: user.email });


      return {
        name: user.name.toLowerCase(),  // Match with HTML page like seshu.html
        email: user.email,
        topic: profile?.topic || "",
        intro: profile?.intro || "",
        profileImage: profile?.profileImage || "/images/default.jpg",
        slug: user.name.toLowerCase()  // Match to HTML filename like seshu.html
      };
    }));

    res.status(200).json(speakers);
  } catch (err) {
    console.error("❌ Failed to fetch all speakers:", err);
    res.status(500).json({ error: "Failed to fetch speakers" });
  }
});


router.get('/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const user = await User.findOne({ name: { $regex: new RegExp(`^${slug}$`, 'i') } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = await SpeakerProfile.findOne({ email: user.email });

    res.json({
      name: user.name,
      email: user.email,
      intro: profile?.intro || "",
      profileImage: profile?.profileImage || "/images/default.jpg",
    });
  } catch (err) {
    console.error("Error fetching user by slug:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// GET: Fetch user by email
// router.get('/email/:email', async (req, res) => {
//   try {
//     const email = req.params.email.trim().toLowerCase();
//
//     if (!email) {
//       return res.status(400).json({ success: false, error: 'Email parameter is required' });
//     }
//
//     const user = await User.findOne({ email }).select('-password -__v'); // ✅ Exclude sensitive data
//
//     if (!user) {
//       return res.status(404).json({ success: false, error: 'User not found' });
//     }
//       // res.status(200).json(user);
// res.status(200).json({ success: true, user });
//   } catch (err) {
//     console.error('Error fetching user:', err);
//     res.status(500).json({ success: false, error: 'Server error fetching user' });
//   }
// });
router.get("/users/email/:email", async (req, res) => {
  const email = req.params.email;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

router.get('/email/:email', async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email parameter is required' });
    }

    // Fetch from main User collection (login info)
    const user = await User.findOne({ email }).select('-password -__v');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found in User collection' });
    }

    // Fetch from SpeakerProfile collection (image + intro)
    const profile = await SpeakerProfile.findOne({ email });

    // Merge data if profile exists
    const merged = {
      ...user.toObject(),
      profileImage: profile?.profileImage || "/public/images/default.jpg",
      intro: profile?.intro || "",
      topic: profile.topic || "",
    };

    res.status(200).json({ success: true, user: merged });

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

// router.put("/updateProfile", upload.single("profileImage"), async (req, res) => {
//   const { email, intro } = req.body;
//   const imageFile = req.file;
//
//   try {
//     let update = { updatedAt: new Date() };
//     let publicId = `profile_photo_upload/${email.split("@")[0]}_profile`;
//
//     // Handle intro
//     // if (intro !== undefined) {
//     //   update.intro = intro;
//     // }
//     if (intro !== undefined) {
//       update.intro = intro;
//       update.updatedAt = new Date(); // ✅ Add this line
//     }
//
//     // Handle image
//     if (imageFile) {
//       try {
//         await cloudinary.uploader.destroy(publicId);
//         console.log("✅ Previous profile image deleted:", publicId);
//       } catch (err) {
//         console.warn("⚠️ Couldn't delete previous image:", err.message);
//       }
//
//       const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
//       const result = await cloudinary.uploader.upload(base64Image, {
//         folder: "profile_photo_upload",
//         public_id: email.split("@")[0] + "_profile",
//         overwrite: true
//       });
//
//       update.profileImage = result.secure_url;
//       update.publicId = result.public_id;
//     }
//
//     // Upsert into `speakersProfile` collection
//     await SpeakerProfile.updateOne(
//       { email },
//       { $set: update },
//       { upsert: true }
//     );
//
//     res.json({
//       success: true,
//       imageUrl: update.profileImage || null
//     });
//
//   } catch (err) {
//     console.error("❌ Update failed:", err);
//     res.status(500).json({ success: false });
//   }
// });
router.put("/updateProfile", upload.single("profileImage"), async (req, res) => {
  const { email, intro, topic } = req.body; // ✅ Include `topic`
  const imageFile = req.file;

  try {
    let update = { updatedAt: new Date() };
    let publicId = `profile_photo_upload/${email.split("@")[0]}_profile`;

    // Handle intro
    if (intro !== undefined) {
      update.intro = intro;
    }

    // ✅ Handle topic
    if (topic !== undefined) {
      update.topic = topic;
    }

    // Handle image
    if (imageFile) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log("✅ Previous profile image deleted:", publicId);
      } catch (err) {
        console.warn("⚠️ Couldn't delete previous image:", err.message);
      }

      const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "profile_photo_upload",
        public_id: email.split("@")[0] + "_profile",
        overwrite: true
      });

      update.profileImage = result.secure_url;
      update.publicId = result.public_id;
    }

    // ✅ Upsert into `speakersProfile` collection
    await SpeakerProfile.updateOne(
      { email },
      { $set: update },
      { upsert: true }
    );

    res.json({
      success: true,
      imageUrl: update.profileImage || null
    });

  } catch (err) {
    console.error("❌ Update failed:", err);
    res.status(500).json({ success: false });
  }
});

// ***************************SPL SpeakerProfile data storage*****************************
// ⏩ For SPL speakers only

// ✅ GET SPL speaker by email
router.get("/splusers/email/:email", async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const profile = await SplSpeakerProfile.findOne({ email });
    if (!profile) return res.status(404).json({ success: false, error: "Profile not found" });

    res.status(200).json({ success: true, user: profile });
  } catch (err) {
    console.error("❌ SPL user fetch failed:", err);
    res.status(500).json({ success: false, error: "Server error fetching SPL profile" });
  }
});

// router.post("/splusers/updateProfile", async (req, res) => {
//   try {
//     const { email, topic, intro, profileImage, publicId } = req.body;
//
//     if (!email) {
//       return res.status(400).json({ success: false, message: "Email is required" });
//     }
//
//     const updatedProfile = await SplSpeakerProfile.findOneAndUpdate(
//       { email: email.trim().toLowerCase() },
//       {
//         $set: {
//           topic,
//           intro,
//           profileImage,
//           publicId,
//           updatedAt: new Date()
//         }
//       },
//       { new: true, upsert: true } // Create new if not exists
//     );
//
//     res.json({ success: true, message: "Profile updated", profile: updatedProfile });
//   } catch (err) {
//     console.error("Error updating profile:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
// router.post("/splusers/updateProfile", upload.single("profileImage"), async (req, res) => {
//   try {
//     const { email } = req.body;
//     const profileImage = `/uploads/${req.file.filename}`;
//
//     if (!email) return res.status(400).json({ success: false, message: "Email is required" });
//
//     const profile = await SplSpeakerProfile.findOneAndUpdate(
//       { email },
//       { profileImage },
//       { new: true, upsert: true }
//     );
//
//     res.json({ success: true, imageUrl: profile.profileImage });
//   } catch (err) {
//     console.error("Profile upload error:", err);
//     res.status(500).json({ success: false, message: "Server error during upload" });
//   }
// });


// ✅ PUT update SPL speaker profile
router.put("/splusers/updateProfile", upload.single("profileImage"), async (req, res) => {
  const { email, topic, intro } = req.body;
  const imageFile = req.file;

  try {
    let update = { updatedAt: new Date() };
    let publicId = `spl_profile_upload/${email.split("@")[0]}_profile`;

    if (intro !== undefined) update.intro = intro;
    if (topic !== undefined) update.topic = topic;

    if (imageFile) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("⚠️ Could not delete previous SPL image:", err.message);
      }

      const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "spl_profile_upload",
        public_id: publicId,
        overwrite: true,
      });

      update.profileImage = result.secure_url;
      update.publicId = result.public_id;
    }

    await SplSpeakerProfile.updateOne(
      { email },
      { $set: update },
      { upsert: true }
    );

    res.json({
      success: true,
      imageUrl: update.profileImage || null,
    });
  } catch (err) {
    console.error("❌ SPL profile update failed:", err);
    res.status(500).json({ success: false, error: "Failed to update SPL profile" });
  }
});
// ****************************************************************************************

router.get("/allProfiles", async (req, res) => {
  try {
    const data = await SpeakerProfile.find();
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching speaker profiles");
  }
});


// router.get('/api/speakers', async (req, res) => {
//   try {
//     const speakerProfiles = await SpeakerProfile.find().lean();
//     const splProfiles = await SplSpeakerProfile.find().lean();
//     res.json([...speakerProfiles, ...splProfiles]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.get('/api/speakers', async (req, res) => {
  try {
    const speakerProfiles = await SpeakerProfile.find().lean();
    const splProfiles = await SplSpeakerProfile.find().lean();

    // Create a map to merge by email
    const profileMap = new Map();

    // First, insert from SpeakerProfile
    for (const profile of speakerProfiles) {
      profileMap.set(profile.email, profile);
    }

    // Then override with splProfile if exists (assumed more updated)
    for (const profile of splProfiles) {
      profileMap.set(profile.email, profile);
    }

    // Convert Map values to array
    const mergedProfiles = Array.from(profileMap.values());

    res.json(mergedProfiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
