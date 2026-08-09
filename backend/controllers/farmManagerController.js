const User = require('../models/User');

const addFarmManager = async (req, res) => {
  try {
    const {
      fullName, employeeId, gender, dob, aadhaarNumber, email, phone, emergencyContact,
      joiningDate, employmentType, assignedSheds, shift, address, state, district, pinCode,
      username, accountEmail, password, confirmPassword, permissions, status
    } = req.body;

    // Validate required fields
    if (!fullName || !accountEmail || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Full name, account email, phone, and password are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ ownerEmail: accountEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this account email already exists.' });
    }

    // Create the manager — map fields correctly to User schema
    const newManager = await User.create({
      ownerName: fullName,
      ownerEmail: accountEmail.toLowerCase(),
      ownerPhone: phone,
      aadhaarNumber: aadhaarNumber || undefined,
      farmAddress: address,
      state,
      district,
      pinCode,

      // Manager-specific fields
      farmId: req.user._id,          // link to the Farm Owner who created this manager
      employeeId,
      gender,
      dob: dob || undefined,
      emergencyContact,
      joiningDate: joiningDate || undefined,
      employmentType,
      assignedSheds: Array.isArray(assignedSheds) ? assignedSheds : [],
      shift,
      permissions: permissions || {},

      password,
      role: 'farm_manager',
      status: status === 'Active' ? 'approved' : 'pending',
    });

    res.status(201).json({
      success: true,
      message: `Farm Manager "${fullName}" created successfully! They can now log in with ${accountEmail}.`,
      manager: {
        id: newManager._id,
        name: newManager.ownerName,
        email: newManager.ownerEmail,
        role: newManager.role,
        status: newManager.status,
      }
    });
  } catch (error) {
    console.error('Add Farm Manager Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A user with this email or Aadhaar number already exists.' });
    }

    res.status(500).json({ success: false, message: 'Failed to create Farm Manager', error: error.message });
  }
};

const getFarmManagers = async (req, res) => {
  try {
    const managers = await User.find({ farmId: req.user._id, role: 'farm_manager' }).select('-password');
    res.status(200).json({ success: true, managers });
  } catch (error) {
    console.error('Get Farm Managers Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Farm Managers' });
  }
};

module.exports = { addFarmManager, getFarmManagers };
