// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require('dotenv').config();
const User = require('./models/User')
const jwt = require('jsonwebtoken');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("SafeSpace backend is running.");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.error("MongoDB connection error:", err));


//register

app.post("/api/register", async(req, res)=>{
  const{name,email,password, phone}= req.body;
  const hashed = await bcrypt.hash(password, 10);
  const newUser = new User({name, email, password: hashed, phone});
  await newUser.save();
  res.status(201).json({message: "User created"});
})

app.post("/api/login", async(req, res)=>{
  
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
})


app.get('/api/user', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/notifications', async (req, res) => {
  try {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(user.notifications || []);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
}
);


app.post('/notify-admin', async (req, res) => {

  try{
  const { message, userId, timestamp } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const notification = {
    name: user.name,
    email: user.email,
    tag: 'Suicidal',
    phone: user.phone,
    text: message,
    time: timestamp
  };

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  admin.notifications.push(JSON.stringify(notification));
  await admin.save();

  res.status(200).json({ status: 'Notification saved to admin' });

  console.log(`🔔 Notification: User ${userId} may need help. Message: ${message}`);
}catch (err) {
  console.error('Notification error:', err);
  res.status(500).json({ error: 'Server error' }); 
}

});


app.post('/api/journal', async (req, res) => {
  try {
    const { date, mood, emoji, note, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    } 

    const journalEntry = {
      date,
      mood,
      emoji,
      note,
      userId
    };

    if (!note || typeof note !== 'string') {
      return res.status(400).json({ error: 'Invalid note' });
    }
    


    user.journal.push(journalEntry);
    await user.save();

    return res.status(200).json({ message: 'Journal entry saved successfully' });
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return res.status(500).json({ message: 'An error occurred while saving your journal entry' });
  }
});



app.get('/api/journal/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the journal entries
    res.status(200).json(user.journal);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ message: 'An error occurred while fetching your journal entries' });
  }
});
