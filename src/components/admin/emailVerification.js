const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('./models/user'); // Adjust the path to your User model

const router = express.Router();
const secret = "your_jwt_secret"; // Use a secure secret key

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

// Endpoint to send verification email
router.post('/sendVerificationEmail', async (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, secret, { expiresIn: '1h' });

  const url = `http://localhost:3000/verifyEmail?token=${token}`;

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Click this link to verify your email: ${url}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send('Verification email sent');
  });
});

// Endpoint to verify email token
router.get('/verifyEmail', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, secret);
    await User.updateOne({ email: decoded.email }, { emailVerified: true });
    res.status(200).send('Email verified successfully');
  } catch (error) {
    res.status(400).send('Invalid or expired token');
  }
});

module.exports = router;
