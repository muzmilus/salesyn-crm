const prisma = require('../utils/prisma');

async function createNotification({ userId, title, message, type = 'INFO', link = null }) {
  try {
    if (!userId) return null;
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        read: false
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

module.exports = { createNotification };
