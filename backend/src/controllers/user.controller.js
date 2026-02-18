const User = require('../models/user.model');
const Order = require('../models/order.model');
const { deleteImage } = require('../utils/cloudinary');

// Get user stats for profile overview
exports.getUserStats = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    const Wishlist = require('../models/wishlist.model');
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const totalSaved = 0; // Placeholder — no discount tracking yet
    const wishlistItems = wishlist ? wishlist.products.length : 0;
    const loyaltyPoints = Math.floor(totalSpent / 10); // Simple: 1 point per ₹10 spent

    res.status(200).json({
      totalOrders,
      totalSpent,
      totalSaved,
      wishlistItems,
      loyaltyPoints
    });
  } catch (err) {
    next(err);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const oldUser = await User.findById(req.user.id);
    if (!oldUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    // If a new avatar is provided, clean up the old one from Cloudinary if it exists
    if (avatar !== undefined && oldUser.avatar && oldUser.avatar !== avatar) {
      deleteImage(oldUser.avatar).catch(err => {
        console.error(`Background avatar cleanup failed for user ${req.user.id}:`, err.message);
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Get user addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    res.status(200).json(user.addresses || []);
  } catch (err) {
    next(err);
  }
};

// Add new address
exports.addAddress = async (req, res, next) => {
  try {
    const { type, fullName, address, city, state, zipCode, country, phone, isDefault } = req.body;

    if (!fullName || !address || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: 'Full name, address, city, state, zip code, and country are required' });
    }

    const user = await User.findById(req.user.id);

    // If this is set as default, make all other addresses non-default
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      type: type || 'home',
      fullName,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: isDefault || user.addresses.length === 0 // First address is default
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(user.addresses[user.addresses.length - 1]);
  } catch (err) {
    next(err);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { type, fullName, address, city, state, zipCode, country, phone, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    const addressDoc = user.addresses.id(addressId);

    if (!addressDoc) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is set as default, make all other addresses non-default
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    addressDoc.type = type || addressDoc.type;
    addressDoc.fullName = fullName || addressDoc.fullName;
    addressDoc.address = address || addressDoc.address;
    addressDoc.city = city || addressDoc.city;
    addressDoc.state = state || addressDoc.state;
    addressDoc.zipCode = zipCode || addressDoc.zipCode;
    addressDoc.country = country || addressDoc.country;
    addressDoc.phone = phone !== undefined ? phone : addressDoc.phone;
    addressDoc.isDefault = isDefault !== undefined ? isDefault : addressDoc.isDefault;

    await user.save();

    res.status(200).json(user.addresses);
  } catch (err) {
    next(err);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If deleting the default address and there are other addresses, make the first one default
    if (address.isDefault && user.addresses.length > 1) {
      const remainingAddresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
      if (remainingAddresses.length > 0) {
        remainingAddresses[0].isDefault = true;
      }
    }

    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json(user.addresses);
  } catch (err) {
    next(err);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
