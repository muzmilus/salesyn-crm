const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

async function searchAll(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return successResponse(res, { leads: [], customers: [], opportunities: [] }, 'Query too short');
    }

    const term = q.trim();

    const [leads, customers, opportunities] = await Promise.all([
      prisma.lead.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { company: { contains: term } },
            { email: { contains: term } },
            { phone: { contains: term } }
          ]
        },
        take: 5,
        select: { id: true, name: true, company: true, email: true, status: true, scoreCategory: true }
      }),
      prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { company: { contains: term } },
            { email: { contains: term } },
            { phone: { contains: term } }
          ]
        },
        take: 5,
        select: { id: true, name: true, company: true, email: true, city: true }
      }),
      prisma.opportunity.findMany({
        where: {
          OR: [
            { title: { contains: term } },
            { description: { contains: term } }
          ]
        },
        take: 5,
        select: { id: true, title: true, value: true, stage: true, customerId: true }
      })
    ]);

    return successResponse(res, {
      leads,
      customers,
      opportunities,
      totalResults: leads.length + customers.length + opportunities.length
    }, 'Search completed');
  } catch (error) {
    next(error);
  }
}

module.exports = { searchAll };
