const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Settings = require('../models/Settings');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendComplaintStatusEmail } = require('../utils/email');
const { updateOverdueComplaints } = require('../utils/overdue');

// Resident: Create complaint
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      resident: req.user._id,
      photo: req.file ? req.file.path : null,
      statusHistory: [{
        status: 'Open',
        changedBy: req.user._id,
        note: 'Complaint raised'
      }]
    });

    await complaint.save();
    await complaint.populate('resident', 'name email apartmentNumber');
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resident: Get my complaints
router.get('/my', auth, async (req, res) => {
  try {
    await updateOverdueComplaints();
    const complaints = await Complaint.find({ resident: req.user._id })
      .populate('resident', 'name email apartmentNumber')
      .populate('statusHistory.changedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all complaints with filters
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    await updateOverdueComplaints();

    const { category, status, priority, startDate, endDate, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('resident', 'name email apartmentNumber')
      .populate('statusHistory.changedBy', 'name role')
      .sort({ isOverdue: -1, priority: -1, createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('resident', 'name email apartmentNumber')
      .populate('statusHistory.changedBy', 'name role');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Residents can only view their own
    if (req.user.role === 'resident' && complaint.resident._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update status and/or priority
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, priority, note } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('resident', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.status === 'Resolved') {
      return res.status(400).json({ message: 'Resolved complaints cannot be updated' });
    }

    let statusChanged = false;

    if (status && status !== complaint.status) {
      complaint.statusHistory.push({
        status,
        changedBy: req.user._id,
        note: note || null
      });
      complaint.status = status;
      statusChanged = true;

      if (status === 'Resolved') {
        complaint.resolvedAt = new Date();
        complaint.isOverdue = false;
      }
    }

    if (priority) complaint.priority = priority;

    await complaint.save();
    await complaint.populate('statusHistory.changedBy', 'name role');

    // Send email notification if status changed
    if (statusChanged && complaint.resident) {
      sendComplaintStatusEmail(complaint.resident, complaint, status, note);
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get/Set overdue threshold
router.get('/settings/overdue-threshold', auth, adminOnly, async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'overdueThresholdDays' });
    res.json({ days: setting ? setting.value : 7 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/overdue-threshold', auth, adminOnly, async (req, res) => {
  try {
    const { days } = req.body;
    if (!days || days < 1) return res.status(400).json({ message: 'Days must be at least 1' });

    await Settings.findOneAndUpdate(
      { key: 'overdueThresholdDays' },
      { key: 'overdueThresholdDays', value: parseInt(days) },
      { upsert: true, new: true }
    );

    res.json({ days: parseInt(days) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
