const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationService');

const PIPELINE_STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost'
];

async function getOpportunities(req, res, next) {
  try {
    const { stage, assignedToId, customerId, search, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};

    if (req.user.role === 'SALES_EXECUTIVE') {
      where.assignedToId = req.user.id;
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (stage) where.stage = stage;
    if (customerId) where.customerId = customerId;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { company: { contains: search } } }
      ];
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        take,
        skip,
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
        include: {
          customer: { select: { id: true, name: true, company: true } },
          lead: { select: { id: true, name: true, company: true } },
          assignedTo: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.opportunity.count({ where })
    ]);

    return successResponse(res, {
      opportunities,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    }, 'Opportunities retrieved');
  } catch (error) {
    next(error);
  }
}

async function getPipeline(req, res, next) {
  try {
    const { assignedToId } = req.query;
    const where = {};

    if (req.user.role === 'SALES_EXECUTIVE') {
      where.assignedToId = req.user.id;
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, company: true } },
        lead: { select: { id: true, name: true, company: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const pipeline = PIPELINE_STAGES.reduce((acc, stage) => {
      const stageDeals = opportunities.filter(o => o.stage === stage);
      const totalValue = stageDeals.reduce((sum, o) => sum + (o.value || 0), 0);
      acc[stage] = {
        stage,
        count: stageDeals.length,
        totalValue,
        deals: stageDeals
      };
      return acc;
    }, {});

    const totalPipelineValue = opportunities
      .filter(o => o.stage !== 'Lost')
      .reduce((sum, o) => sum + (o.value || 0), 0);

    const wonValue = opportunities
      .filter(o => o.stage === 'Won')
      .reduce((sum, o) => sum + (o.value || 0), 0);

    return successResponse(res, {
      pipeline,
      summary: {
        totalDeals: opportunities.length,
        totalPipelineValue,
        wonValue,
        stages: PIPELINE_STAGES
      }
    }, 'Sales pipeline fetched');
  } catch (error) {
    next(error);
  }
}

async function getOpportunityById(req, res, next) {
  try {
    const { id } = req.params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: true,
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    if (!opportunity) {
      return errorResponse(res, 'Opportunity not found', 404);
    }

    return successResponse(res, { opportunity }, 'Opportunity details fetched');
  } catch (error) {
    next(error);
  }
}

async function createOpportunity(req, res, next) {
  try {
    const { title, customerId, leadId, assignedToId, value, probability, stage, expectedCloseDate, description } = req.body;

    if (!title) {
      return errorResponse(res, 'Opportunity title is required', 400);
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        customerId: customerId || null,
        leadId: leadId || null,
        assignedToId: assignedToId || req.user.id,
        value: parseFloat(value) || 0,
        probability: probability !== undefined ? parseInt(probability) : 50,
        stage: stage || 'New Lead',
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        description: description || null
      },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        lead: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'OPPORTUNITY_CREATED',
      entityType: 'Opportunity',
      entityId: opportunity.id,
      details: `Created deal "${opportunity.title}" valued at $${opportunity.value}`
    });

    return successResponse(res, { opportunity }, 'Opportunity created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateOpportunity(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.opportunity.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Opportunity not found', 404);
    }

    const { title, customerId, leadId, assignedToId, value, probability, stage, expectedCloseDate, description } = req.body;

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        customerId: customerId !== undefined ? customerId : existing.customerId,
        leadId: leadId !== undefined ? leadId : existing.leadId,
        assignedToId: assignedToId !== undefined ? assignedToId : existing.assignedToId,
        value: value !== undefined ? parseFloat(value) : existing.value,
        probability: probability !== undefined ? parseInt(probability) : existing.probability,
        stage: stage !== undefined ? stage : existing.stage,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : existing.expectedCloseDate,
        description: description !== undefined ? description : existing.description
      },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'OPPORTUNITY_UPDATED',
      entityType: 'Opportunity',
      entityId: id,
      details: `Updated opportunity "${updatedOpportunity.title}"`
    });

    return successResponse(res, { opportunity: updatedOpportunity }, 'Opportunity updated successfully');
  } catch (error) {
    next(error);
  }
}

async function updateOpportunityStage(req, res, next) {
  try {
    const { id } = req.params;
    const { stage, probability } = req.body;

    if (!stage) {
      return errorResponse(res, 'Stage is required', 400);
    }

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Opportunity not found', 404);
    }

    let defaultProb = existing.probability;
    if (probability !== undefined) {
      defaultProb = parseInt(probability);
    } else {
      if (stage === 'Won') defaultProb = 100;
      else if (stage === 'Lost') defaultProb = 0;
      else if (stage === 'Negotiation') defaultProb = 80;
      else if (stage === 'Proposal Sent') defaultProb = 65;
      else if (stage === 'Qualified') defaultProb = 50;
      else if (stage === 'Contacted') defaultProb = 25;
      else if (stage === 'New Lead') defaultProb = 10;
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: { stage, probability: defaultProb },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    let action = 'STAGE_CHANGED';
    let notifType = 'INFO';
    if (stage === 'Won') {
      action = 'DEAL_WON';
      notifType = 'SUCCESS';
    } else if (stage === 'Lost') {
      action = 'DEAL_LOST';
      notifType = 'WARNING';
    }

    await logActivity({
      userId: req.user.id,
      action,
      entityType: 'Opportunity',
      entityId: id,
      details: `Moved deal "${existing.title}" from ${existing.stage} to ${stage}`
    });

    if (existing.assignedToId) {
      await createNotification({
        userId: existing.assignedToId,
        title: `Opportunity Stage: ${stage}`,
        message: `Deal "${existing.title}" was moved to stage: ${stage}`,
        type: notifType,
        link: `/opportunities`
      });
    }

    return successResponse(res, { opportunity: updatedOpportunity }, `Opportunity stage updated to ${stage}`);
  } catch (error) {
    next(error);
  }
}

async function deleteOpportunity(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.opportunity.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Opportunity not found', 404);
    }

    await prisma.opportunity.delete({ where: { id } });

    await logActivity({
      userId: req.user.id,
      action: 'OPPORTUNITY_DELETED',
      entityType: 'Opportunity',
      entityId: id,
      details: `Deleted opportunity "${existing.title}"`
    });

    return successResponse(res, null, 'Opportunity deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOpportunities,
  getPipeline,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStage,
  deleteOpportunity
};
