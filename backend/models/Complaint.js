const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'Parking', 'Noise', 'Internet', 'Other']
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  photo: {
    type: String  // stores filename/path
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statusHistory: [statusHistorySchema],
  isOverdue: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

// Virtual for days open
complaintSchema.virtual('daysOpen').get(function() {
  const end = this.resolvedAt || new Date();
  return Math.floor((end - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Complaint', complaintSchema);
