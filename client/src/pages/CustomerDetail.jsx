import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { opportunityService } from '../services/opportunityService';
import { interactionService, followUpService } from '../services/crmServices';
import { LoadingSpinner } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  PhoneCall,
  Plus,
  ArrowLeft,
  Clock,
  UserCheck
} from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('opportunities');

  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);

  const [interactionForm, setInteractionForm] = useState({ type: 'Phone Call', subject: '', notes: '' });
  const [oppForm, setOppForm] = useState({ title: '', value: 50000, stage: 'Qualified' });

  const fetchCustomerDetail = async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomerById(id);
      if (res.success) {
        setCustomer(res.data.customer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    try {
      const res = await interactionService.createInteraction({
        ...interactionForm,
        customerId: id
      });
      if (res.success) {
        setIsInteractionModalOpen(false);
        setInteractionForm({ type: 'Phone Call', subject: '', notes: '' });
        fetchCustomerDetail();
      }
    } catch (err) {
      alert(err.message || 'Failed to record interaction');
    }
  };

  const handleAddOpportunity = async (e) => {
    e.preventDefault();
    try {
      const res = await opportunityService.createOpportunity({
        ...oppForm,
        customerId: id
      });
      if (res.success) {
        setIsOppModalOpen(false);
        setOppForm({ title: '', value: 50000, stage: 'Qualified' });
        fetchCustomerDetail();
      }
    } catch (err) {
      alert(err.message || 'Failed to create opportunity');
    }
  };

  if (loading) return <LoadingSpinner label="Loading customer account profile..." />;
  if (!customer) return <div className="p-8 text-center">Customer not found.</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Customer Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/20 flex-shrink-0">
            {customer.company ? customer.company.charAt(0) : customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {customer.name}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active Customer
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {customer.company || 'Individual Account'}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {customer.city ? `${customer.city}, ${customer.country || 'USA'}` : 'Location N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInteractionModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            Log Call/Email
          </button>
          <button
            onClick={() => setIsOppModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Deal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'opportunities'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Deals ({customer.opportunities?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('interactions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'interactions'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Interactions Timeline ({customer.interactions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('followups')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'followups'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Scheduled Follow-ups ({customer.followUps?.length || 0})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'opportunities' && (
        <div className="space-y-3">
          {customer.opportunities?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No active opportunities recorded for this customer.</div>
          ) : (
            customer.opportunities.map((opp) => (
              <div key={opp.id} className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{opp.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Stage: {opp.stage} • Probability: {opp.probability}%</p>
                </div>
                <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                  ${Number(opp.value).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'interactions' && (
        <div className="space-y-3">
          {customer.interactions?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No interaction history recorded.</div>
          ) : (
            customer.interactions.map((i) => (
              <div key={i.id} className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                  {i.type.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{i.type}: {i.subject}</h4>
                    <span className="text-[10px] text-slate-400">{new Date(i.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{i.notes}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'followups' && (
        <div className="space-y-3">
          {customer.followUps?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No follow-ups scheduled.</div>
          ) : (
            customer.followUps.map((f) => (
              <div key={f.id} className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{f.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Scheduled: {new Date(f.date).toLocaleDateString()} at {f.time || '10:00 AM'}
                  </p>
                </div>
                <StatusBadge status={f.status} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Log Interaction Modal */}
      <Modal isOpen={isInteractionModalOpen} onClose={() => setIsInteractionModalOpen(false)} title="Log Customer Interaction">
        <form onSubmit={handleAddInteraction} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Type</label>
            <select
              value={interactionForm.type}
              onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
            >
              <option value="Phone Call">Phone Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
              <option value="Video Call">Video Call</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Subject *</label>
            <input
              type="text"
              required
              value={interactionForm.subject}
              onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
              placeholder="Q4 Strategy Review Call"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Notes</label>
            <textarea
              rows={3}
              value={interactionForm.notes}
              onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsInteractionModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold">Save Log</button>
          </div>
        </form>
      </Modal>

      {/* Add Opportunity Modal */}
      <Modal isOpen={isOppModalOpen} onClose={() => setIsOppModalOpen(false)} title="Create Customer Deal">
        <form onSubmit={handleAddOpportunity} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={oppForm.title}
              onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
              placeholder="Cloud SaaS Platform Expansion"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Value ($)</label>
              <input
                type="number"
                value={oppForm.value}
                onChange={(e) => setOppForm({ ...oppForm, value: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Initial Stage</label>
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
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsOppModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold">Create Deal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDetail;
