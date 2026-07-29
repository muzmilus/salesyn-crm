const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationService');

async function getFollowUps(req, res, next) {
  try {
    const { status, assignedUserId, leadId, customerId, filter, page = 1, limit = 50 } = req.query;

    const where = {};

    if (req.user.role === 'SALES_EXECUTIVE') {
      where.assignedUserId = req.user.id;
    } else if (assignedUserId) {
      where.assignedUserId = assignedUserId;
    }

    if (status) where.status = status;
    if (leadId) where.leadId = leadId;
    if (customerId) where.customerId = customerId;

    const now = new Date();

    if (filter === 'upcoming') {
      where.status = 'Scheduled';
      where.date = { gte: now };
    } else if (filter === 'overdue') {
      where.status = 'Scheduled';
      where.date = { lt: now };
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [followUps, total] = await Promise.all([
      prisma.followUp.findMany({
        where,
        take,
        skip,
        orderBy: { date: 'asc' },
        include: {
          assignedUser: { select: { id: true, name: true, avatar: true } },
          lead: { select: { id: true, name: true, company: true } },
          customer: { select: { id: true, name: true, company: true } }
        }
      }),
      prisma.followUp.count({ where })
    ]);

    return successResponse(res, {
      followUps,
      pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) }
    }, 'Follow-ups retrieved');
  } catch (error) {
    next(error);
  }
}

async function createFollowUp(req, res, next) {
  try {
    const { title, type, date, time, notes, assignedUserId, leadId, customerId } = req.body;

    if (!title || !date) {
      return errorResponse(res, 'Follow-up title and date are required', 400);
    }

    const assignedId = assignedUserId || req.user.id;

    const followUp = await prisma.followUp.create({
      data: {
        title,
        type: type || 'Call',
        date: new Date(date),
        time: time || null,
        notes: notes || null,
        status: 'Scheduled',
        assignedUserId: assignedId,
        leadId: leadId || null,
        customerId: customerId || null
      },
      include: {
        assignedUser: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'FOLLOWUP_SCHEDULED',
      entityType: 'FollowUp',
      entityId: followUp.id,
      details: `Scheduled follow-up "${title}" for ${new Date(date).toLocaleDateString()}`
    });

    if (assignedId !== req.user.id) {
      await createNotification({
        userId: assignedId,
        title: 'New Follow-up Scheduled',
        message: `You have a new follow-up: "${title}" scheduled for ${new Date(date).toLocaleDateString()}`,
        type: 'INFO',
        link: '/follow-ups'
      });
    }

    return successResponse(res, { followUp }, 'Follow-up scheduled successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateFollowUp(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.followUp.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Follow-up not found', 404);
    }

    const { title, type, date, time, notes, status, assignedUserId } = req.body;

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        type: type !== undefined ? type : existing.type,
        date: date ? new Date(date) : existing.date,
        time: time !== undefined ? time : existing.time,
        notes: notes !== undefined ? notes : existing.notes,
        status: status !== undefined ? status : existing.status,
        assignedUserId: assignedUserId !== undefined ? assignedUserId : existing.assignedUserId
      },
      include: {
        assignedUser: { select: { id: true, name: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'FOLLOWUP_UPDATED',
      entityType: 'FollowUp',
      entityId: id,
      details: `Updated follow-up "${updated.title}" status to ${updated.status}`
    });

    return successResponse(res, { followUp: updated }, 'Follow-up updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteFollowUp(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.followUp.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Follow-up not found', 404);
    }

    await prisma.followUp.delete({ where: { id } });
    return successResponse(res, null, 'Follow-up deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp
};
