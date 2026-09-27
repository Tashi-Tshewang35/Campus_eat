const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendVerificationEmail(toEmail, token) {
  const link = `http://localhost:3000/verify/${token}`;
  await transporter.sendMail({
    from: `"Campus Eats" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your Campus Eats account',
    text: `Click to verify your account: ${link}`,
    html: `<p>Click to verify your account: <a href="${link}">${link}</a></p>`,
  });
  console.log(`Verification email sent to ${toEmail}`);
}

module.exports = { sendVerificationEmail };

async function sendPasswordResetEmail(toEmail, token) {
  const link = `http://localhost:3000/reset-password/${token}`;
  await transporter.sendMail({
    from: `"Campus Eats" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your Campus Eats password',
    text: `Reset your password here (valid for 1 hour): ${link}`,
    html: `<p>Reset your password here (valid for 1 hour): <a href="${link}">${link}</a></p>`,
  });
  console.log(`Password reset email sent to ${toEmail}`);
}

module.exports.sendPasswordResetEmail = sendPasswordResetEmail;
