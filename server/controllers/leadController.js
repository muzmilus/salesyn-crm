const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { calculateLeadScore } = require('../services/leadScorer');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationService');

async function getLeads(req, res, next) {
  try {
    const { status, source, priority, scoreCategory, assignedToId, search, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};

    // Role-based visibility for Sales Executives (can only see assigned or created leads, unless specified otherwise)
    if (req.user.role === 'SALES_EXECUTIVE') {
      where.OR = [
        { assignedToId: req.user.id },
        { createdById: req.user.id }
      ];
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (status) where.status = status;
    if (source) where.source = source;
    if (priority) where.priority = priority;
    if (scoreCategory) where.scoreCategory = scoreCategory;

    if (search) {
      const searchFilter = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchFilter }];
        delete where.OR;
      } else {
        where.OR = searchFilter;
      }
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        take,
        skip,
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
        include: {
          assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
          createdBy: { select: { id: true, name: true } },
          _count: {
            select: {
              interactions: true,
              followUps: true
            }
          }
        }
      }),
      prisma.lead.count({ where })
    ]);

    return successResponse(res, {
      leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    }, 'Leads retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getLeadById(req, res, next) {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
        interactions: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { date: 'desc' }
        },
        followUps: {
          include: { assignedUser: { select: { id: true, name: true } } },
          orderBy: { date: 'asc' }
        },
        opportunities: {
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Permission check for Sales Executives
    if (req.user.role === 'SALES_EXECUTIVE' && lead.assignedToId !== req.user.id && lead.createdById !== req.user.id) {
      return errorResponse(res, 'Forbidden: You do not have permission to view this lead', 403);
    }

    return successResponse(res, { lead }, 'Lead details retrieved');
  } catch (error) {
    next(error);
  }
}

