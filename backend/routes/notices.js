const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const { sendImportantNoticeEmail } = require('../utils/email');

// Get all notices (both roles)
router.get('/', auth, async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('postedBy', 'name')
      .sort({ isImportant: -1, createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Post a notice
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, content, isImportant } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const notice = new Notice({
      title,
      content,
      isImportant: isImportant || false,
      postedBy: req.user._id
    });

    await notice.save();
    await notice.populate('postedBy', 'name');

    // If important, email all residents
    if (isImportant) {
      const residents = await User.find({ role: 'resident' }, 'name email');
      sendImportantNoticeEmail(residents, notice);
    }

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete a notice
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
