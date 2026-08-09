const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true
  },
  assignee: {
    type: String,
    required: true
  },
  shed: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Health', 'Maintenance', 'Repair', 'Feeding', 'Logistics', 'Other'],
    default: 'Maintenance'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue', 'On Hold', 'Cancelled'],
    default: 'Pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  estTime: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
