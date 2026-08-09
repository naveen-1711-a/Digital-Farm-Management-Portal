const CalendarEvent = require('../models/CalendarEvent');

const getEvents = async (req, res) => {
  try {
    const farmId = req.user.farmId || req.user._id;
    const events = await CalendarEvent.find({ farmId }).sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar events', error: error.message });
  }
};

const addEvent = async (req, res) => {
  try {
    const { title, date, type, description } = req.body;
    const farmId = req.user.farmId || req.user._id;

    const newEvent = await CalendarEvent.create({
      farmId,
      title,
      date,
      type,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Event added successfully', event: newEvent });
  } catch (error) {
    console.error('Add Event Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add event', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership
    const farmId = req.user.farmId || req.user._id;
    if (event.farmId.toString() !== farmId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete Event Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
};

module.exports = { getEvents, addEvent, deleteEvent };
