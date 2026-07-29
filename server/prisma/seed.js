const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { calculateLeadScore } = require('../services/leadScorer');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Salesyn CRM database seed...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.task.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('password123', salt);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Vance (Admin)',
      email: 'admin@salesyn.com',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    }
  });

  const manager1 = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'manager@salesyn.com',
      passwordHash: defaultPasswordHash,
      role: 'SALES_MANAGER',
      phone: '+1 (555) 018-9922',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
    }
  });

  const manager2 = await prisma.user.create({
    data: {
      name: 'Marcus Thorne',
      email: 'marcus@salesyn.com',
      passwordHash: defaultPasswordHash,
      role: 'SALES_MANAGER',
      phone: '+1 (555) 014-7711',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  });

  const exec1 = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'executive@salesyn.com',
      passwordHash: defaultPasswordHash,
      role: 'SALES_EXECUTIVE',
      phone: '+1 (555) 017-3344',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    }
  });

  const exec2 = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david@salesyn.com',
      passwordHash: defaultPasswordHash,
      role: 'SALES_EXECUTIVE',
      phone: '+1 (555) 016-5588',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    }
  });

  const exec3 = await prisma.user.create({
    data: {
      name: 'Jessica Taylor',
      email: 'jessica@salesyn.com',
      passwordHash: defaultPasswordHash,
      role: 'SALES_EXECUTIVE',
      phone: '+1 (555) 013-8899',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
    }
  });

  const exec4 = await prisma.user.create({
    data: {
      name: 'Robert Chen',
      email: 'robert@salesyn.com',
      passwordHash: defaultPasswordHash,
      role: 'SALES_EXECUTIVE',
      phone: '+1 (555) 012-4455',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
    }
  });

  const exec5 = await prisma.user.create({
    data: {
      name: 'Amanda Martinez',
      email: 'amanda@salesyn.com',
      passwordHash: defaultPasswordHash,
      role: 'SALES_EXECUTIVE',
      phone: '+1 (555) 011-6677',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200'
    }
  });

  const executives = [exec1, exec2, exec3, exec4, exec5];

  console.log('👤 Created 8 Users (1 Admin, 2 Managers, 5 Executives)');

  // 2. Create 25+ Leads
  const leadDataRaw = [
    { name: 'Michael Sterling', company: 'Apex Global Logistics', email: 'm.sterling@apexglobal.io', phone: '+1 (555) 234-5678', source: 'Website', status: 'Proposal Sent', priority: 'High', estimatedValue: 75000 },
    { name: 'Sophia Chen', company: 'Vertex Quantum Bio', email: 'schen@vertexbio.tech', phone: '+1 (555) 345-6789', source: 'Referral', status: 'Negotiation', priority: 'High', estimatedValue: 120000 },
    { name: 'Liam O’Connor', company: 'Horizon Renewable Energy', email: 'loconnor@horizonenergy.com', phone: '+1 (555) 456-7890', source: 'Event', status: 'Qualified', priority: 'High', estimatedValue: 95000 },
    { name: 'Olivia Reynolds', company: 'CloudScale Technologies', email: 'olivia@cloudscale.net', phone: '+1 (555) 567-8901', source: 'Email Campaign', status: 'Contacted', priority: 'Medium', estimatedValue: 45000 },
    { name: 'Ethan Harper', company: 'Nexus FinTech Labs', email: 'eharper@nexusfintech.io', phone: '+1 (555) 678-9012', source: 'Social Media', status: 'New', priority: 'Medium', estimatedValue: 35000 },
    { name: 'Ava Montgomery', company: 'Starlight Retail Brands', email: 'amontgomery@starlight.store', phone: '+1 (555) 789-0123', source: 'Cold Call', status: 'Contacted', priority: 'Low', estimatedValue: 20000 },
    { name: 'Lucas Vance', company: 'Hyperion Aerospace', email: 'lvance@hyperion.co', phone: '+1 (555) 890-1234', source: 'Website', status: 'Proposal Sent', priority: 'High', estimatedValue: 250000 },
    { name: 'Isabella Rossi', company: 'Milan Fashion Tech', email: 'irossi@milanfashion.it', phone: '+1 (555) 901-2345', source: 'Referral', status: 'Won', priority: 'High', estimatedValue: 68000 },
    { name: 'Jackson Reed', company: 'CyberShield Security', email: 'jreed@cybershield.org', phone: '+1 (555) 012-3456', source: 'Advertisement', status: 'Qualified', priority: 'Medium', estimatedValue: 52000 },
    { name: 'Mia Patel', company: 'OmniHealth Solutions', email: 'mpatel@omnihealth.care', phone: '+1 (555) 123-4567', source: 'Event', status: 'Negotiation', priority: 'High', estimatedValue: 140000 },
    { name: 'Noah Wright', company: 'Titan Construction Corp', email: 'nwright@titanconst.com', phone: '+1 (555) 234-5679', source: 'Cold Call', status: 'Lost', priority: 'Low', estimatedValue: 15000 },
    { name: 'Charlotte Dubois', company: 'Lumiere Luxury Goods', email: 'cdubois@lumiere.fr', phone: '+1 (555) 345-6780', source: 'Website', status: 'Qualified', priority: 'Medium', estimatedValue: 48000 },
    { name: 'Benjamin Hayes', company: 'Zenith Robotics', email: 'bhayes@zenithrobotics.com', phone: '+1 (555) 456-7891', source: 'Email Campaign', status: 'New', priority: 'High', estimatedValue: 88000 },
    { name: 'Amelia Zhang', company: 'Pacific AI Systems', email: 'azhang@pacificai.ai', phone: '+1 (555) 567-8902', source: 'Referral', status: 'Proposal Sent', priority: 'High', estimatedValue: 110000 },
    { name: 'Jameson Cole', company: 'Summit Outdoor Gear', email: 'jcole@summitgear.com', phone: '+1 (555) 678-9013', source: 'Social Media', status: 'Contacted', priority: 'Medium', estimatedValue: 28000 },
    { name: 'Harper Brooks', company: 'BlueWave Communications', email: 'hbrooks@bluewave.com', phone: '+1 (555) 789-0124', source: 'Advertisement', status: 'New', priority: 'Low', estimatedValue: 18000 },
    { name: 'Alexander Stone', company: 'Krypton Data Systems', email: 'astone@kryptondata.io', phone: '+1 (555) 890-1235', source: 'Website', status: 'Won', priority: 'High', estimatedValue: 175000 },
    { name: 'Evelyn Scott', company: 'BioHealth Pharma', email: 'escott@biohealth.com', phone: '+1 (555) 901-2346', source: 'Event', status: 'Contacted', priority: 'Medium', estimatedValue: 42000 },
    { name: 'Logan Miller', company: 'Vanguard Capital', email: 'lmiller@vanguardcap.com', phone: '+1 (555) 012-3457', source: 'Referral', status: 'Negotiation', priority: 'High', estimatedValue: 190000 },
    { name: 'Abigail King', company: 'Solaris Smart Grids', email: 'aking@solarisgrids.com', phone: '+1 (555) 123-4568', source: 'Website', status: 'Qualified', priority: 'Medium', estimatedValue: 64000 },
    { name: 'Daniel Bishop', company: 'Matrix Software Inc', email: 'dbishop@matrixsoft.com', phone: '+1 (555) 234-5680', source: 'Email Campaign', status: 'Lost', priority: 'Low', estimatedValue: 22000 },
    { name: 'Chloe Rivera', company: 'Emerald Agritech', email: 'crivera@emeraldagri.com', phone: '+1 (555) 345-6781', source: 'Cold Call', status: 'New', priority: 'Low', estimatedValue: 16000 },
    { name: 'Henry Adams', company: 'Atlas Automotive', email: 'hadams@atlasauto.com', phone: '+1 (555) 456-7892', source: 'Social Media', status: 'Contacted', priority: 'Medium', estimatedValue: 32000 },
    { name: 'Grace Foster', company: 'NextGen Education', email: 'gfoster@nextgenedu.org', phone: '+1 (555) 567-8903', source: 'Event', status: 'Proposal Sent', priority: 'Medium', estimatedValue: 55000 },
    { name: 'Sebastian Cox', company: 'Quantum Dynamics', email: 'scox@quantumdyn.com', phone: '+1 (555) 678-9014', source: 'Website', status: 'Qualified', priority: 'High', estimatedValue: 130000 }
  ];

  const createdLeads = [];
  for (let i = 0; i < leadDataRaw.length; i++) {
    const raw = leadDataRaw[i];
    const assignedExec = executives[i % executives.length];
    const { score, scoreCategory } = calculateLeadScore(raw, Math.floor(Math.random() * 4), Math.floor(Math.random() * 3));

    const lead = await prisma.lead.create({
      data: {
        ...raw,
        score,
        scoreCategory,
        notes: `Initial lead inquiry via ${raw.source}. Interested in enterprise CRM synchronization.`,
        assignedToId: assignedExec.id,
        createdById: admin.id
      }
    });
    createdLeads.push(lead);
  }

  console.log(`📈 Created ${createdLeads.length} Realistic Leads`);

  // 3. Create 15+ Customers
  const customerDataRaw = [
    { name: 'Victoria Sterling', company: 'Apex Global Logistics', email: 'v.sterling@apexglobal.io', phone: '+1 (555) 234-5678', city: 'Chicago', state: 'IL', country: 'USA' },
    { name: 'Isabella Rossi', company: 'Milan Fashion Tech', email: 'irossi@milanfashion.it', phone: '+1 (555) 901-2345', city: 'New York', state: 'NY', country: 'USA' },
    { name: 'Alexander Stone', company: 'Krypton Data Systems', email: 'astone@kryptondata.io', phone: '+1 (555) 890-1235', city: 'San Francisco', state: 'CA', country: 'USA' },
    { name: 'Marcus Brody', company: 'Brody & Associates Financial', email: 'mbrody@brodyfin.com', phone: '+1 (555) 987-6543', city: 'Boston', state: 'MA', country: 'USA' },
    { name: 'Elena Gilbert', company: 'Mystic Health Systems', email: 'egilbert@mystichealth.org', phone: '+1 (555) 876-5432', city: 'Seattle', state: 'WA', country: 'USA' },
    { name: 'Arthur Pendelton', company: 'Camelot Enterprise Software', email: 'apendelton@camelot.io', phone: '+1 (555) 765-4321', city: 'Austin', state: 'TX', country: 'USA' },
    { name: 'Catherine Parr', company: 'Tudor Life Sciences', email: 'cparr@tudorbio.com', phone: '+1 (555) 654-3210', city: 'Philadelphia', state: 'PA', country: 'USA' },
    { name: 'Gavin Belson', company: 'Hooli Networks', email: 'gbelson@hooli.com', phone: '+1 (555) 543-2109', city: 'Palo Alto', state: 'CA', country: 'USA' },
    { name: 'Laurie Bream', company: 'Raviga Capital', email: 'lbream@raviga.com', phone: '+1 (555) 432-1098', city: 'San Jose', state: 'CA', country: 'USA' },
    { name: 'Bertram Gilfoyle', company: 'Pied Piper Cloud', email: 'gilfoyle@piedpiper.com', phone: '+1 (555) 321-0987', city: 'Mountain View', state: 'CA', country: 'USA' },
    { name: 'Monica Hall', company: 'Bream Hall Partners', email: 'mhall@breamhall.com', phone: '+1 (555) 210-9876', city: 'San Francisco', state: 'CA', country: 'USA' },
    { name: 'Dinesh Chugtai', company: 'PiperChat Technologies', email: 'dinesh@piperchat.io', phone: '+1 (555) 109-8765', city: 'Sunnyvale', state: 'CA', country: 'USA' },
    { name: 'Peter Gregory', company: 'Peter Gregory Foundation', email: 'pgregory@pgfoundation.org', phone: '+1 (555) 098-7654', city: 'San Francisco', state: 'CA', country: 'USA' },
    { name: 'Jared Dunn', company: 'Vanguard Operations', email: 'jdunn@vanguardops.com', phone: '+1 (555) 987-1234', city: 'Denver', state: 'CO', country: 'USA' },
    { name: 'Russ Hanneman', company: 'Tres Leches Capital', email: 'russ@tresleches.com', phone: '+1 (555) 876-2345', city: 'Los Angeles', state: 'CA', country: 'USA' }
  ];

  const createdCustomers = [];
  for (let i = 0; i < customerDataRaw.length; i++) {
    const raw = customerDataRaw[i];
    const assignedExec = executives[i % executives.length];

    const customer = await prisma.customer.create({
      data: {
        ...raw,
        address: '100 Innovation Way, Suite 400',
        notes: 'Strategic account with long-term enterprise subscription contract.',
        assignedToId: assignedExec.id
      }
    });
    createdCustomers.push(customer);
  }

  console.log(`🏢 Created ${createdCustomers.length} Customers`);

  // 4. Create 18 Opportunities
  const opportunityTitles = [
    'Q3 Enterprise CRM Rollout',
    'Cloud Migration & Sync Suite',
    'Custom Sales Automation Module',
    'AI Lead Scoring Integration',
    'Global Multi-Region SaaS Deal',
    'Annual Platform Subscription Renewal',
    'Mobile Sales Executive Suite',
    'Omnichannel Communication Sync',
    'High-Volume Data Pipeline Setup',
    'Financial Compliance Module',
    'Security & Audit Logging Suite',
    'Customer Analytics & Insights Pack',
    'API Integration Service Agreement',
    'Regional Franchise CRM Expansion',
    'Premium Dedicated Support Plan',
    'Predictive Revenue Forecasting Engine',
    'Partner Portal Licensing Deal',
    'Executive Reporting & Dashboard Expansion'
  ];

  const stages = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Won', 'Won', 'Lost'];

  const createdOpportunities = [];
  for (let i = 0; i < opportunityTitles.length; i++) {
    const title = opportunityTitles[i];
    const cust = createdCustomers[i % createdCustomers.length];
    const exec = executives[i % executives.length];
    const stage = stages[i % stages.length];
    const value = Math.floor(Math.random() * 15 + 3) * 10000; // 30,000 to 180,000

    let prob = 50;
    if (stage === 'Won') prob = 100;
    else if (stage === 'Lost') prob = 0;
    else if (stage === 'Negotiation') prob = 85;
    else if (stage === 'Proposal Sent') prob = 65;
    else if (stage === 'Qualified') prob = 40;

    const opp = await prisma.opportunity.create({
      data: {
        title: `${cust.company || cust.name} - ${title}`,
        customerId: cust.id,
        assignedToId: exec.id,
        value,
        probability: prob,
        stage,
        expectedCloseDate: new Date(Date.now() + (i * 5 - 15) * 86400000),
        description: `Enterprise deal negotiation for ${cust.company}. Key requirements include real-time synchronization and custom reporting.`
      }
    });
    createdOpportunities.push(opp);
  }

  console.log(`💼 Created ${createdOpportunities.length} Opportunities across pipeline stages`);

  // 5. Create Interactions
  const interactionTypes = ['Phone Call', 'Email', 'Meeting', 'Video Call', 'WhatsApp', 'Note'];
  for (let i = 0; i < 25; i++) {
    const type = interactionTypes[i % interactionTypes.length];
    const cust = createdCustomers[i % createdCustomers.length];
    const exec = executives[i % executives.length];

    await prisma.interaction.create({
      data: {
        type,
        subject: `${type} with ${cust.name}`,
        notes: `Discussed key contract terms, technical requirements, and deployment timelines for ${cust.company}.`,
        outcome: i % 2 === 0 ? 'Positive feedback. Proceeding to proposal.' : 'Follow-up requested next week.',
        date: new Date(Date.now() - i * 86400000 * 2),
        userId: exec.id,
        customerId: cust.id
      }
    });
  }

  console.log('📞 Created 25 Customer Interaction Records');

  // 6. Create Follow-ups (Upcoming & Overdue)
  const followUpTypes = ['Call', 'Email', 'Meeting', 'Demo'];

  // Upcoming follow-ups
  for (let i = 1; i <= 8; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const exec = executives[i % executives.length];
    await prisma.followUp.create({
      data: {
        title: `Follow up on contract review with ${cust.name}`,
        type: followUpTypes[i % followUpTypes.length],
        date: new Date(Date.now() + i * 86400000 * 2),
        time: '10:30 AM',
        notes: 'Confirm security review signoff and timeline.',
        status: 'Scheduled',
        assignedUserId: exec.id,
        customerId: cust.id
      }
    });
  }

  // Overdue follow-ups
  for (let i = 1; i <= 4; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const exec = executives[i % executives.length];
    await prisma.followUp.create({
      data: {
        title: `Overdue: Send proposal draft to ${cust.name}`,
        type: 'Email',
        date: new Date(Date.now() - i * 86400000 * 3),
        time: '02:00 PM',
        notes: 'Urgent follow-up requested by client VP.',
        status: 'Scheduled',
        assignedUserId: exec.id,
        customerId: cust.id
      }
    });
  }

  console.log('📅 Created 12 Follow-ups (Upcoming + Overdue)');

  // 7. Create Tasks
  for (let i = 1; i <= 10; i++) {
    const exec = executives[i % executives.length];
    const cust = createdCustomers[i % createdCustomers.length];
    await prisma.task.create({
      data: {
        title: `Prepare technical proposal for ${cust.company}`,
        description: 'Detail custom REST API integrations and data migration SLAs.',
        priority: i % 3 === 0 ? 'High' : (i % 2 === 0 ? 'Medium' : 'Low'),
        status: i % 4 === 0 ? 'Completed' : (i % 2 === 0 ? 'In Progress' : 'Pending'),
        dueDate: new Date(Date.now() + (i * 2 - 5) * 86400000),
        assignedToId: exec.id,
        createdById: manager1.id,
        relatedCustomerId: cust.id
      }
    });
  }

  console.log('✅ Created 10 Tasks');

  // 8. Create Notifications
  for (const exec of executives) {
    await prisma.notification.createMany({
      data: [
        { userId: exec.id, title: 'Welcome to Salesyn CRM', message: 'Your sales workspace is ready. Check your assigned leads and follow-ups.', type: 'INFO', read: true },
        { userId: exec.id, title: 'New Lead Assigned', message: 'You have been assigned 5 new high-priority leads from the website.', type: 'INFO', read: false },
        { userId: exec.id, title: 'Deal Stage Updated', message: 'Apex Global Logistics deal moved to Proposal Sent stage!', type: 'SUCCESS', read: false }
      ]
    });
  }

  console.log('🔔 Created User Notifications');

  // 9. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, action: 'SYSTEM_INIT', entityType: 'System', details: 'Salesyn CRM environment initialized with production seed data.' },
      { userId: manager1.id, action: 'LEAD_ASSIGNED', entityType: 'Lead', details: 'Assigned 5 leads to Elena Rostova' },
      { userId: exec1.id, action: 'LEAD_CONVERTED', entityType: 'Lead', details: 'Converted lead Isabella Rossi to Customer' },
      { userId: exec2.id, action: 'DEAL_WON', entityType: 'Opportunity', details: 'Closed $175,000 deal with Krypton Data Systems' }
    ]
  });

  console.log('📜 Created System Activity Logs');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