async function createLead(req, res, next) {
  try {
    const { name, company, email, phone, source, status, priority, estimatedValue, assignedToId, notes } = req.body;

    if (!name || !email) {
      return errorResponse(res, 'Lead name and email are required', 400);
    }

    const initialLead = {
      name,
      company,
      email,
      phone,
      source: source || 'Website',
      status: status || 'New',
      priority: priority || 'Medium',
      estimatedValue: parseFloat(estimatedValue) || 0
    };

    const { score, scoreCategory } = calculateLeadScore(initialLead, 0, 0);

    const lead = await prisma.lead.create({
      data: {
        ...initialLead,
        score,
        scoreCategory,
        notes,
        assignedToId: assignedToId || req.user.id,
        createdById: req.user.id
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'LEAD_CREATED',
      entityType: 'Lead',
      entityId: lead.id,
      details: `Created lead ${lead.name} (${lead.company || 'No company'})`
    });

    if (lead.assignedToId && lead.assignedToId !== req.user.id) {
      await createNotification({
        userId: lead.assignedToId,
        title: 'New Lead Assigned',
        message: `You have been assigned lead: ${lead.name}`,
        type: 'INFO',
        link: `/leads/${lead.id}`
      });
    }

    return successResponse(res, { lead }, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateLead(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.lead.findUnique({
      where: { id },
      include: { _count: { select: { interactions: true, followUps: true } } }
    });

    if (!existing) {
      return errorResponse(res, 'Lead not found', 404);
    }

    if (req.user.role === 'SALES_EXECUTIVE' && existing.assignedToId !== req.user.id && existing.createdById !== req.user.id) {
      return errorResponse(res, 'Forbidden: You cannot update this lead', 403);
    }

    const { name, company, email, phone, source, status, priority, estimatedValue, assignedToId, notes } = req.body;

    const updatedData = {
      name: name !== undefined ? name : existing.name,
      company: company !== undefined ? company : existing.company,
      email: email !== undefined ? email : existing.email,
      phone: phone !== undefined ? phone : existing.phone,
      source: source !== undefined ? source : existing.source,
      status: status !== undefined ? status : existing.status,
      priority: priority !== undefined ? priority : existing.priority,
      estimatedValue: estimatedValue !== undefined ? parseFloat(estimatedValue) : existing.estimatedValue,
      assignedToId: assignedToId !== undefined ? assignedToId : existing.assignedToId,
      notes: notes !== undefined ? notes : existing.notes
    };

    const { score, scoreCategory } = calculateLeadScore(
      updatedData,
      existing._count.interactions,
      existing._count.followUps
    );

    updatedData.score = score;
    updatedData.scoreCategory = scoreCategory;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updatedData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'LEAD_UPDATED',
      entityType: 'Lead',
      entityId: id,
      details: `Updated lead ${updatedLead.name}`
    });

    return successResponse(res, { lead: updatedLead }, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteLead(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Lead not found', 404);
    }

    await prisma.lead.delete({ where: { id } });

    await logActivity({
      userId: req.user.id,
      action: 'LEAD_DELETED',
      entityType: 'Lead',
      entityId: id,
      details: `Deleted lead ${existing.name}`
    });

    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
}

async function updateLeadStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }

    const existing = await prisma.lead.findUnique({
      where: { id },
      include: { _count: { select: { interactions: true, followUps: true } } }
    });

    if (!existing) {
      return errorResponse(res, 'Lead not found', 404);
    }

    const { score, scoreCategory } = calculateLeadScore(
      { ...existing, status },
      existing._count.interactions,
      existing._count.followUps
    );

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status, score, scoreCategory }
    });

    await logActivity({
      userId: req.user.id,
      action: 'LEAD_STATUS_CHANGED',
      entityType: 'Lead',
      entityId: id,
      details: `Changed lead status from ${existing.status} to ${status}`
    });

    return successResponse(res, { lead: updatedLead }, `Lead status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

async function assignLead(req, res, next) {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    if (!assignedToId) {
      return errorResponse(res, 'assignedToId is required', 400);
    }

    const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee) {
      return errorResponse(res, 'Assigned user does not exist', 404);
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { assignedToId },
      include: { assignedTo: { select: { id: true, name: true, email: true } } }
    });

    await logActivity({
      userId: req.user.id,
      action: 'LEAD_ASSIGNED',
      entityType: 'Lead',
      entityId: id,
      details: `Assigned lead ${lead.name} to ${assignee.name}`
    });

    await createNotification({
      userId: assignedToId,
      title: 'Lead Reassigned',
      message: `Lead ${lead.name} has been assigned to you`,
      type: 'INFO',
      link: `/leads/${lead.id}`
    });

    return successResponse(res, { lead }, `Lead assigned to ${assignee.name}`);
  } catch (error) {
    next(error);
  }
}

async function convertLeadToCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { createOpportunity, opportunityTitle, address, city, state, country } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    if (lead.isConverted) {
      return errorResponse(res, 'This lead has already been converted to a customer', 400);
    }

    // 1. Create Customer record preserving lead data
    const customer = await prisma.customer.create({
      data: {
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        notes: lead.notes,
        assignedToId: lead.assignedToId,
        leadId: lead.id
      }
    });

    // 2. Create Opportunity if requested or default
    let opportunity = null;
    if (createOpportunity || lead.estimatedValue > 0) {
      opportunity = await prisma.opportunity.create({
        data: {
          title: opportunityTitle || `${lead.company || lead.name} - Deal`,
          customerId: customer.id,
          leadId: lead.id,
          assignedToId: lead.assignedToId || req.user.id,
          value: lead.estimatedValue || 10000,
          stage: 'Qualified',
          probability: 60,
          description: `Created automatically upon converting lead ${lead.name}`
        }
      });
    }

    // 3. Mark Lead as converted & Won
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        isConverted: true,
        convertedAt: new Date(),
        convertedCustomerId: customer.id,
        status: 'Won',
        score: 100,
        scoreCategory: 'Hot'
      }
    });

    // 4. Record Activity
    await logActivity({
      userId: req.user.id,
      action: 'LEAD_CONVERTED',
      entityType: 'Lead',
      entityId: lead.id,
      details: `Converted lead ${lead.name} to customer ${customer.name}`
    });

    if (lead.assignedToId) {
      await createNotification({
        userId: lead.assignedToId,
        title: 'Lead Converted to Customer',
        message: `Lead ${lead.name} was successfully converted to a Customer!`,
        type: 'SUCCESS',
        link: `/customers/${customer.id}`
      });
    }

    return successResponse(res, { customer, opportunity, lead: updatedLead }, 'Lead successfully converted to Customer');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  assignLead,
  convertLeadToCustomer
};
