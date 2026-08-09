const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ── Helper: Generate JWT ───────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── @route   POST /api/auth/register
// ── @desc    Register a new farm admin
// ── @access  Public
const register = async (req, res) => {
  try {
    const {
      // Farm Information
      farmName, farmType, registrationNumber, farmAddress,
      state, district, pinCode, gpsLocation, farmEmail, farmPhone,
      // Farm Owner
      ownerName, aadhaarNumber, ownerEmail, ownerPhone,
      // Farm Details
      numberOfSheds, approxNumberOfAnimals, farmArea, internetAvailable,
      // Account
      password, confirmPassword,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({
      $or: [{ ownerEmail }, { registrationNumber }, { aadhaarNumber }],
    });

    if (existingUser) {
      let field = 'Account';
      if (existingUser.ownerEmail === ownerEmail) field = 'Email';
      else if (existingUser.registrationNumber === registrationNumber) field = 'Registration number';
      else if (existingUser.aadhaarNumber === aadhaarNumber) field = 'Aadhaar number';
      return res.status(409).json({ success: false, message: `${field} already exists` });
    }

    // ── Handle uploaded file paths (set by multer middleware) ─────
    const ownerPhoto = req.files?.ownerPhoto?.[0]?.path || null;
    const farmPhoto = req.files?.farmPhoto?.[0]?.path || null;
    const aadhaarCard = req.files?.aadhaarCard?.[0]?.path || null;
    const scheduleOfProperty = req.files?.scheduleOfProperty?.[0]?.path || null;

    // ── Create user ───────────────────────────────────────────────
    const user = await User.create({
      farmName, farmType, registrationNumber, farmAddress,
      state, district, pinCode, gpsLocation, farmEmail, farmPhone,
      ownerName, aadhaarNumber, ownerEmail, ownerPhone,
      ownerPhoto, farmPhoto, aadhaarCard, scheduleOfProperty,
      numberOfSheds: Number(numberOfSheds),
      approxNumberOfAnimals: Number(approxNumberOfAnimals),
      farmArea, internetAvailable,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Awaiting admin approval.',
      token,
      user: {
        id: user._id,
        farmName: user.farmName,
        ownerName: user.ownerName,
        ownerEmail: user.ownerEmail,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    
    // Handle Mongoose Validation Errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    
    // Handle unexpected duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A record with that information already exists.' });
    }

    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── @route   POST /api/auth/login
// ── @desc    Login existing user
// ── @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // ── Check for Overall Admin Credentials from .env ─────────────────────────
    if (email === process.env.ADMIN_EMAIL) {
      if (role !== 'Overall Admin') {
        return res.status(401).json({ success: false, message: 'Invalid role selected for these credentials.' });
      }
      
      if (password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ id: 'overall_admin_id', role: 'overall_admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({
          success: true,
          message: 'Overall Admin login successful',
          token,
          user: {
            id: 'overall_admin_id',
            ownerName: 'System Admin',
            ownerEmail: email,
            role: 'overall_admin',
            status: 'approved'
          },
        });
      }
    }

    const user = await User.findOne({ ownerEmail: email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Role Verification
    if (role === 'Overall Admin' && user.role !== 'overall_admin') {
      return res.status(401).json({ success: false, message: 'Invalid role selected for these credentials.' });
    }
    if (role === 'Farm Admin' && user.role !== 'farm_admin') {
      return res.status(401).json({ success: false, message: 'Invalid role selected for these credentials.' });
    }
    if (role === 'Manager' && user.role !== 'farm_manager' && user.role !== 'manager') {
      return res.status(401).json({ success: false, message: 'Invalid role selected for these credentials.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Account is pending admin approval' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Account has been rejected' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        farmName: user.farmName,
        ownerName: user.ownerName,
        ownerEmail: user.ownerEmail,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── @route   GET /api/auth/me
// ── @desc    Get logged-in user profile
// ── @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
