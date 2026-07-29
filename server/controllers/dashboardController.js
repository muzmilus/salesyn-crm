const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

async function getDashboardStats(req, res, next) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    // Filter by assigned user if role is SALES_EXECUTIVE
    const userFilter = userRole === 'SALES_EXECUTIVE' ? { assignedToId: userId } : {};
    const followUpUserFilter = userRole === 'SALES_EXECUTIVE' ? { assignedUserId: userId } : {};

    const now = new Date();

    // 1. KPI Counts
    const [
      totalCustomers,
      totalLeads,
      newLeads,
      qualifiedLeads,
      activeOpportunities,
      dealsWon,
      dealsLost,
      wonDealsSum,
      pendingTasksCount,
      recentLeads,
      recentCustomers,
      upcomingFollowUps,
      overdueTasks,
      recentActivity
    ] = await Promise.all([
      prisma.customer.count({ where: userFilter }),
      prisma.lead.count({ where: userFilter }),
      prisma.lead.count({ where: { ...userFilter, status: 'New' } }),
      prisma.lead.count({ where: { ...userFilter, status: 'Qualified' } }),
      prisma.opportunity.count({
        where: { ...userFilter, stage: { notIn: ['Won', 'Lost'] } }
      }),
      prisma.opportunity.count({ where: { ...userFilter, stage: 'Won' } }),
      prisma.opportunity.count({ where: { ...userFilter, stage: 'Lost' } }),
      prisma.opportunity.aggregate({
        _sum: { value: true },
        where: { ...userFilter, stage: 'Won' }
      }),
      prisma.task.count({
        where: { ...userFilter, status: { in: ['Pending', 'In Progress'] } }
      }),
      // Recent Lists
      prisma.lead.findMany({
        where: userFilter,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { name: true, avatar: true } } }
      }),
      prisma.customer.findMany({
        where: userFilter,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { name: true, avatar: true } } }
      }),
      prisma.followUp.findMany({
        where: { ...followUpUserFilter, status: 'Scheduled', date: { gte: now } },
        take: 5,
        orderBy: { date: 'asc' },
        include: {
          lead: { select: { name: true, company: true } },
          customer: { select: { name: true, company: true } }
        }
      }),
      prisma.task.findMany({
        where: { ...userFilter, status: { not: 'Completed' }, dueDate: { lt: now } },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: { assignedTo: { select: { name: true } } }
      }),
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } } }
      })
    ]);

    const totalRevenue = wonDealsSum._sum.value || 0;
    const conversionRate = totalLeads > 0 ? ((dealsWon / totalLeads) * 100).toFixed(1) : 0;

    // 2. Chart: Lead Sources Breakdown
    const leadSourcesGroup = await prisma.lead.groupBy({
      by: ['source'],
      _count: { source: true },
      where: userFilter
    });
    const leadSourcesChart = leadSourcesGroup.map(item => ({
      name: item.source,
      value: item._count.source
    }));

    // 3. Chart: Sales Pipeline Breakdown by Stage
    const stages = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
    const pipelineGroup = await prisma.opportunity.groupBy({
      by: ['stage'],
      _count: { stage: true },
      _sum: { value: true },
      where: userFilter
    });
    const pipelineChart = stages.map(stage => {
      const found = pipelineGroup.find(p => p.stage === stage);
      return {
        stage,
        count: found ? found._count.stage : 0,
        value: found ? (found._sum.value || 0) : 0
      };
    });

    // 4. Chart: Monthly Revenue (Past 6 Months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthName = startOfMonth.toLocaleString('default', { month: 'short' });

      const revAgg = await prisma.opportunity.aggregate({
        _sum: { value: true },
        where: {
          ...userFilter,
          stage: 'Won',
          updatedAt: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      const leadsCreated = await prisma.lead.count({
        where: {
          ...userFilter,
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      const customersConverted = await prisma.customer.count({
        where: {
          ...userFilter,
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      monthlyRevenue.push({
        month: monthName,
        revenue: revAgg._sum.value || 0,
        leads: leadsCreated,
        customers: customersConverted
      });
    }

    // 5. Chart: Sales Rep Performance (Top 5 Executives)
    const salesReps = await prisma.user.findMany({
      where: { role: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER'] }, active: true },
      select: {
        id: true,
        name: true,
        assignedOpportunities: {
          where: { stage: 'Won' },
          select: { value: true }
        },
        _count: {
          select: {
            assignedLeads: true,
            assignedCustomers: true
          }
        }
      },
      take: 5
    });

    const salesPerformanceChart = salesReps.map(rep => {
      const totalRevenue = rep.assignedOpportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);
      return {
        name: rep.name,
        revenue: totalRevenue,
        dealsWon: rep.assignedOpportunities.length,
        leadsAssigned: rep._count.assignedLeads,
        customers: rep._count.assignedCustomers
      };
    });

    return successResponse(res, {
      kpi: {
        totalCustomers,
        totalLeads,
        newLeads,
        qualifiedLeads,
        activeOpportunities,
        dealsWon,
        dealsLost,
        totalRevenue,
        conversionRate: parseFloat(conversionRate),
        pendingTasks: pendingTasksCount
      },
      charts: {
        monthlyRevenue,
        leadSources: leadSourcesChart,
        salesPipeline: pipelineChart,
        salesPerformance: salesPerformanceChart
      },
      widgets: {
        recentLeads,
        recentCustomers,
        upcomingFollowUps,
        overdueTasks,
        recentActivity
      }
    }, 'Dashboard statistics loaded successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboardStats };
