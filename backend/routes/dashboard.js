const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { auth, adminOnly } = require('../middleware/auth');
const { updateOverdueComplaints } = require('../utils/overdue');

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    await updateOverdueComplaints();

    const [
      totalComplaints,
      byStatus,
      byCategory,
      overdueCount,
      recentComplaints,
      byPriority
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Complaint.countDocuments({ isOverdue: true }),
      Complaint.find({ status: { $ne: 'Resolved' } })
        .populate('resident', 'name apartmentNumber')
        .sort({ isOverdue: -1, createdAt: -1 })
        .limit(5),
      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    // Flatten byStatus to object
    const statusMap = { Open: 0, 'In Progress': 0, Resolved: 0 };
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    const priorityMap = { Low: 0, Medium: 0, High: 0 };
    byPriority.forEach(p => { priorityMap[p._id] = p.count; });

    res.json({
      total: totalComplaints,
      byStatus: statusMap,
      byCategory: byCategory.map(c => ({ category: c._id, count: c.count })),
      byPriority: priorityMap,
      overdueCount,
      recentComplaints
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
