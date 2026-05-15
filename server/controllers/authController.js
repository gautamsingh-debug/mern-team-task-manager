const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/signup
// SECURITY: Role is ALWAYS "member" — no one can self-promote to admin via signup
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "member", // Always member — admin promotion is a separate admin-only action
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/users — returns all users for assignment dropdowns
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("name email role avatar");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile — update own name and avatar
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty." });
      }
      updates.name = name.trim();
    }

    if (avatar !== undefined) {
      // Validate avatar size — limit to ~200KB base64
      if (avatar && avatar.length > 300000) {
        return res.status(400).json({ message: "Avatar image is too large. Please use an image under 200KB." });
      }
      updates.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password — change own password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save(); // triggers pre-save hash

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/auth/users/:id — admin deletes a user
exports.deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent self-deletion
    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    await User.findByIdAndDelete(req.params.id);

    // Also remove user from all project memberships
    const Project = require("../models/Project");
    await Project.updateMany(
      { members: req.params.id },
      { $pull: { members: req.params.id } }
    );

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/users/:id/role — admin promotes/demotes a user
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'member'." });
    }

    // Prevent self-role change
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};
