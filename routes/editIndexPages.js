const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');
const editHomePageModel = require('../models/editHomePage');
const Footer = require("../models/editFooterSection");

// Setup multer for temporary file storage
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Upload logo route
// router.post('/uploadLogo', upload.single('logo'), async (req, res) => {
//   try {
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'websiteLogos'
//     });
//
//     // Optionally delete temp file
//     fs.unlinkSync(req.file.path);
//
//     res.json({ logoUrl: result.secure_url });
//   } catch (err) {
//     console.error('Error uploading logo:', err);
//     res.status(500).json({ error: 'Logo upload failed' });
//   }
// });

// Upload logo route
router.post('/uploadLogo', upload.single('logo'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'websiteLogos'
    });

    fs.unlinkSync(req.file.path); // remove temp file

    const shape = req.body.shape || "rectangle";  // ← get shape from formData
    let pageDoc = await editHomePageModel.findOne();
    if (!pageDoc) pageDoc = new editHomePageModel();

    pageDoc.logoUrl = result.secure_url;
    pageDoc.logoPublicId = result.public_id;
    pageDoc.logoShape = shape; // ← save shape
    await pageDoc.save();

    res.json({
      logoUrl: result.secure_url,
      public_id: result.public_id  // ✅ return public_id
    });
  } catch (err) {
    console.error('Error uploading logo:', err);
    res.status(500).json({ error: 'Logo upload failed' });
  }
});

router.put('/updateHome', async (req, res) => {
  const { homeHeader, homeParagraph } = req.body;

  try {
    const updated = await editHomePageModel.findOneAndUpdate(
      {},
      { homeHeader, homeParagraph },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ success: false });
  }
});

// Update home/about/contact/terms content
router.put('/update', async (req, res) => {
  try {
    const { page, content } = req.body;

    const updateFields = {};
    if (page === 'home') {
      updateFields.homeWebsitename = content.homeWebsitename;
      updateFields.homeHeader = content.homeHeader;
      updateFields.homeParagraph = content.homeParagraph;
      if (content.logoUrl) updateFields.logoUrl = content.logoUrl;
    } else if (page === "about") {
        if (content.aboutText !== undefined) updateFields.aboutText = content.aboutText;
        if (content.logoShape !== undefined) updateFields.logoShape = content.logoShape;
        if (content.logoUrl !== undefined) updateFields.logoUrl = content.logoUrl;  // logo reuse
} else if (page === 'contact') {
      updateFields.contactHeader = content.contactHeader;
      updateFields.contactAddress = content.contactAddress;
      updateFields.contactMobile = content.contactMobile;
      updateFields.contactEmail = content.contactEmail;
      updateFields.contactMessage = content.contactMessage;
      updateFields.contactTriggeredEmail = content.contactTriggeredEmail;
    } else if (page === 'terms') {
      updateFields.termsAndConditionsHeader = content.termsHeader;
      updateFields.termsAndConditionsText = content.termsText;
    } else {
      return res.status(400).json({ error: 'Invalid page type' });
    }

    let settings = await editHomePageModel.findOne();
    if (!settings) {
      settings = new editHomePageModel(updateFields);
    } else {
      Object.assign(settings, updateFields);
    }

    await settings.save();
    res.json({ message: 'Page updated successfully' });
  } catch (err) {
    console.error('Error updating page:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Get home page data
// router.get('/home', async (req, res) => {
//   try {
//     const data = await editHomePageModel.findOne();
//     res.json(data);
//   } catch (err) {
//     console.error("Failed to load home page data", err);
//     res.status(500).json({ error: 'Failed to load home page data' });
//   }
// });

router.get("/home", async (req, res) => {
  try {
    const homeData = await editHomePageModel.findOne();
    if (!homeData) {
      return res.status(404).json({ error: "No home data found" });
    }

    return res.json({
      logoUrl: homeData.logoUrl || "",
      logoShape: homeData.logoShape || "",
      homeWebsitename: homeData.homeWebsitename || "",
      homeHeader: homeData.homeHeader || "",
      homeParagraph: homeData.homeParagraph || "",
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    res.status(500).json({ error: "Failed to fetch home page data" });
  }
});

// Get about page data
// router.get('/about', async (req, res) => {
//   try {
//     const data = await editHomePageModel.findOne();
//     res.json(data);
//   } catch (err) {
//     console.error("Failed to load about page data", err);
//     res.status(500).json({ error: 'Failed to load about page data' });
//   }
// });

router.get("/about", async (req, res) => {
  try {
    const pageData = await editHomePageModel.findOne(); // or with query if needed
    if (!pageData) {
      return res.status(404).json({ message: "Page data not found" });
    }
    res.json(pageData);
  } catch (err) {
    console.error("Error fetching about page data:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// router.get("/about", async (req, res) => {
//   try {
//     const data = await EditIndexPage.findOne().sort({ updatedAt: -1 }).lean(); // ✅ use lean()
//     if (!data) {
//       return res.status(404).json({ error: "No about data found" });
//     }
//
//     return res.json({
//       logoUrl: data.logoUrl || "",
//       logoShape: data.logoShape || "default", // ✅ make sure this is added in your schema
//       aboutText: data.aboutText || "",
//     });
//   } catch (error) {
//     console.error("Error fetching About data:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

// Get contact page data
router.get('/contact', async (req, res) => {
  try {
    const data = await editHomePageModel.findOne();
    if (!data) {
      return res.status(404).json({ message: "Page data not found" });
    }
    res.json(data);
  } catch (err) {
    console.error("Failed to load contact page data", err);
    res.status(500).json({ error: 'Failed to load contact page data' });
  }
});

// Get terms and conditions data
router.get('/terms', async (req, res) => {
  try {
    const data = await editHomePageModel.findOne();
    if (!data) {
      return res.status(404).json({ message: "Page data not found" });
    }
    res.json(data);
  } catch (err) {
    console.error("Failed to load terms page data", err);
    res.status(500).json({ error: 'Failed to load terms page data' });
  }
});


router.post("/deleteLogo", async (req, res) => {
  const { public_id } = req.body;

  if (!public_id) return res.status(400).json({ success: false, message: "Missing public_id" });

  try {
    await cloudinary.uploader.destroy(public_id);
    res.json({ success: true });
  } catch (err) {
    console.error("Cloudinary deletion error:", err);
    res.status(500).json({ success: false, message: "Failed to delete logo" });
  }
});

// GET all footer data
router.get("/footer", async (req, res) => {
  const data = await Footer.find();
  res.json(data);
});

// PUT to update existing
// PUT - Update or Create
// router.put('/footer', async (req, res) => {
//   const { type, value, enabled } = req.body;
//   const existing = await Footer.findOne({ type });
// try {
//   if (existing) {
//     existing.value = value;
//     existing.enabled = enabled;
//     await existing.save();
//   } else {
//     await Footer.create({ type, value, enabled });
//   }
//
//   res.sendStatus(200);
// }
//   catch (err) {
//     res.status(500).send("Error updating footer: " + err.message);
//   }
// });

// KEEP THIS ONE
router.put('/footer', async (req, res) => {
  const { type, value, enabled } = req.body;

  try {
    await Footer.findOneAndUpdate(
      { type },
      { value, enabled },
      { upsert: true, new: true }
    );
    res.status(200).send("Footer updated");
  } catch (err) {
    res.status(500).send("Error updating footer: " + err.message);
  }
});


// DELETE - Remove
router.delete('/footer/:type', async (req, res) => {
  await Footer.deleteOne({ type: req.params.type });
  res.sendStatus(200);
});

module.exports = router;
