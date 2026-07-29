import React, { useState } from 'react';
import { Building2, Calendar, User, DollarSign, ArrowRightLeft, CheckCircle2, XCircle } from 'lucide-react';

const STAGES = [
  { id: 'New Lead', title: 'New Lead', color: 'border-t-blue-500' },
  { id: 'Contacted', title: 'Contacted', color: 'border-t-amber-500' },
  { id: 'Qualified', title: 'Qualified', color: 'border-t-indigo-500' },
  { id: 'Proposal Sent', title: 'Proposal Sent', color: 'border-t-violet-500' },
  { id: 'Negotiation', title: 'Negotiation', color: 'border-t-purple-500' },
  { id: 'Won', title: 'Won', color: 'border-t-emerald-500' },
  { id: 'Lost', title: 'Lost', color: 'border-t-rose-500' },
];

const KanbanBoard = ({ pipelineData = {}, onMoveStage, onSelectOpportunity }) => {
  const [movingId, setMovingId] = useState(null);

  const handleStageChange = async (oppId, newStage) => {
    setMovingId(oppId);
    await onMoveStage(oppId, newStage);
    setMovingId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px] snap-x">
      {STAGES.map((col) => {
        const stageInfo = pipelineData[col.id] || { count: 0, totalValue: 0, deals: [] };
        const deals = stageInfo.deals || [];

        return (
          <div
            key={col.id}
            className={`flex-shrink-0 w-72 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col border-t-4 ${col.color} snap-start`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {col.title}
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {stageInfo.count}
                  </span>
                </h3>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${Number(stageInfo.totalValue || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Cards Container */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 max-h-[70vh]">
              {deals.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No deals in this stage
                </div>
              ) : (
                deals.map((opp) => (
                  <div
                    key={opp.id}
                    className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all ${
                      movingId === opp.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => onSelectOpportunity && onSelectOpportunity(opp)}
                        className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer line-clamp-2"
                      >
                        {opp.title}
                      </h4>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {opp.customer?.company || opp.customer?.name || 'Prospect'}
                      </span>
                    </div>

                    {/* Deal Value & Probability */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        ${Number(opp.value).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {opp.probability}% win
                      </span>
                    </div>

                    {/* Stage Selector Action Bar */}
                    <div className="mt-3 flex items-center justify-between gap-1">
                      <select
                        value={opp.stage}
                        onChange={(e) => handleStageChange(opp.id, e.target.value)}
                        className="w-full text-[11px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            Move to: {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
