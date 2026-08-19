/**
 * taskAction.js
 * Creates Task documents for investigation follow-up.
 * Reuses the existing Task model.
 */
const Task = require('../../models/Task');

/**
 * Create a monitoring task for medium-risk incidents.
 */
async function createMonitoringTask({ farmId, incidentId, domain, riskScore, description }) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3); // 3 days to investigate

  return Task.create({
    title: `Monitor: ${domain} Anomaly — ${incidentId}`,
    desc: `AI detected a ${domain.toLowerCase()} anomaly (Risk: ${riskScore}/100). Please review and monitor: ${description}`,
    assignee: 'Farm Manager',
    shed: 'All Sheds',
    category: 'Health',
    priority: riskScore >= 70 ? 'High' : 'Medium',
    status: 'Pending',
    startDate: new Date(),
    dueDate,
  });
}

/**
 * Create an investigation task for high-risk incidents.
 */
async function createInvestigationTask({ farmId, incidentId, domain, riskScore, description }) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1); // 1 day — urgent

  return Task.create({
    title: `INVESTIGATE: ${domain} Integrity Issue — ${incidentId}`,
    desc: `URGENT: AI Farm Integrity Agent flagged a ${domain.toLowerCase()} anomaly with Risk Score ${riskScore}/100. Investigation required immediately. Details: ${description}`,
    assignee: 'Farm Admin',
    shed: 'All Sheds',
    category: 'Other',
    priority: 'Critical',
    status: 'Pending',
    startDate: new Date(),
    dueDate,
  });
}

module.exports = { createMonitoringTask, createInvestigationTask };
