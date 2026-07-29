const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

async function getReports(req, res, next) {
  try {
    const { startDate, endDate, assignedToId, status } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const leadWhere = {};
    const opportunityWhere = {};
    const customerWhere = {};

    if (Object.keys(dateFilter).length > 0) {
      leadWhere.createdAt = dateFilter;
      opportunityWhere.createdAt = dateFilter;
      customerWhere.createdAt = dateFilter;
    }

    if (assignedToId) {
      leadWhere.assignedToId = assignedToId;
      opportunityWhere.assignedToId = assignedToId;
      customerWhere.assignedToId = assignedToId;
    }

    if (status) {
      leadWhere.status = status;
    }

    // 1. Sales Performance by Rep
    const reps = await prisma.user.findMany({
      where: { role: { in: ['SALES_EXECUTIVE', 'SALES_MANAGER', 'ADMIN'] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedLeads: { where: leadWhere, select: { id: true, isConverted: true, status: true } },
        assignedOpportunities: { where: opportunityWhere, select: { id: true, value: true, stage: true } }
      }
    });

    const employeePerformance = reps.map(rep => {
      const totalLeads = rep.assignedLeads.length;
      const convertedLeads = rep.assignedLeads.filter(l => l.isConverted).length;
      const totalDeals = rep.assignedOpportunities.length;
      const wonDeals = rep.assignedOpportunities.filter(o => o.stage === 'Won');
      const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

      return {
        id: rep.id,
        name: rep.name,
        email: rep.email,
        role: rep.role,
        totalLeads,
        convertedLeads,
        totalDeals,
        wonDeals: wonDeals.length,
        totalRevenue,
        conversionRate: parseFloat(conversionRate)
      };
    });

    // 2. Lead Source Performance
    const leadSources = await prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
      _sum: { estimatedValue: true },
      where: leadWhere
    });

    const leadSourceReport = await Promise.all(
      leadSources.map(async item => {
        const convertedCount = await prisma.lead.count({
          where: { ...leadWhere, source: item.source, isConverted: true }
        });
        return {
          source: item.source,
          totalLeads: item._count.id,
          convertedLeads: convertedCount,
          totalEstimatedValue: item._sum.estimatedValue || 0,
          conversionRate: item._count.id > 0 ? ((convertedCount / item._count.id) * 100).toFixed(1) : 0
        };
      })
    );

    // 3. Overall Pipeline Performance
    const pipelineStages = await prisma.opportunity.groupBy({
      by: ['stage'],
      _count: { id: true },
      _sum: { value: true },
      where: opportunityWhere
    });

    // 4. Summary Key Metrics
    const totalLeadsCount = await prisma.lead.count({ where: leadWhere });
    const totalCustomersCount = await prisma.customer.count({ where: customerWhere });
    const totalDealsCount = await prisma.opportunity.count({ where: opportunityWhere });
    const totalWonRevenue = await prisma.opportunity.aggregate({
      _sum: { value: true },
      where: { ...opportunityWhere, stage: 'Won' }
    });

    return successResponse(res, {
      summary: {
        totalLeads: totalLeadsCount,
        totalCustomers: totalCustomersCount,
        totalDeals: totalDealsCount,
        totalRevenue: totalWonRevenue._sum.value || 0
      },
      employeePerformance,
      leadSourceReport,
      pipelineStages
    }, 'Reports generated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = { getReports };
