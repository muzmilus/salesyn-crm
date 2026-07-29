import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading Salesyn data...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 flex items-center justify-center mb-3">
      <Loader2 className="w-6 h-6 text-brand-600 dark:text-brand-400 animate-spin" />
    </div>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
      {label}
    </p>
  </div>
);

export const SkeletonRow = ({ count = 5 }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
    ))}
  </div>
);
