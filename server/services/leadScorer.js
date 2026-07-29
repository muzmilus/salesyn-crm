/**
 * AI-Ready Lead Scoring Engine
 * Calculates a lead score from 0 to 100 based on source quality, status progression,
 * estimated deal value, and engagement history.
 */
function calculateLeadScore(lead, interactionCount = 0, followUpCount = 0) {
  let score = 30; // base score

  // 1. Source Weight (max +25)
  const sourceScores = {
    'Referral': 25,
    'Website': 20,
    'Event': 18,
    'Email Campaign': 15,
    'Social Media': 12,
    'Cold Call': 10,
    'Advertisement': 10,
    'Other': 5
  };
  score += (sourceScores[lead.source] || 10);

  // 2. Status Progression (max +25)
  const statusScores = {
    'New': 5,
    'Contacted': 10,
    'Qualified': 20,
    'Proposal Sent': 23,
    'Negotiation': 25,
    'Won': 25,
    'Lost': 0
  };
  score += (statusScores[lead.status] || 5);

  // 3. Estimated Value (max +15)
  const val = Number(lead.estimatedValue) || 0;
  if (val > 100000) score += 15;
  else if (val > 50000) score += 12;
  else if (val > 10000) score += 8;
  else if (val > 0) score += 5;

  // 4. Engagement & Interactions (max +15)
  score += Math.min(interactionCount * 3, 10);
  score += Math.min(followUpCount * 2, 5);

  // 5. Contact completeness (max +10)
  if (lead.email) score += 4;
  if (lead.phone) score += 3;
  if (lead.company) score += 3;

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Categorize
  let scoreCategory = 'Cold';
  if (score >= 75) scoreCategory = 'Hot';
  else if (score >= 45) scoreCategory = 'Warm';

  return { score, scoreCategory };
}

module.exports = { calculateLeadScore };
