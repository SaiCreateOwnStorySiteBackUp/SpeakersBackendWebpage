const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

router.post('/contact', async (req, res) => {
  const { name, mobile, message } = req.body;

  if (!name || !mobile || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'seshu.kriji@gmail.com',     // Replace
      pass: 'mclwgvrjszvmgfat'           // Use App Password if using Gmail
    }
  });

  const mailOptions = {
    from: 'seshu.kriji@gmail.com',
    to: 'seshusai76@gmail.com',
    subject: 'New Contact Form Submission',
    text: `Name: ${name}\nMobile: ${mobile}\nMessage: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

module.exports = router;
