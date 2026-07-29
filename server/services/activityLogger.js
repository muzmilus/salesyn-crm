const prisma = require('../utils/prisma');

async function logActivity({ userId, action, entityType, entityId, details }) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: typeof details === 'object' ? JSON.stringify(details) : details
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

module.exports = { logActivity };
