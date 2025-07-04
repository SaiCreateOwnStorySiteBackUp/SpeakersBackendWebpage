// routes/publicSubmissions.js
const express  = require("express");
const nodemailer = require("nodemailer");
const router   = express.Router();
const bcrypt = require('bcrypt');

/* simple transporter – use your real SMTP creds */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: "seshu.kriji@gmail.com", pass: "mclwgvrjszvmgfat" }
});

router.post("/", async (req,res)=>{
  try{
    const { name,mobile,title,url,state,locality } = req.body;

    /* TODO: optionally store in DB for moderation */

    /* send mail to moderation inbox */
    await transporter.sendMail({
      from: '"Free Voices Bot" <seshu.kriji@gmail.com>',
      to:   "seshusai76@gmail.com",
      subject: `New Public Submission – ${title}`,
      text: `
Name:      ${name}
Mobile:    ${mobile}
Title:     ${title}
URL:       ${url}
State:     ${state}
Locality:  ${locality}

Please review in dashboard within 24 hours.`
    });

    res.json({ success:true });
  }catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:"Mail failed." });
  }
});

module.exports = router;
