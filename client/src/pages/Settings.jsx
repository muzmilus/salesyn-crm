import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings, Sun, Moon, Bell, Shield, Palette } from 'lucide-react';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-500" /> Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure application preferences, theme appearance, and notification behavior.
        </p>
      </div>

      {/* Theme Preferences */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-500" /> Visual Theme & Appearance
        </h3>
        <p className="text-xs text-slate-500">Toggle between Light and Dark mode interface modes. Your preference is persisted automatically.</p>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={toggleTheme}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              theme === 'light'
                ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-md'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">Light Mode</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              theme === 'dark'
                ? 'border-brand-600 bg-slate-900 text-white shadow-md'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-500" /> In-App Notification Alerts
        </h3>
        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span>Notify when a new lead is assigned</span>
            <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span>Alert when follow-ups are overdue</span>
            <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span>Notify on opportunity stage progression</span>
            <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
