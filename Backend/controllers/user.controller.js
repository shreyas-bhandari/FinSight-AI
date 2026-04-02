const User = require('../models/User');

// @desc    Get current logged in user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    // Prevent updating password via this route
    const fieldsToUpdate = { ...req.body };
    if (fieldsToUpdate.password) {
      // Actually we could allow it since it's hashed in pre-save
      // but findByIdAndUpdate doesn't trigger pre-save hooks easily.
      // So handling password update requires .save(). Let's handle it manually.
      
      const user = await User.findById(req.user.id);
      Object.assign(user, req.body);
      await user.save();
      
      return res.status(200).json({ success: true, data: user });
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
};
