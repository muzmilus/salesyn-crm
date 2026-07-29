import React, { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';
import { userService } from '../services/userService';
import { interactionService, followUpService } from '../services/crmServices';
import { LoadingSpinner } from '../components/LoadingSpinner';
import LeadScoreBadge from '../components/LeadScoreBadge';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ExportButtons from '../components/ExportButtons';
import EmptyState from '../components/EmptyState';
import {
  Users,
  Plus,
  Search,
  Filter,
  UserPlus,
  ArrowRightLeft,
  PhoneCall,
  Calendar,
  MoreVertical,
  Building2,
  Mail,
  Phone,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [scoreCategoryFilter, setScoreCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  const [users, setUsers] = useState([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);

  // Form States
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    estimatedValue: 25000,
    notes: ''
  });

  const [assigneeId, setAssigneeId] = useState('');

  const [interactionForm, setInteractionForm] = useState({
    type: 'Phone Call',
    subject: '',
    notes: '',
    outcome: ''
  });

  const [followUpForm, setFollowUpForm] = useState({
    title: '',
    type: 'Call',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    notes: ''
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await leadService.getLeads({
        search,
        status: statusFilter,
        source: sourceFilter,
        scoreCategory: scoreCategoryFilter,
        page,
        limit: 15
      });
      if (res.success) {
        setLeads(res.data.leads || []);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalLeads(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, sourceFilter, scoreCategoryFilter, page]);

  useEffect(() => {
    userService.getUsers().then((res) => {
      if (res.success) setUsers(res.data.users || []);
    }).catch(console.error);
  }, []);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await leadService.createLead(leadForm);
      if (res.success) {
        setIsAddModalOpen(false);
        setLeadForm({ name: '', company: '', email: '', phone: '', source: 'Website', status: 'New', priority: 'Medium', estimatedValue: 25000, notes: '' });
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'Failed to create lead');
    }
  };

  const handleAssignLead = async (e) => {
    e.preventDefault();
    if (!selectedLead || !assigneeId) return;
    try {
      const res = await leadService.assignLead(selectedLead.id, assigneeId);
      if (res.success) {
        setIsAssignModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign lead');
    }
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const res = await leadService.convertLead(selectedLead.id, { createOpportunity: true });
      if (res.success) {
        setIsConvertModalOpen(false);
        alert(`Lead ${selectedLead.name} successfully converted to Customer!`);
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'Conversion failed');
    }
  };

  const handleRecordInteraction = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const res = await interactionService.createInteraction({
        ...interactionForm,
        leadId: selectedLead.id
      });
      if (res.success) {
        setIsInteractionModalOpen(false);
        setInteractionForm({ type: 'Phone Call', subject: '', notes: '', outcome: '' });
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'Failed to record interaction');
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const res = await followUpService.createFollowUp({
        ...followUpForm,
        leadId: selectedLead.id
      });
      if (res.success) {
        setIsFollowUpModalOpen(false);
        setFollowUpForm({ title: '', type: 'Call', date: new Date().toISOString().slice(0, 10), time: '10:00', notes: '' });
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule follow-up');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" /> Lead Management ({totalLeads})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture, score, assign, and convert sales leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButtons data={leads} filename="salesyn_leads" />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search leads by name, company, email..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          {/* AI Score Filter */}
          <select
            value={scoreCategoryFilter}
            onChange={(e) => { setScoreCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All AI Lead Scores</option>
            <option value="Hot">🔥 Hot Leads (75+)</option>
            <option value="Warm">🟡 Warm Leads (45-74)</option>
            <option value="Cold">❄️ Cold Leads (&lt;45)</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Event">Event</option>
            <option value="Email Campaign">Email Campaign</option>
            <option value="Cold Call">Cold Call</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <LoadingSpinner label="Loading lead pipeline records..." />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description="Try adjusting your filters or create a new lead."
          actionLabel="Add Lead"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Lead Name & Company</th>
                  <th className="p-4">AI Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Est. Value</th>
                  <th className="p-4">Assigned Rep</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{lead.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {lead.company || 'Private Contact'} • {lead.email}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <LeadScoreBadge score={lead.score} category={lead.scoreCategory} showMeter />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={lead.status} />
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      ${Number(lead.estimatedValue).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={lead.assignedTo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.assignedTo?.name || 'User')}&background=6366f1&color=fff`}
                          alt={lead.assignedTo?.name}
                          className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {lead.assignedTo?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedLead(lead); setIsInteractionModalOpen(true); }}
                          title="Record Call / Email Interaction"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedLead(lead); setIsFollowUpModalOpen(true); }}
                          title="Schedule Follow-up"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedLead(lead); setAssigneeId(lead.assignedToId || ''); setIsAssignModalOpen(true); }}
                          title="Assign Executive"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        {!lead.isConverted ? (
                          <button
                            onClick={() => { setSelectedLead(lead); setIsConvertModalOpen(true); }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Convert
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Converted
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages} ({totalLeads} leads)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Lead">
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                placeholder="Michael Sterling"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company</label>
              <input
                type="text"
                value={leadForm.company}
                onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                placeholder="Apex Global Logistics"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                placeholder="m.sterling@apex.io"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                placeholder="+1 (555) 234-5678"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Source</label>
              <select
                value={leadForm.source}
                onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Event">Event</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={leadForm.priority}
                onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Est. Deal Value ($)</label>
              <input
                type="number"
                value={leadForm.estimatedValue}
                onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea
              rows={3}
              value={leadForm.notes}
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100"
              placeholder="Initial notes on sales inquiry..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold shadow-md shadow-brand-500/20"
            >
              Save Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Lead: ${selectedLead?.name}`}>
        <form onSubmit={handleAssignLead} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Sales Executive</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Representative...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-300 font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold">Confirm Assignment</button>
          </div>
        </form>
      </Modal>

      {/* Convert Lead to Customer Modal */}
      <Modal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} title={`Convert Lead to Customer`}>
        <form onSubmit={handleConvertLead} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200">
            Converting <strong>{selectedLead?.name}</strong> ({selectedLead?.company}) will create a new Customer record and automatically launch a Sales Opportunity valued at <strong>${Number(selectedLead?.estimatedValue || 0).toLocaleString()}</strong>.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsConvertModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-300 font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Convert to Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Interaction Modal */}
      <Modal isOpen={isInteractionModalOpen} onClose={() => setIsInteractionModalOpen(false)} title={`Record Interaction: ${selectedLead?.name}`}>
        <form onSubmit={handleRecordInteraction} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Interaction Type</label>
              <select
                value={interactionForm.type}
                onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                <option value="Phone Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Video Call">Video Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Note">Note</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={interactionForm.subject}
                onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
                placeholder="Product demo call"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes & Details</label>
            <textarea
              rows={3}
              value={interactionForm.notes}
              onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsInteractionModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-300 font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold">Log Interaction</button>
          </div>
        </form>
      </Modal>

      {/* Schedule FollowUp Modal */}
      <Modal isOpen={isFollowUpModalOpen} onClose={() => setIsFollowUpModalOpen(false)} title={`Schedule Follow-up: ${selectedLead?.name}`}>
        <form onSubmit={handleScheduleFollowUp} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Follow-up Title *</label>
            <input
              type="text"
              required
              value={followUpForm.title}
              onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
              placeholder="Send proposal draft & security documentation"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select
                value={followUpForm.type}
                onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Demo">Demo</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={followUpForm.date}
                onChange={(e) => setFollowUpForm({ ...followUpForm, date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
              <input
                type="text"
                value={followUpForm.time}
                onChange={(e) => setFollowUpForm({ ...followUpForm, time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsFollowUpModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-300 font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold">Schedule Follow-up</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leads;
