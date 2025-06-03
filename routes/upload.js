// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const Story = require("../models/story"); // Make sure the path is correct
//
// // Ensure uploads folder exists
// const uploadPath = path.join(__dirname, "../public/uploads");
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
//   console.log("Image will be stored at:", uploadPath);
// }
//
// // Clean file names (remove special chars and spaces)
// const sanitizeFileName = (originalName) => {
//   const ext = path.extname(originalName);
//   const baseName = path.basename(originalName, ext)
//     .replace(/\s+/g, "_")           // Replace spaces with underscores
//     .replace(/[^a-zA-Z0-9_]/g, "")  // Remove special characters
//     .toLowerCase();
//   return `${Date.now()}_${baseName}${ext}`;
// };
//
// // Set up storage
// const storage = multer.diskStorage({
//   destination: uploadPath,
//   filename: (req, file, cb) => {
//     const safeName = sanitizeFileName(file.originalname);
//     cb(null, safeName);
//   },
// });
//
// const upload = multer({ storage });
//
// // POST: Upload story
// router.post("/uploadStory", upload.single("image"), async (req, res) => {
//   try {
//     const { email, title, intro, description, youtubeLink } = req.body;
//     const imageUrl = req.file ? "/uploads/" + req.file.filename : "";
//
//     const newStory = new Story({
//       email,
//       title,
//       intro,
//       description,
//       youtubeLink,
//       imageUrl,
//       createdAt: new Date()
//     });
//
//     await newStory.save();
//
//     res.status(200).json({ success: true, message: "Story uploaded successfully", story: newStory });
//   } catch (error) {
//     console.error("Error uploading story:", error); // make sure you check terminal logs
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });
//
//
// module.exports = router;


// ******************************25-May-2025************************************
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Story = require("../models/story"); // Ensure the path is correct

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("Uploads folder created at:", uploadPath);
}

// Sanitize filename: remove special characters and whitespace
const sanitizeFileName = (originalName) => {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext)
    .replace(/\s+/g, "_")           // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, "")  // Remove special characters
    .toLowerCase();
  return `${Date.now()}_${baseName}${ext}`;
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, sanitizeFileName(file.originalname));
  }
});

// Optional: Validate file type (allow only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|heic|heif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, gif) are allowed!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max size: 5MB
});

// POST /uploadStory - Upload a story with image
// router.post("/uploadStory", upload.single("image"), async (req, res) => {
//   try {
//     const { email, title, intro, description, youtubeLink } = req.body;
//
//     if (!email || !title || !description) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }
//
//     const imageUrl = req.file ? "/uploads/" + req.file.filename : "";
//
//     const newStory = new Story({
//       email,
//       title,
//       intro,
//       description,
//       youtubeLink,
//       imageUrl,
//       createdAt: new Date()
//     });
//
//     await newStory.save();
//
//     res.status(201).json({
//       success: true,
//       message: "Story uploaded successfully",
//       story: newStory
//     });
//
//   } catch (error) {
//     console.error("Error uploading story:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });

// POST /uploadStory - Upload a story with image
const heicConvert = require("heic-convert");
const sharp = require("sharp");
router.post("/uploadStory", upload.single("image"), async (req, res) => {
  try {
    const { email, title, intro, description, youtubeLink, imageUrl: imageUrlFromBody } = req.body;

    if (!email || !title || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let imageUrl = "";

    // Handle uploaded image
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();

      // Convert HEIC/HEIF to JPEG
      if (ext === ".heic" || ext === ".heif") {
        const inputBuffer = fs.readFileSync(req.file.path);
        const jpegBuffer = await sharp(inputBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();

        const newFilename = req.file.filename.replace(/\.(heic|heif)$/i, ".jpg");
        const newPath = path.join(uploadPath, newFilename);

        fs.writeFileSync(newPath, jpegBuffer);
        fs.unlinkSync(req.file.path); // Delete original HEIC file

        imageUrl = "/uploads/" + newFilename;
      } else {
        imageUrl = "/uploads/" + req.file.filename;
      }
    } else if (imageUrlFromBody && imageUrlFromBody.trim() !== "") {
      imageUrl = imageUrlFromBody.trim();
    }

    const newStory = new Story({
      email,
      title,
      intro,
      description,
      youtubeLink,
      imageUrl,
      createdAt: new Date()
    });

    await newStory.save();

    res.status(201).json({
      success: true,
      message: "Story uploaded successfully",
      story: newStory
    });

  } catch (error) {
    console.error("Error uploading story:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
// router.post("/uploadStory", upload.single("image"), async (req, res) => {
//   try {
//     const { email, title, intro, description, youtubeLink, imageUrl: imageUrlFromBody } = req.body;
//
//     if (!email || !title || !description) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }
//
//     // ✅ Choose uploaded image if present, else fallback to imageUrl provided in body
//     let imageUrl = "";
//     if (req.file) {
//       imageUrl = "/uploads/" + req.file.filename;
//     } else if (imageUrlFromBody && imageUrlFromBody.trim() !== "") {
//       imageUrl = imageUrlFromBody.trim();
//     }
//
//     const newStory = new Story({
//       email,
//       title,
//       intro,
//       description,
//       youtubeLink,
//       imageUrl,
//       createdAt: new Date()
//     });
//
//     await newStory.save();
//
//     res.status(201).json({
//       success: true,
//       message: "Story uploaded successfully",
//       story: newStory
//     });
//
//   } catch (error) {
//     console.error("Error uploading story:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });


// ✅ PUT /upload/updateStory/:id - Update existing story
// router.put("/updateStory/:id", upload.single("image"), async (req, res) => {
//   try {
//     const storyId = req.params.id;
//     const { title, intro, description, youtubeLink } = req.body;
//
//     const updateData = {
//       title,
//       intro,
//       description,
//       youtubeLink
//     };
//
//     if (req.file) {
//       updateData.imageUrl = "/uploads/" + req.file.filename;
//     }
//
//     const updatedStory = await Story.findByIdAndUpdate(storyId, updateData, { new: true });
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
    const { title, intro, description, youtubeLink } = req.body;

    const updateData = {
      title,
      intro,
      description,
      youtubeLink
    };

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();

      // If file is HEIC or HEIF, convert to JPEG
      if (ext === ".heic" || ext === ".heif") {
        const inputBuffer = fs.readFileSync(req.file.path);
        const jpegBuffer = await sharp(inputBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();

        const newFilename = req.file.filename.replace(/\.(heic|heif)$/i, ".jpg");
        const newPath = path.join(uploadPath, newFilename);

        fs.writeFileSync(newPath, jpegBuffer);
        fs.unlinkSync(req.file.path); // Delete original HEIC file

        updateData.imageUrl = "/uploads/" + newFilename;
      } else {
        updateData.imageUrl = "/uploads/" + req.file.filename;
      }
    }

    const updatedStory = await Story.findByIdAndUpdate(storyId, updateData, { new: true });

    if (!updatedStory) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    res.status(200).json({
      success: true,
      message: "Story updated successfully",
      story: updatedStory
    });

  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
