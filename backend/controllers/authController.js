const User = require('../models/User');
const bcrypt = require('bcrypt');
const TokenFactory = require('../utils/TokenFactory'); // Factory for tokens
const UserFactory = require('../patterns/UserFactory'); // Factory for users

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });

    // ✅ Wrap in Factory → OOP user
    const appUser = UserFactory.create(user);

    res.status(201).json({
      id: appUser.id,
      name: appUser.name,
      email: appUser.email,
      role: appUser.role,
      canManageInventory: appUser.canManageInventory(), // polymorphism
      token: TokenFactory.createToken(appUser.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // ✅ Wrap in Factory → OOP user
      const appUser = UserFactory.create(user);

      res.json({
        id: appUser.id,
        name: appUser.name,
        email: appUser.email,
        role: appUser.role,
        canManageInventory: appUser.canManageInventory(),
        token: TokenFactory.createToken(appUser.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Wrap in Factory
    const appUser = UserFactory.create(user);

    res.status(200).json({
      id: appUser.id,
      name: appUser.name,
      email: appUser.email,
      role: appUser.role,
      canManageInventory: appUser.canManageInventory(),
      university: user.university,
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, university, address } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.university = university || user.university;
    user.address = address || user.address;

    const updatedUser = await user.save();

    // ✅ Wrap updated user in Factory
    const appUser = UserFactory.create(updatedUser);

    res.json({
      id: appUser.id,
      name: appUser.name,
      email: appUser.email,
      role: appUser.role,
      canManageInventory: appUser.canManageInventory(),
      university: appUser.university,
      address: appUser.address,
      token: TokenFactory.createToken(appUser.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
