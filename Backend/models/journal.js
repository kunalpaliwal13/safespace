const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
  mood: String,
  entry: String,
  sentiment: String,
  timestamp: Date,
});

module.exports = mongoose.model("Journal", journalSchema);
