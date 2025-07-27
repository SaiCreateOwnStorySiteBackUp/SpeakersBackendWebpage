const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Ensure correct model path

router.get("/meta/:slug", async (req, res) => {
  try {
    const slug = req.params.slug?.trim().toLowerCase();
    if (!slug) return res.status(400).json({ error: "Invalid slug" });

    const user = await User.findOne({ slug });
    if (!user) return res.status(404).json({ error: "Not found" });

    res.json({
      title: `${user.name} - Free Voices`,
      description: user.intro || "Inspiring stories on Free Voices.",
      image: user.profileImage,
      url: `https://freevoices.onrender.com/${slug}.html`
      // url: `http://localhost:5000/meta/${slug}.html`
    });
  } catch (err) {
    console.error("Error fetching meta for slug:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
