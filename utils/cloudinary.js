// utils/cloudinary.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'createownstory',
  api_key:    '149723515128621',    // ✅ Use your correct API key
  api_secret: 'QiZLaXXB5cHuDdUx9k0TLFWcHPk'  // ✅ Your correct API secret
});

module.exports = cloudinary;
