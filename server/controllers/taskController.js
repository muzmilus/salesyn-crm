const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/activityLogger');
const { createNotification } = require('../services/notificationService');

async function getTasks(req, res, next) {
  try {
    const { status, priority, assignedToId, filter, page = 1, limit = 50 } = req.query;

    const where = {};

    if (req.user.role === 'SALES_EXECUTIVE') {
      where.assignedToId = req.user.id;
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;

    const now = new Date();

    if (filter === 'overdue') {
      where.status = { not: 'Completed' };
      where.dueDate = { lt: now };
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        take,
        skip,
        orderBy: [
          { status: 'asc' },
          { dueDate: 'asc' }
        ],
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          createdBy: { select: { id: true, name: true } },
          relatedLead: { select: { id: true, name: true, company: true } },
          relatedCustomer: { select: { id: true, name: true, company: true } }
        }
      }),
      prisma.task.count({ where })
    ]);

    return successResponse(res, {
      tasks,
      pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) }
    }, 'Tasks retrieved');
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, priority, status, dueDate, assignedToId, relatedLeadId, relatedCustomerId } = req.body;

    if (!title) {
      return errorResponse(res, 'Task title is required', 400);
    }

    const assignedId = assignedToId || req.user.id;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'Medium',
        status: status || 'Pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedId,
        createdById: req.user.id,
        relatedLeadId: relatedLeadId || null,
        relatedCustomerId: relatedCustomerId || null
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } }
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task.id,
      details: `Created task "${title}" with priority ${task.priority}`
    });

    if (assignedId !== req.user.id) {
      await createNotification({
        userId: assignedId,
        title: 'New Task Assigned',
        message: `Task "${title}" has been assigned to you`,
        type: 'INFO',
        link: '/tasks'
      });
    }

    return successResponse(res, { task }, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.task.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Task not found', 404);
    }

    const { title, description, priority, status, dueDate, assignedToId } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        priority: priority !== undefined ? priority : existing.priority,
        status: status !== undefined ? status : existing.status,
        dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
        assignedToId: assignedToId !== undefined ? assignedToId : existing.assignedToId
      },
      include: {
        assignedTo: { select: { id: true, name: true } }
      }
    });

    if (status && status !== existing.status && status === 'Completed') {
      await logActivity({
        userId: req.user.id,
        action: 'TASK_COMPLETED',
        entityType: 'Task',
        entityId: id,
        details: `Completed task "${existing.title}"`
      });
    }

    return successResponse(res, { task: updatedTask }, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.task.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Task not found', 404);
    }

    await prisma.task.delete({ where: { id } });
    return successResponse(res, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
