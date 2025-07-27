const router = require('express').Router();
const cloudinary = require('../utils/cloudinary'); // ✅ using shared config

router.get('/signature', (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    upload_preset: 'logo_photo_upload',
    folder: 'websiteLogos'
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret);

  res.json({
    signature,
    timestamp,
    apiKey: cloudinary.config().api_key,
    cloudName: cloudinary.config().cloud_name,
    uploadPreset: 'logo_photo_upload',
    folder: 'websiteLogos'
  });
});

module.exports = router;
