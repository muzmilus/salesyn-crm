const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { calculateLeadScore } = require('../services/leadScorer');
const { logActivity } = require('../services/activityLogger');

async function getInteractions(req, res, next) {
  try {
    const { leadId, customerId, type, page = 1, limit = 50 } = req.query;

    const where = {};
    if (leadId) where.leadId = leadId;
    if (customerId) where.customerId = customerId;
    if (type) where.type = type;

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [interactions, total] = await Promise.all([
      prisma.interaction.findMany({
        where,
        take,
        skip,
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          lead: { select: { id: true, name: true, company: true } },
          customer: { select: { id: true, name: true, company: true } }
        }
      }),
      prisma.interaction.count({ where })
    ]);

    return successResponse(res, {
      interactions,
      pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) }
    }, 'Interactions retrieved');
  } catch (error) {
    next(error);
  }
}

async function createInteraction(req, res, next) {
  try {
    const { type, subject, notes, outcome, date, leadId, customerId } = req.body;

    if (!type || !subject) {
      return errorResponse(res, 'Interaction type and subject are required', 400);
    }

    if (!leadId && !customerId) {
      return errorResponse(res, 'Interaction must be associated with either a lead or a customer', 400);
    }

    const interaction = await prisma.interaction.create({
      data: {
        type,
        subject,
        notes: notes || null,
        outcome: outcome || null,
        date: date ? new Date(date) : new Date(),
        userId: req.user.id,
        leadId: leadId || null,
        customerId: customerId || null
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    // If associated with a Lead, recalculate Lead score!
    if (leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { _count: { select: { interactions: true, followUps: true } } }
      });
      if (lead) {
        const { score, scoreCategory } = calculateLeadScore(lead, lead._count.interactions, lead._count.followUps);
        await prisma.lead.update({
          where: { id: leadId },
          data: { score, scoreCategory }
        });
      }
    }

    await logActivity({
      userId: req.user.id,
      action: 'INTERACTION_RECORDED',
      entityType: 'Interaction',
      entityId: interaction.id,
      details: `Recorded ${type}: "${subject}"`
    });

    return successResponse(res, { interaction }, 'Interaction recorded successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function deleteInteraction(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.interaction.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Interaction not found', 404);
    }

    await prisma.interaction.delete({ where: { id } });
    return successResponse(res, null, 'Interaction deleted');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInteractions,
  createInteraction,
  deleteInteraction
};
