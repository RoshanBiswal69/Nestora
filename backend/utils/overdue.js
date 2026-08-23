const Complaint = require('../models/Complaint');
const Settings = require('../models/Settings');

const getOverdueThreshold = async () => {
  const setting = await Settings.findOne({ key: 'overdueThresholdDays' });
  return setting ? setting.value : 7; // default 7 days
};

const updateOverdueComplaints = async () => {
  const thresholdDays = await getOverdueThreshold();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

  // Mark complaints as overdue if they are Open/In Progress and older than threshold
  await Complaint.updateMany(
    {
      status: { $in: ['Open', 'In Progress'] },
      createdAt: { $lte: cutoffDate },
      isOverdue: false
    },
    { $set: { isOverdue: true } }
  );

  // Unmark if resolved
  await Complaint.updateMany(
    { status: 'Resolved', isOverdue: true },
    { $set: { isOverdue: false } }
  );
};

module.exports = { getOverdueThreshold, updateOverdueComplaints };
