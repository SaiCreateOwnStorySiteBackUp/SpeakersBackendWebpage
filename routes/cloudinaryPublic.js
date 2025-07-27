// const router     = require('express').Router();
// const cloudinary = require('cloudinary').v2;
//
// cloudinary.config({
//   cloud_name: 'createownstory',
//   api_key:    '149723515128621',
//   api_secret: 'QiZLaXXB5cHuDdUx9k0TLFWcHPk'
// });
//
// /**
//  * GET /cloudinary/public-signature?type=image|video
//  * Returns one‑time signature for the “public posts” folder.
//  */
// router.get('/public-signature', (req, res) => {
//   const type = req.query.type === 'video' ? 'video' : 'image';  // default image
//   const timestamp = Math.round(Date.now() / 1000);
//
//   const params = {
//     timestamp,
//     upload_preset: 'publicPosts_upload',          // create this preset → Signed
//     folder: 'publicPosts_Images_Videos',
//     // resource_type: type
//   };
//
//   const signature = cloudinary.utils.api_sign_request(
//     params,
//     cloudinary.config().api_secret
//   );
//
//   res.json({
//     signature,
//     timestamp,
//     apiKey:      cloudinary.config().api_key,
//     cloudName:   cloudinary.config().cloud_name,
//     uploadPreset: 'publicPosts_upload',
//     folder:      'publicPosts_Images_Videos',
//     resourceType: type
//   });
// });
//
// module.exports = router;


// routes/cloudinaryPublic.js
const router = require('express').Router();
const cloudinary = require('../utils/cloudinary'); // ✅ Centralized config

/**
 * GET /cloudinary/public-signature?type=image|video
 * Returns one‑time signature for the “public posts” folder.
 */
router.get('/public-signature', (req, res) => {
  const type = req.query.type === 'video' ? 'video' : 'image'; // Default: image
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    upload_preset: 'publicPosts_upload',           // ✅ Must match Cloudinary preset
    folder: 'publicPosts_Images_Videos'
    // Note: resource_type does not need to be signed here
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    cloudinary.config().api_secret
  );

  res.json({
    signature,
    timestamp,
    apiKey: cloudinary.config().api_key,
    cloudName: cloudinary.config().cloud_name,
    uploadPreset: 'publicPosts_upload',
    folder: 'publicPosts_Images_Videos',
    resourceType: type
  });
});

module.exports = router;
