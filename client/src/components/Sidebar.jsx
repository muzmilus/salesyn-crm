import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  CalendarCheck,
  CheckSquare,
  BarChart3,
  UserCog,
  Settings,
  X,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'SALES_EXECUTIVE';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] },
    {
      header: 'CRM',
      items: [
        { label: 'Leads', path: '/leads', icon: Users, roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] },
        { label: 'Customers', path: '/customers', icon: Building2, roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] },
        { label: 'Opportunities', path: '/opportunities', icon: TrendingUp, roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] },
      ]
    },
    {
      header: 'Activities',
      items: [
        { label: 'Follow-ups', path: '/follow-ups', icon: CalendarCheck, roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare, roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] },
      ]
    },
    {
      header: 'Analytics & Administration',
      items: [
        { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'SALES_MANAGER'] },
        { label: 'Users & Team', path: '/users', icon: UserCog, roles: ['ADMIN', 'SALES_MANAGER'] },
      ]
    },
    {
      header: 'Account',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'] }
      ]
    }
  ];

  const renderLink = (item) => {
    if (item.roles && !item.roles.includes(role)) return null;
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`
        }
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 100 100" fill="none">
                <path d="M70 32C70 25.3726 62.8366 20 54 20C43 20 32 25 32 35C32 46 68 44 68 56C68 67 56 72 44 72C34.5 72 28 66 28 60" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="70" cy="32" r="6" fill="#38bdf8"/>
                <circle cx="28" cy="60" r="6" fill="#38bdf8"/>
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Salesyn
              </h1>
              <p className="text-[10px] font-medium text-brand-600 dark:text-brand-400 tracking-wider uppercase">
                Your Sales, Synchronized.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navItems.map((section, idx) => {
            if (section.path) {
              return renderLink(section);
            }
            const filteredItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(role)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1.5">
                <h3 className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {section.header}
                </h3>
                <div className="space-y-1">
                  {filteredItems.map((item) => renderLink(item))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'Sales User'}
              </p>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium truncate uppercase tracking-wider">
                {user?.role?.replace('_', ' ') || 'EXECUTIVE'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
