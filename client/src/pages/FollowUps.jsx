import React, { useState, useEffect } from 'react';
import { followUpService } from '../services/crmServices';
import { LoadingSpinner } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { CalendarCheck, Plus, Clock, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'overdue'

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await followUpService.getFollowUps({ filter: filter !== 'all' ? filter : undefined });
      if (res.success) {
        setFollowUps(res.data.followUps || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [filter]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Scheduled' : 'Completed';
    try {
      await followUpService.updateFollowUp(id, { status: nextStatus });
      fetchFollowUps();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-brand-500" /> Scheduled Follow-ups
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Agenda of client calls, meetings, demos, and email touchpoints.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === 'all' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === 'upcoming' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === 'overdue' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'}`}
          >
            Overdue ⚠️
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching scheduled follow-ups..." />
      ) : followUps.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No follow-ups found"
          description="Schedule follow-ups directly from Lead and Customer profile pages."
        />
      ) : (
        <div className="space-y-3">
          {followUps.map((f) => {
            const isOverdue = new Date(f.date) < new Date() && f.status === 'Scheduled';
            return (
              <div
                key={f.id}
                className={`glass-panel p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(f.id, f.status)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      f.status === 'Completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'
                    }`}
                  >
                    {f.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <h3 className={`font-bold text-xs ${f.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {f.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Account: {f.customer?.company || f.lead?.name || 'Sales Prospect'} • Rep: {f.assignedUser?.name}
                    </p>
                    {f.notes && <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">"{f.notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {new Date(f.date).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-500">{f.time || '10:00 AM'}</p>
                  </div>
                  <StatusBadge status={f.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowUps;
