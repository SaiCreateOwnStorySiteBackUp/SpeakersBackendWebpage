// // routes/cloudinarySign.js
// const router = require('express').Router();
// const cloudinary = require('cloudinary').v2;
//
// cloudinary.config({
//   cloud_name: 'createownstory',
//   api_key:    '149723515128621',
//   api_secret: 'QiZLaXXB5cHuDdUx9k0TLFWcHPk'
// });
//
// router.get('/signature', (req, res) => {
//   const timestamp = Math.round(Date.now() / 1000);
//   const paramsToSign = {
//     timestamp,
//     upload_preset: 'speakers_story_upload',
//     folder: 'SpeakersStories_Images'
//   };
//
//   const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret);
//
//   res.json({
//     signature,
//     timestamp,
//     apiKey: cloudinary.config().api_key,
//     cloudName: cloudinary.config().cloud_name,
//     uploadPreset: 'speakers_story_upload',
//     folder: 'SpeakersStories_Images'
//   });
// });
//
// module.exports = router;

// routes/cloudinarySign.js
const router = require('express').Router();
const cloudinary = require('../utils/cloudinary'); // ✅ using shared config

router.get('/signature', (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    upload_preset: 'speakers_story_upload',
    folder: 'SpeakersStories_Images'
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret);

  res.json({
    signature,
    timestamp,
    apiKey: cloudinary.config().api_key,
    cloudName: cloudinary.config().cloud_name,
    uploadPreset: 'speakers_story_upload',
    folder: 'SpeakersStories_Images'
  });
});

module.exports = router;
