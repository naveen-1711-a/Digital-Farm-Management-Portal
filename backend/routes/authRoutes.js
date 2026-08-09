const express = require('express');
const multer = require('multer');
const path = require('path');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── Multer – File Upload Config ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed'));
};

// No file size limit
const upload = multer({ storage, fileFilter });

const uploadFields = upload.fields([
  { name: 'ownerPhoto', maxCount: 1 },
  { name: 'farmPhoto', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'scheduleOfProperty', maxCount: 1 },
]);

// ── Multer error wrapper → returns clean JSON instead of server crash ──────────
const handleUpload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ── Routes ────────────────────────────────────────────────────────────────────
router.post('/register', handleUpload, register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
