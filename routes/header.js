const express = require("express");
const router = express.Router();
const MenuItem = require("../models/menuItem");
const fs = require("fs");
const path = require("path");

router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    // Step 1: Save menu to MongoDB
    const newMenu = new HeaderMenu({ title });
    await newMenu.save();

    // Step 2: Convert title to file-friendly format
    const fileName = title
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^\w]/g, "") + ".html"; // termsandconditions.html

    // Step 3: File path where to save HTML file
    const htmlFolderPath = path.join(__dirname, "..", "Speakers_Frontend_WebPage", "views");
    const filePath = path.join(htmlFolderPath, fileName);

    // Step 4: Create file with a basic HTML template
    if (!fs.existsSync(filePath)) {
      const basicHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="/cssStyles/speakersCssStyle.css">
</head>
<body>
  <div class="page-border">
    <header>
      <div>
        <img src="/images/admin.png" alt="Admin" class="logo">
      </div>
      <nav id="dynamic-nav"></nav>
    </header>

    <main>
      <h1>${title}</h1>
      <p>Content coming soon...</p>
    </main>

    <footer>
      <p>&copy; ${new Date().getFullYear()}</p>
    </footer>
  </div>

  <script src="/js/config.js"></script>
  <script src="/js/loadHeaderMenu.js"></script>
  <script>loadHeaderMenu();</script>
</body>
</html>
      `;

      fs.writeFileSync(filePath, basicHtml);
      console.log("Created new page:", filePath);
      const frontendPath = path.join("..", "..", "Speakers_Frontend_WebPage", "views", fileName); // Adjust path if needed
      try {
        fs.copyFileSync(filePath, frontendPath);
        console.log("Copied to frontend views folder:", frontendPath);
      } catch (copyErr) {
        console.warn("Unable to copy to frontend views folder:", copyErr.message);
      }
    }

    res.status(201).json(newMenu);
  } catch (err) {
    console.error("Error creating menu and HTML file:", err);
    res.status(500).json({ error: err.message });
  }
});


// GET all menu items
router.get("/menus", async (req, res) => {
  const items = await MenuItem.find().sort({ createdAt: 1 });
  res.json(items);
});

// CREATE menu item
router.post("/menus", async (req, res) => {
  const { title } = req.body;
  const count = await MenuItem.countDocuments(); // Auto-order at the end
  const newMenu = new MenuItem({ title, menuOrder: count });

  if (!title) return res.status(400).json({ success: false, message: "Title is required" });

  try {
    const existing = await MenuItem.findOne({ title });
    if (existing) return res.json({ success: false, message: "Menu already exists" });

    const newItem = await MenuItem.create({ title });
    res.json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE menu item
// router.put("/menus/:id", async (req, res) => {
//   const { title, visible } = req.body;
//   try {
//     // const updated = await MenuItem.findByIdAndUpdate(req.params.id, { title }, { new: true });
//     const updateFields = {};
//     if (title !== undefined) updateFields.title = title;
//     if (visible !== undefined) updateFields.visible = visible === "true" || visible === true;
//
//     await MenuItem.findByIdAndUpdate(req.params.id, updateFields);
//     res.json({ success: true, data: updated });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

router.put("/menus/:id", async (req, res) => {
  const { title, visible } = req.body;
  try {
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (visible !== undefined) updateFields.visible = visible === "true" || visible === true;

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update failed:", err); // optional logging
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// DELETE menu item
router.delete("/menus/:id", async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
// routes/headerRoutes.js
// router.get("/", async (req, res) => {
//   try {
//     const menus = await MenuItem.find().sort({ createdAt: 1 }); // ✅ Use MenuItem instead of HeaderMenu
//     res.json(menus);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.get("/", async (req, res) => {
  try {
    // const menus = await MenuItem.find().sort({ order: 1, createdAt: 1 }); // ← Important
    const menus = await MenuItem.find({ visible: true }).sort({ menuOrder: 1 });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.put("/reorder", async (req, res) => {
//   try {
//     const { orderedIds } = req.body;
//
//     for (let i = 0; i < orderedIds.length; i++) {
//       await MenuItem.findByIdAndUpdate(orderedIds[i], { menuOrder: i });
//     }
//
//     res.json({ success: true });
//   } catch (err) {
//     console.error("Reorder error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.put("/reorder", async (req, res) => {
//   try {
//     const newOrder = req.body.order; // [{id, order}, ...]
//     for (let item of newOrder) {
//       await MenuItem.findByIdAndUpdate(item.id, { order: item.order });
//     }
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Failed to reorder." });
//   }
// });

router.put("/reorder", async (req, res) => {
  try {
    const newOrder = req.body.order; // [{id, order}, ...]
    for (let item of newOrder) {
      await MenuItem.findByIdAndUpdate(item.id, { menuOrder: item.order }); // ✅ Fix here
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ success: false, message: "Failed to reorder." });
  }
});




module.exports = router;
