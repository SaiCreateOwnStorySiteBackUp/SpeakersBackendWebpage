const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const Story = require("../models/story");

const { sendWelcomeEmail, sendGenericEmail } = require("../utils/mailer");
const generateRandomPassword = require("../utils/passwordGenerator");

// ---------- SPEAKER ROUTES ----------

// ✅ Fetch speakers before a specific cutoff date
router.get("/speakers", async (req, res) => {
  try {
    const cutoffDate = new Date("2025-05-24T14:37:08.000Z");
    const cutoffObjectId = new mongoose.Types.ObjectId(
      Math.floor(cutoffDate.getTime() / 1000).toString(16) + "0000000000000000"
    );

    const speakers = await User.find({
      role: { $in: ["speaker", "both"] },
      _id: { $lt: cutoffObjectId },
    });

    res.json(speakers);
  } catch (err) {
    console.error("Error fetching cutoff speakers:", err);
    res.status(500).send("Internal server error");
  }
});

// ✅ Fetch all speakers
router.get("/all-speakers", async (req, res) => {
  try {
    const speakers = await User.find({ role: { $in: ["speaker", "both"] } });
    res.json(speakers);
  } catch (err) {
    console.error("Error fetching all speakers:", err);
    res.status(500).send("Internal server error");
  }
});

// ✅ Create speaker from raw body (manual form or API)
// router.post("/speakers", async (req, res) => {
//   try {
//     const speaker = new User(req.body);
//     await speaker.save();
//     res.status(201).json({ message: "Speaker created successfully" });
//   } catch (err) {
//     console.error("Error creating speaker:", err);
//     res.status(500).json({ error: "Failed to create speaker" });
//   }
// });

  // router.post("/create-speaker", async (req, res) => {
  //   const password = generateRandomPassword();
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const user = new User({name,
  //       email,
  //       country,
  //       mobile,
  //       gender,
  //       role,
  //       password: hashedPassword,
  //       isEnabled: true,
  //     });
  //   await user.save();
  //   await sendWelcomeEmail(email, name, password);
  //   res.json({ message: "Speaker created and welcome email sent successfully" });
  // });


// ✅ Create speaker with generated password and welcome email
router.post("/create-speaker", async (req, res) => {
  try {
    const { name, email, country, mobile, gender, role } = req.body;
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      country,
      mobile,
      gender,
      role,
      password: hashedPassword,
      isEnabled: true,
    });

    await user.save();
    await sendWelcomeEmail(email, name, password);

    res.json({ message: "Speaker created and welcome email sent successfully" });
  } catch (error) {
    console.error("Error creating speaker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Get single speaker by ID
router.get("/get-speaker/:id", async (req, res) => {
  try {
    const speaker = await User.findById(req.params.id).select("name email country mobile");
    if (!speaker) return res.status(404).json({ message: "Speaker not found" });
    res.json(speaker);
  } catch (error) {
    console.error("Error fetching speaker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Update speaker info
// router.put("/update-speaker/:id", async (req, res) => {
//   try {
//     const { name, country, mobile } = req.body;
//
//     const updated = await User.findByIdAndUpdate(
//       req.params.id,
//       { name, country, mobile },
//       { new: true }
//     );
//
//     if (!updated) return res.status(404).json({ message: "Speaker not found" });
//
//     res.json({ message: "Speaker updated successfully" });
//   } catch (error) {
//     console.error("Error updating speaker:", error);
//     res.status(500).json({ message: "Failed to update speaker" });
//   }
// });
 // ✅ Update speaker info and detect email change
 router.put("/update-speaker/:id", async (req, res) => {
   try {
     const { name, country, mobile, email, gender, role } = req.body;

     const existingUser = await User.findById(req.params.id);
     if (!existingUser) return res.status(404).json({ message: "Speaker not found" });

     const emailChanged = email && email !== existingUser.email;

     const updatePayload = {
       name: name || existingUser.name,
       country: country || existingUser.country,
       mobile: mobile || existingUser.mobile,
       gender: gender || existingUser.gender,
       role: role || existingUser.role
     };

     if (emailChanged) {
       const newPassword = generateRandomPassword();
       const hashedPassword = await bcrypt.hash(newPassword, 10);

       updatePayload.email = email;
       updatePayload.password = hashedPassword;

       await sendGenericEmail(
         email,
         "Email Updated - New Password",
         `<p>Hello ${name || existingUser.name},</p>
          <p>Your email has been updated. Here's your new login password:</p>
          <p><strong>${newPassword}</strong></p>
          <p>- Admin Team</p>`
       );
     }

     await User.findByIdAndUpdate(req.params.id, updatePayload, { new: true });

     res.json({
       message: "Speaker updated successfully",
       emailChanged: emailChanged,
     });
   } catch (error) {
     console.error("Error updating speaker:", error);
     res.status(500).json({ message: "Failed to update speaker" });
   }
 });


// ---------- STORY ROUTES ----------

// ✅ Fetch all stories (admin view)
router.get("/stories", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (err) {
    console.error("Error fetching stories:", err);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
});

// ✅ Update story and notify speaker on changes
router.put("/stories/:id", async (req, res) => {
  try {
    const { title, intro, description, imageUrl, youtubeLink } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) return res.status(404).json({ message: "Story not found" });

    const changes = [];
    if (story.title !== title) changes.push("title");
    if (story.intro !== intro) changes.push("intro");
    if (story.description !== description) changes.push("description");
    if (story.imageUrl !== imageUrl) changes.push("story image");
    if (story.youtubeLink !== youtubeLink) changes.push("YouTube link");

    // Update fields
    story.title = title;
    story.intro = intro;
    story.description = description;
    story.imageUrl = imageUrl;
    story.youtubeLink = youtubeLink;

    await story.save();

    // Email speaker if email is available and changes were made
    if (changes.length > 0 && story.email) {
      const speakerName = story.email.split("@")[0];
      const changeSummary = changes.map(c => `<li>${c}</li>`).join("");

      const subject = "Story Updated by Admin";
      const html = `
        <p>Hello ${speakerName},</p>
        <p>Your story titled <strong>${story.title}</strong> has been updated by the admin. Below are the changes:</p>
        <ul>${changeSummary}</ul>
        <p>- Sai</p>
      `;

      await sendGenericEmail(story.email, subject, html);
    }

    res.json({ message: "Story updated successfully" });
  } catch (err) {
    console.error("Error updating story:", err);
    res.status(500).json({ message: "Failed to update story" });
  }
});

// ✅ Delete story
router.delete("/stories/:id", async (req, res) => {
  try {
    const deleted = await Story.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Story not found" });

    res.json({ message: "Story deleted successfully" });
  } catch (err) {
    console.error("Error deleting story:", err);
    res.status(500).json({ message: "Failed to delete story" });
  }
});

// ✅ Route for listStories.html
router.get("/list-stories", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (err) {
    console.error("Error fetching stories:", err);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
});

// ---------- USER ADMIN ACTIONS ----------

// ✅ Enable or disable user
router.put("/users/:id", async (req, res) => {
  try {
    const { isEnabled } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isEnabled },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error updating user status:", err);
    res.status(500).json({ success: false, error: "Update failed" });
  }
});

module.exports = router;
