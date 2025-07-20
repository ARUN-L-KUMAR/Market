const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { io } = require('../utils/socket');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user);
    
    // Emit to admin room for dashboard updates (if socket is available)
    if (io) {
      io.to('adminRoom').emit('userActivity', {
        type: 'USER_REGISTERED',
        userId: user._id,
        userName: user.name,
        action: 'registered',
        timestamp: new Date()
      });
    }
    
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user);
    
    // Emit to admin room for dashboard updates (if socket is available)
    if (io) {
      io.to('adminRoom').emit('userActivity', {
        type: 'USER_LOGIN',
        userId: user._id,
        userName: user.name,
        action: 'logged in',
        timestamp: new Date()
      });
    }
    
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
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

// Add these functions to auth.controller.js
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // Send email with reset token (implement email service)
    // ...
    
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
      
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};