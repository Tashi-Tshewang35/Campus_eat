const crypto = require('crypto');
const User = require('../models/User');

const EMAIL_SUFFIX = '.sherubtse@rub.edu.bt';

exports.showSignup = (req, res) => res.render('signup', { title: 'Sign Up', error: null });

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('signup', { title: 'Sign Up', error: 'All fields are required.' });
  }

  if (!email.toLowerCase().endsWith(EMAIL_SUFFIX)) {
    return res.render('signup', {
      title: 'Sign Up',
      error: `Please use your Sherubtse College email, ending in ${EMAIL_SUFFIX}.`,
    });
  }

  const existing = await User.findByEmail(email);
  if (existing) {
    return res.render('signup', { title: 'Sign Up', error: 'That email is already registered.' });
  }

  const verificationToken = crypto.randomBytes(20).toString('hex');
  await User.createUser({ name, email, password, verificationToken });
  await sendVerificationEmail(email, verificationToken);

  res.render('signup-success', { title: 'Check Your Email', email });
};

exports.verifyEmail = async (req, res) => {
  const user = await User.markVerified(req.params.token);
  if (!user) return res.status(400).send('Invalid or expired verification link.');
  res.render('verify-success', { title: 'Verified', user });
};

exports.showLogin = (req, res) => res.render('login', { title: 'Log In', error: null });

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);

  if (!user || !(await User.verifyPassword(password, user.password_hash))) {
    return res.render('login', { title: 'Log In', error: 'Incorrect email or password.' });
  }
  if (!user.is_verified) {
    return res.render('login', { title: 'Log In', error: 'Please verify your email before logging in.' });
  }

  req.session.user = { id: user.id, name: user.name, role: user.role };

  if (user.role === 'superadmin') return res.redirect('/superadmin/dashboard');
  if (user.role === 'admin') return res.redirect('/admin/dashboard');
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};

const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/mailer');

exports.showForgotPassword = (req, res) =>
  res.render('forgot-password', { title: 'Forgot Password', message: null });

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findByEmail(email);

  if (user) {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await User.setResetToken(email, token, expires);
    await sendPasswordResetEmail(email, token);
  }

  res.render('forgot-password', {
    title: 'Forgot Password',
    message: 'If an account exists with that email, a reset link has been sent.',
  });
};

exports.showResetPassword = async (req, res) => {
  const user = await User.findByResetToken(req.params.token);
  if (!user) return res.status(400).send('This reset link is invalid or has expired.');
  res.render('reset-password', { title: 'Reset Password', token: req.params.token, error: null });
};

exports.resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const user = await User.findByResetToken(req.params.token);

  if (!user) return res.status(400).send('This reset link is invalid or has expired.');

  if (!password || password.length < 6 || password !== confirmPassword) {
    return res.render('reset-password', {
      title: 'Reset Password',
      token: req.params.token,
      error: 'Passwords must match and be at least 6 characters.',
    });
  }

  await User.resetPassword(user.id, password);
  res.redirect('/login');
};
