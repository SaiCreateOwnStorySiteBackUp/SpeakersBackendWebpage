require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());

// Safer way to connect using .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static HTML views (e.g., index.html, cherana.html)
app.use(express.static(path.join(__dirname, 'views')));

// Static assets needed by admin UI and upload folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/cssStyles', express.static(path.join(__dirname, 'cssStyles')));

// Root route (for Render deployment success message) for Testing purpose
// app.get('/', (req, res) => {
//   res.send('✅ Backend API is running!');
// });
// ✅ Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// ---------- API Routes (read-only APIs) ----------
// Import routes
// const authRoute = require('./routes/auth');
// const usersRoute = require('./routes/users');
// const uploadRoute = require('./routes/upload');
// app.use('/api/upload', uploadRoute);
// const storiesRoute = require('./routes/stories');
// app.use('/api/stories', storiesRoute);  // Preferred route prefix for APIs
//
// const adminRoute = require('./routes/admin');
// app.use('/api/admin', adminRoute);
// // Clean mounting of routes
//
// app.use('/api/users', usersRoute);
// app.use('/api/auth', authRoute);
app.use('/api/auth', require('./routes/auth'));

// User Routes
app.use('/users', require('./routes/users'));

// Upload Route
app.use('/upload', require('./routes/upload'));
const uploadRoutes = require('./routes/upload');
app.use('/upload', uploadRoutes);


// Story CRUD and retrieval
app.use('/stories', require('./routes/stories'));
// app.use('/api/stories', require('./routes/stories'));

const storiesRoute = require("./routes/stories");
app.use("/api/stories", storiesRoute);;

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/visitor', require('./routes/visitors'));

// *******************************************************************
// Page Routes for admin and login pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/admin/create-speaker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'createSpeaker.html'));
});

app.get('/admin/list-speakers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'listSpeaker.html'));
});

app.get('/admin/list-stories', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'listStories.html'));
});

app.get('/admin/update-speaker', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'updateSpeaker.html'));
});

// Additional admin API example (you have a User model somewhere)
const User = require('./models/user');
app.get('/admin/speakers', async (req, res) => {
  try {
    const cutoffDate = new Date('2025-05-24T14:37:08.000Z');
    const users = await User.find({ createdAt: { $lt: cutoffDate } });
    res.json(users);
  } catch (err) {
    console.error('Error fetching speakers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start backend server on different port
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server started at http://localhost:${PORT}`);
});
