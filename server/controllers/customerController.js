const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/activityLogger');

async function getCustomers(req, res, next) {
  try {
    const { assignedToId, search, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};

    if (req.user.role === 'SALES_EXECUTIVE') {
      where.assignedToId = req.user.id;
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } }
      ];
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        take,
        skip,
        orderBy: { [sortBy]: sortOrder.toLowerCase() },
        include: {
          assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
          _count: {
            select: {
              opportunities: true,
              interactions: true,
              followUps: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    return successResponse(res, {
      customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    }, 'Customers retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        opportunities: {
          orderBy: { createdAt: 'desc' },
          include: { assignedTo: { select: { id: true, name: true } } }
        },
        interactions: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { date: 'desc' }
        },
        followUps: {
          include: { assignedUser: { select: { id: true, name: true } } },
          orderBy: { date: 'asc' }
        },
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    if (req.user.role === 'SALES_EXECUTIVE' && customer.assignedToId !== req.user.id) {
      return errorResponse(res, 'Forbidden: You do not have permission to view this customer', 403);
    }

    return successResponse(res, { customer }, 'Customer details retrieved');
  } catch (error) {
    next(error);
  }
}

async function createCustomer(req, res, next) {
  try {
    const { name, company, email, phone, address, city, state, country, notes, assignedToId } = req.body;

    if (!name || !email) {
      return errorResponse(res, 'Customer name and email are required', 400);
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        company,
        email,
        phone,
        address,
        city,
        state,
        country,
        notes,
        assignedToId: assignedToId || req.user.id
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer.id,
      details: `Created customer ${customer.name} (${customer.company || 'No company'})`
    });

    return successResponse(res, { customer }, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.customer.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Customer not found', 404);
    }

    if (req.user.role === 'SALES_EXECUTIVE' && existing.assignedToId !== req.user.id) {
      return errorResponse(res, 'Forbidden: You cannot update this customer', 403);
    }

    const { name, company, email, phone, address, city, state, country, notes, assignedToId } = req.body;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        company: company !== undefined ? company : existing.company,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        address: address !== undefined ? address : existing.address,
        city: city !== undefined ? city : existing.city,
        state: state !== undefined ? state : existing.state,
        country: country !== undefined ? country : existing.country,
        notes: notes !== undefined ? notes : existing.notes,
        assignedToId: assignedToId !== undefined ? assignedToId : existing.assignedToId
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'CUSTOMER_UPDATED',
      entityType: 'Customer',
      entityId: id,
      details: `Updated customer ${updatedCustomer.name}`
    });

    return successResponse(res, { customer: updatedCustomer }, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.customer.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Customer not found', 404);
    }

    await prisma.customer.delete({ where: { id } });

    await logActivity({
      userId: req.user.id,
      action: 'CUSTOMER_DELETED',
      entityType: 'Customer',
      entityId: id,
      details: `Deleted customer ${existing.name}`
    });

    return successResponse(res, null, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
