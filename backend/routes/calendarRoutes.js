const express = require('express');
const router = express.Router();
const { getEvents, addEvent, deleteEvent } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getEvents)
  .post(protect, addEvent);

router.route('/:id')
  .delete(protect, deleteEvent);

module.exports = router;
