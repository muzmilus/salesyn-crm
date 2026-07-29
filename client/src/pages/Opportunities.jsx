import React, { useState, useEffect } from 'react';
import { opportunityService } from '../services/opportunityService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import KanbanBoard from '../components/KanbanBoard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ExportButtons from '../components/ExportButtons';
import EmptyState from '../components/EmptyState';
import {
  TrendingUp,
  Plus,
  LayoutGrid,
  List,
  DollarSign,
  Building2,
  Calendar,
  Award
} from 'lucide-react';

const Opportunities = () => {
  const [pipelineData, setPipelineData] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [summary, setSummary] = useState({ totalDeals: 0, totalPipelineValue: 0, wonValue: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [oppForm, setOppForm] = useState({
    title: '',
    value: 50000,
    stage: 'New Lead',
    probability: 50,
    description: ''
  });

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const [resPipeline, resList] = await Promise.all([
        opportunityService.getPipeline(),
        opportunityService.getOpportunities()
      ]);

      if (resPipeline.success) {
        setPipelineData(resPipeline.data.pipeline || {});
        setSummary(resPipeline.data.summary || {});
      }
      if (resList.success) {
        setOpportunities(resList.data.opportunities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleMoveStage = async (id, newStage) => {
    try {
      const res = await opportunityService.updateStage(id, newStage);
      if (res.success) {
        fetchPipeline();
      }
    } catch (err) {
      alert(err.message || 'Failed to update deal stage');
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    try {
      const res = await opportunityService.createOpportunity(oppForm);
      if (res.success) {
        setIsAddModalOpen(false);
        setOppForm({ title: '', value: 50000, stage: 'New Lead', probability: 50, description: '' });
        fetchPipeline();
      }
    } catch (err) {
      alert(err.message || 'Failed to create opportunity');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-500" /> Sales Pipeline ({summary.totalDeals} Deals)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize, drag, and move opportunities through pipeline stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" /> Table
            </button>
          </div>

          <ExportButtons data={opportunities} filename="salesyn_pipeline" />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Opportunity
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Pipeline Value</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              ${Number(summary.totalPipelineValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Closed Won Revenue</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ${Number(summary.wonValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Pipeline Deals</p>
            <p className="text-xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {summary.totalDeals} Deals
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pipeline View (Kanban or Table) */}
      {loading ? (
        <LoadingSpinner label="Loading pipeline stage records..." />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          pipelineData={pipelineData}
          onMoveStage={handleMoveStage}
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Opportunity Title</th>
                  <th className="p-4">Account / Customer</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Probability</th>
                  <th className="p-4">Value ($)</th>
                  <th className="p-4">Assigned Rep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      {opp.title}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {opp.customer?.company || opp.customer?.name || 'Lead Prospect'}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={opp.stage} />
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {opp.probability}%
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                      ${Number(opp.value).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {opp.assignedTo?.name || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Opportunity">
        <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={oppForm.title}
              onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
              placeholder="Enterprise CRM Suite Licensing"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Deal Value ($)</label>
              <input
                type="number"
                value={oppForm.value}
                onChange={(e) => setOppForm({ ...oppForm, value: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Stage</label>
              <select
                value={oppForm.stage}
                onChange={(e) => setOppForm({ ...oppForm, stage: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
              >
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              value={oppForm.description}
              onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold">Save Opportunity</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Opportunities;
