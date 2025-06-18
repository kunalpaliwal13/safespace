const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  date: String,
  mood: String,
  emoji: String,
  note: String,
  userId: String
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  role: { type: String, default: 'user' },
  journal: [JournalEntrySchema],
  notifications: [{ type: String }] ,
});

module.exports = mongoose.model('User', UserSchema);
