const User = require('../models/user.model');

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email, phone },
      { new: true, runValidators: true }
    ).select('-password');
    
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
    
    res.status(201).json(user.addresses);
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
    addressDoc.fullName = fullName;
    addressDoc.address = address;
    addressDoc.city = city;
    addressDoc.state = state;
    addressDoc.zipCode = zipCode;
    addressDoc.country = country;
    addressDoc.phone = phone;
    addressDoc.isDefault = isDefault;
    
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
    
    const user = await User.findById(req.user.id);
    
    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
