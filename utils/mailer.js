const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seshu.kriji@gmail.com',
    pass: 'mclwgvrjszvmgfat'  //gmail App Password
  }
});

// 🔹 Generalized reusable email function
const sendGenericEmail = async (to, subject, html) => {
  const mailOptions = {
    from: '"Sai - Speaker Admin" <seshu.kriji@gmail.com>',
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
};

// 🔹 Welcome email
const sendWelcomeEmail = async (email, name, password) => {
  const html = `
    <h2>Hi ${name},</h2>
    <p>You have been added as a speaker on our platform. 🎉</p>
    <p><strong>Login Details:</strong></p>
    <ul>
      <li>Email: ${email}</li>
      <li>Password: ${password}</li>
    </ul>
    <p>Please log in and start posting your stories!</p>
    <p>Regards,<br>Sai (Admin)</p>
  `;

  await sendGenericEmail(email, 'Welcome to the Storytelling Platform!', html);
};

// 🔹 Password reset email
const sendPasswordResetEmail = async (email, name, newPassword) => {
  const html = `
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Here is your new password:</p>
    <p><strong>New Password:</strong> ${newPassword}</p>
    <p>Please log in and change your password immediately for security reasons.</p>
    <p>- Sai (Admin)</p>
  `;

  await sendGenericEmail(email, 'Password Reset - Speaker Platform', html);
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendGenericEmail,
};
