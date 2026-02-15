const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { io } = require('../utils/socket');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken
    });

    console.log(`[Auth] New user registered: ${email}. Attempting to send verification email...`);

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (err) {
      console.error('Failed to send verification email:', err.message);
      // We don't delete the user, but we inform the client that email sending failed
      return res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: false },
        message: 'Registration successful, but we failed to send a verification email. Please try resending it from the login page.'
      });
    }

    // Emit to admin room for dashboard updates
    if (io) {
      io.to('adminRoom').emit('userActivity', {
        type: 'USER_REGISTERED',
        userId: user._id,
        userName: user.name,
        action: 'registered',
        timestamp: new Date()
      });
    }

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: false },
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Block unverified users from logging in
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Your email is not verified. Please check your inbox or resend the verification email.',
        isEmailVerified: false,
        email: user.email
      });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    // Emit to admin room for dashboard updates
    if (io) {
      io.to('adminRoom').emit('userActivity', {
        type: 'USER_LOGIN',
        userId: user._id,
        userName: user.name,
        action: 'logged in',
        timestamp: new Date()
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// Verify email with token
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({ emailVerificationToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email is already verified' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

// Resend verification email
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether account exists
      return res.status(200).json({ message: 'If an account with that email exists, a verification email has been sent.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    await user.save({ validateBeforeSave: false });

    console.log(`[Auth] Resending verification email to: ${email}`);
    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.status(200).json({ message: 'If an account with that email exists, a verification email has been sent.' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailErr) {
      // If email fails, clear the token and report error
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Error sending password reset email. Please try again later.' });
    }

    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set password directly — the pre('save') hook will hash it
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};