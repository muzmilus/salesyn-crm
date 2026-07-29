import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { UserCog, Plus, ShieldCheck, Mail, Phone, CheckCircle, Power } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user: currentUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'SALES_EXECUTIVE',
    phone: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ role: roleFilter || undefined });
      if (res.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.createUser(form);
      if (res.success) {
        setIsAddModalOpen(false);
        setForm({ name: '', email: '', password: 'password123', role: 'SALES_EXECUTIVE', phone: '' });
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await userService.toggleStatus(id);
      if (res.success) fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-brand-500" /> Team & Employee Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage organization members, roles, and access credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="SALES_EXECUTIVE">Sales Executive</option>
          </select>

          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading employee directory..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((u) => (
            <div key={u.id} className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <img
                    src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`}
                    alt={u.name}
                    className="w-12 h-12 rounded-full border-2 border-brand-500/30 object-cover"
                  />
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="mt-3 font-bold text-base text-slate-900 dark:text-white">{u.name}</h3>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  <ShieldCheck className="w-3 h-3" /> {u.role.replace('_', ' ')}
                </span>

                <div className="mt-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}</p>
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone || 'N/A'}</p>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 font-medium">
                  <div>Leads Assigned: <strong>{u._count?.assignedLeads || 0}</strong></div>
                  <div>Customers: <strong>{u._count?.assignedCustomers || 0}</strong></div>
                  <div>Deals Managed: <strong>{u._count?.assignedOpportunities || 0}</strong></div>
                  <div>Active Tasks: <strong>{u._count?.assignedTasks || 0}</strong></div>
                </div>
              </div>

              {currentUser?.role === 'ADMIN' && u.id !== currentUser.id && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      u.active
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {u.active ? 'Deactivate Account' : 'Activate Account'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee Account">
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Elena Rostova"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="elena@company.com"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
              >
                <option value="SALES_EXECUTIVE">Sales Executive</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 017-3344"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Initial Password *</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold">Create Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
