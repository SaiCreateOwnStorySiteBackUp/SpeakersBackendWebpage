const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const splUploadModel = require("../models/splUpload");
const sharp = require("sharp");

// Create uploads folder if not exist
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File name sanitization
const sanitizeFileName = (name) => {
  const ext = path.extname(name);
  const base = path.basename(name, ext).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  return `${Date.now()}_${base}${ext}`;
};

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, sanitizeFileName(file.originalname))
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|heic|heif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowed.test(ext) && allowed.test(mime)) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ✅ PUT /splUpload/updateStory/:id
// router.put("/updateStory/:id", upload.single("image"), async (req, res) => {
//   try {
//     const storyId = req.params.id;
//     const {
//       title,
//       description,
//       youtubeLink,
//       imageUrl: imageUrlFromBody,
//       state,
//       locality
//     } = req.body;
//
//     const updateData = {
//       title,
//       description,
//       youtubeLink,
//       state,
//       locality
//     };
//
//     if (req.file) {
//       const ext = path.extname(req.file.originalname).toLowerCase();
//       const inputBuffer = fs.readFileSync(req.file.path);
//       let finalBuffer = inputBuffer;
//
//       if (ext === ".heic" || ext === ".heif") {
//         finalBuffer = await sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
//         fs.unlinkSync(req.file.path);
//       }
//
//       const baseName = req.file.filename.replace(/\.(heic|heif|jpg|jpeg|png)$/i, "");
//       const smallFilename = `${baseName}_small.jpg`;
//       const smallPath = path.join(uploadDir, smallFilename);
//
//       await sharp(finalBuffer)
//         .resize({ width: 800 })
//         .jpeg({ quality: 80 })
//         .toFile(smallPath);
//
//       updateData.imageUrl = "/uploads/" + smallFilename;
//     } else if (imageUrlFromBody && imageUrlFromBody.trim() !== "") {
//       updateData.imageUrl = imageUrlFromBody.trim();
//     }
//
//     const updatedStory = await splUploadModel.findByIdAndUpdate(storyId, updateData, { new: true });
//
//     if (!updatedStory) {
//       return res.status(404).json({ success: false, message: "Story not found" });
//     }
//
//     res.status(200).json({
//       success: true,
//       message: "Story updated successfully",
//       story: updatedStory
//     });
//
//   } catch (error) {
//     console.error("Error updating story:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });
router.put("/updateStory/:id", upload.single("image"), async (req, res) => {
  try {
    const storyId = req.params.id;
    const {
      title,
      description,
      youtubeLink = '',
      imageUrl: imageUrlFromBody = '',
      state,
      locality
    } = req.body;

    const updateData = {
      title,
      description,
      youtubeLink: youtubeLink.trim() || null,
      state,
      locality
    };

    // ✅ Prevent duplicate title (case-insensitive) from other stories
    const { Types } = require("mongoose"); // Add this at top of file

    const duplicateTitle = await splUploadModel.findOne({
    _id: { $ne: new Types.ObjectId(storyId) },
    email: req.body.email,
    title: { $regex: new RegExp(`^${req.body.title.trim()}$`, 'i') }
  });

  if (duplicateTitle) {
    return res.status(409).json({
      success: false,
      message: "Already Title name is used in previous stories, Please update new title name."
    });
  }

    // Add this BEFORE the update logic
    // const { email, title } = req.body;
    //
    // const duplicate = await SplUploads.findOne({
    //   _id: { $ne: req.params.id },  // exclude current story
    //   email,
    //   title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } // case-insensitive match
    // });
    //
    // if (duplicate) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Already story title is used in previous stories, kindly update with new title'
    //   });
    // }


    let finalImageUrl = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const inputBuffer = fs.readFileSync(req.file.path);
      let finalBuffer = inputBuffer;

      if (ext === ".heic" || ext === ".heif") {
        finalBuffer = await sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
        fs.unlinkSync(req.file.path);
      }

      const baseName = req.file.filename.replace(/\.(heic|heif|jpg|jpeg|png)$/i, "");
      const smallFilename = `${baseName}_small.jpg`;
      const smallPath = path.join(uploadDir, smallFilename);

      await sharp(finalBuffer)
        .resize({ width: 800 })
        .jpeg({ quality: 80 })
        .toFile(smallPath);

      finalImageUrl = "/uploads/" + smallFilename;
    } else if (imageUrlFromBody.trim() !== "") {
      finalImageUrl = imageUrlFromBody.trim();
    }

    if (finalImageUrl) updateData.imageUrl = finalImageUrl;


    // ✅ Prevent duplicate YouTube link or image URL
    const mediaQuery = {
    _id: { $ne: new Types.ObjectId(storyId) },
    $or: []
  };
    if (youtubeLink.trim() !== "") {
      mediaQuery.$or.push({ youtubeLink: youtubeLink.trim() });
    }
    if (finalImageUrl) {
      mediaQuery.$or.push({ imageUrl: finalImageUrl });
    }

    if (mediaQuery.$or.length > 0) {
      const duplicateMedia = await splUploadModel.findOne(mediaQuery);
      if (duplicateMedia) {
        return res.status(409).json({
          success: false,
          message: "🚫 This image or YouTube link is already used in another story."
        });
      }
    }

    const updatedStory = await splUploadModel.findByIdAndUpdate(storyId, updateData, { new: true });

    if (!updatedStory) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    res.status(200).json({
      success: true,
      message: "✅ Story updated successfully",
      story: updatedStory
    });

  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


module.exports = router;
