import React from 'react';
import { Flame, Sun, Snowflake } from 'lucide-react';

const LeadScoreBadge = ({ score = 50, category = 'Warm', showMeter = false }) => {
  const getBadgeStyle = () => {
    if (category === 'Hot' || score >= 75) {
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-900',
        barBg: 'bg-rose-500',
        icon: Flame,
        label: 'Hot Lead'
      };
    }
    if (category === 'Warm' || score >= 45) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-900',
        barBg: 'bg-amber-500',
        icon: Sun,
        label: 'Warm Lead'
      };
    }
    return {
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-900',
      barBg: 'bg-sky-500',
      icon: Snowflake,
      label: 'Cold Lead'
    };
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  return (
    <div className="inline-flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
        <Icon className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
        <span>{score}/100</span>
        <span className="opacity-75">• {style.label}</span>
      </span>

      {showMeter && (
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${style.barBg} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default LeadScoreBadge;
