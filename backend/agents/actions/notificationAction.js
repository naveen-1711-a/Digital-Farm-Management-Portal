/**
 * notificationAction.js
 * Creates Notification documents in the database.
 * Used by the action executor to alert managers/admins.
 */
const Notification = require('../../models/Notification');
const User = require('../../models/User');

/**
 * Notify the farm manager(s) about a suspicious event.
 */
async function notifyManager({ farmId, incidentId, domain, riskScore, severity, description }) {
  // Find all farm managers for this farm
  const managers = await User.find({
    farmId,
    role: 'farm_manager',
    status: 'Active',
  }).select('_id').lean();

  const notifications = managers.map(m => ({
    recipient: m._id,
    farm: farmId,
    type: 'Integrity Alert',
    title: `🔍 ${severity} Integrity Alert — ${domain}`,
    message: `Incident ${incidentId}: ${description} | Risk Score: ${riskScore}/100`,
    priority: severity === 'Critical' || severity === 'High' ? 'Critical' : 'High',
    isRead: false,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return { notifiedCount: notifications.length };
}

/**
 * Notify the farm admin about a high-risk event.
 */
async function notifyAdmin({ farmId, incidentId, domain, riskScore, severity, description }) {
  const admin = await User.findById(farmId).select('_id').lean();
  if (!admin) return { notifiedCount: 0 };

  await Notification.create({
    recipient: admin._id,
    farm: farmId,
    type: 'Integrity Alert',
    title: `🚨 ${severity} Farm Integrity Alert — ${domain}`,
    message: `Incident ${incidentId}: ${description} | Risk Score: ${riskScore}/100 | Requires immediate attention`,
    priority: 'Critical',
    isRead: false,
  });

  return { notifiedCount: 1 };
}

module.exports = { notifyManager, notifyAdmin };
