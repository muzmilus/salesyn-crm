const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/activityLogger');

async function getUsers(req, res, next) {
  try {
    const { role, active, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (active !== undefined) where.active = active === 'true';

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedCustomers: true,
            assignedOpportunities: true,
            assignedTasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, { users }, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        assignedLeads: { take: 10, orderBy: { createdAt: 'desc' } },
        assignedCustomers: { take: 10, orderBy: { createdAt: 'desc' } },
        assignedOpportunities: { take: 10, orderBy: { createdAt: 'desc' } },
        assignedTasks: { take: 10, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, 'User details retrieved');
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role, phone, avatar } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse(res, 'Email is already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'SALES_EXECUTIVE',
        phone,
        avatar
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        active: true,
        createdAt: true
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'EMPLOYEE_CREATED',
      entityType: 'User',
      entityId: newUser.id,
      details: `Created employee ${newUser.name} with role ${newUser.role}`
    });

    return successResponse(res, { user: newUser }, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role, phone, avatar, active, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'User not found', 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (active !== undefined) updateData.active = active;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'EMPLOYEE_UPDATED',
      entityType: 'User',
      entityId: id,
      details: `Updated employee ${updatedUser.name}`
    });

    return successResponse(res, { user: updatedUser }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
}

async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: { id: true, name: true, active: true, role: true }
    });

    await logActivity({
      userId: req.user.id,
      action: updatedUser.active ? 'EMPLOYEE_ACTIVATED' : 'EMPLOYEE_DEACTIVATED',
      entityType: 'User',
      entityId: id,
      details: `${updatedUser.active ? 'Activated' : 'Deactivated'} employee ${user.name}`
    });

    return successResponse(res, { user: updatedUser }, `User status set to ${updatedUser.active ? 'Active' : 'Inactive'}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus
};
