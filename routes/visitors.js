// routes/visitor.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/visitors');
const geoip = require('geoip-lite');

// Helper to normalize IP (remove IPv6 prefix if needed)
const extractClientIp = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return ip?.split(',')[0].replace('::ffff:', '') || '0.0.0.0';
};

// Track visitor IP and location
router.post('/track', async (req, res) => {
  try {
    const ip = extractClientIp(req);
    // const geo = geoip.lookup(ip) || {};
    /* 1️⃣  Prefer client‑supplied coords (already 8 dp) … */
        let { lat, lon } = req.body || {};

        /* 2️⃣  …fall back to Geo‑IP if absent                         */
        if (lat == null || lon == null){
          const geo = geoip.lookup(ip) || {};
          lat = geo.ll?.[0] ?? null;
          lon = geo.ll?.[1] ?? null;
        }
    const visitor = await Visitor.findOne({ ip });

    if (visitor) {
      visitor.visitCount++;
      visitor.lastVisited = new Date();
      /* update coords if we learned something more precise */
      if (lat != null && lon != null) {
        visitor.latitude  = lat;
        visitor.longitude = lon;
      }
      await visitor.save();
    } else {
      await Visitor.create({
        ip,
        // latitude: geo.ll?.[0] || null,
        // longitude: geo.ll?.[1] || null,
        latitude : lat,
        longitude: lon,
        visitCount: 1, // ✅ IMPORTANT: Explicitly set to 1 when first created
        lastVisited: new Date(),
        clicks: {}     // ✅ Optional: Make sure default `clicks` map is initialized
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Track Error:", error);
    res.status(500).json({ message: 'Error tracking visitor' });
  }
});


// Track speaker click
router.post('/track-click', async (req, res) => {
  try {
    const { speaker } = req.body;
    const ip = extractClientIp(req);

    if (!speaker) return res.status(400).json({ message: 'Speaker name missing' });

    const visitor = await Visitor.findOne({ ip });
    if (visitor) {
      const count = visitor.clicks.get(speaker) || 0;
      visitor.clicks.set(speaker, count + 1);
      await visitor.save();
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Click Tracking Error:", error);
    res.status(500).json({ message: 'Error tracking click' });
  }
});


// Total visitor count
router.get('/count', async (req, res) => {
  try {
    const count = await Visitor.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Count Error:", error);
    res.status(500).json({ message: 'Error getting count' });
  }
});

module.exports = router;
