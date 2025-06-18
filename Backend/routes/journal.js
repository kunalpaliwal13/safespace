// server/routes/journal.js
const express = require("express");
const router = express.Router();
const Journal = require("../models/journal");
const axios = require("axios");

// POST /api/journal
router.post("/", async (req, res) => {
  const { mood, entry } = req.body;
  try {
    // Optional: send to ML service
    const mlRes = await axios.post("http://localhost:5001/analyze", { text: entry });

    const journal = new Journal({
      mood,
      entry,
      sentiment: mlRes.data.sentiment, // e.g., 'positive', 'negative'
      timestamp: new Date(),
    });

    await journal.save();
    res.json({ message: "Entry saved", sentiment: mlRes.data.sentiment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save journal" });
  }
});

module.exports = router;
