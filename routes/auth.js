const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/mailer');


// ✅ Middleware: Only allow admin access
function isAdmin(req, res, next) {
  const { role } = req.body;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

// 🔧 Utility: Generate random password (alphanumeric, max 10 characters)
// function generateRandomPassword(length = 10) {
//   const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let pwd = '';
//   for (let i = 0; i < length; i++) {
//     pwd += chars[Math.floor(Math.random() * chars.length)];
//   }
//   return pwd;
// }
const { generateRandomPassword } = require('../utils/passwordGenerator');

// ✅ POST: Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    if (!user.isEnabled) {
      return res.status(403).json({ error: 'Your login is disabled. Please contact the admin.' });
    }

    let isPasswordMatch = false;
    if (user.password.startsWith('$2')) {
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      isPasswordMatch = user.password === password;
    }

    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
      email: user.email,
      role: user.role,
      allowedPage: user.allowedPage,
      name: user.name
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ✅ GET: List all speakers (admin only)
router.get('/speakers', isAdmin, async (req, res) => {
  try {
    const speakers = await User.find({ role: 'speaker' });
    res.json(speakers);
  } catch (err) {
    console.error('Error fetching speakers:', err);
    res.status(500).json({ error: 'Server error while fetching speakers' });
  }
});

// ✅ PUT: Enable/disable speaker login
router.put('/speakers/:id/status', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { isEnabled } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(id, { isEnabled }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Speaker not found' });

    res.json({ message: `Speaker ${isEnabled ? 'enabled' : 'disabled'}` });
  } catch (err) {
    console.error('Error updating speaker status:', err);
    res.status(500).json({ error: 'Server error while updating status' });
  }
});

// ✅ PUT: Update speaker profile details
router.put('/speakers/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, country, mobile } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { name, email, country, mobile },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Speaker not found' });

    res.json({ message: 'Speaker updated successfully', user: updated });
  } catch (err) {
    console.error('Error updating speaker:', err);
    res.status(500).json({ error: 'Server error while updating speaker' });
  }
});

// ✅ POST: Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) return res.status(400).json({ error: 'Identifier required.' });

  const query = /\S+@\S+\.\S+/.test(identifier)
    ? { email: identifier.toLowerCase() }
    : { mobile: identifier };

  try {
    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const newPassword = generateRandomPassword(10);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    if (query.email) {
      await sendEmail(
        user.email,
        'Your New Password',
        `<p>Hello ${user.name || ''},</p><p>Your new password is: <b>${newPassword}</b></p>`
      );
    } else {
      console.log(`Send SMS to ${user.mobile}: Your new password is ${newPassword}`);
    }

    res.json({ message: 'Password sent successfully.' });
  } catch (err) {
    console.error('Password recovery error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ✅ POST: Update Password
router.post('/update-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Old password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
