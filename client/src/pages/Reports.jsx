import React, { useState, useEffect } from 'react';
import { reportService } from '../services/crmServices';
import { userService } from '../services/userService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ExportButtons from '../components/ExportButtons';
import { BarChart3, Calendar, DollarSign, Award, Users, Filter, Download } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [users, setUsers] = useState([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getReports({ startDate, endDate, assignedToId });
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, assignedToId]);

  useEffect(() => {
    userService.getUsers().then((res) => {
      if (res.success) setUsers(res.data.users || []);
    }).catch(console.error);
  }, []);

  if (loading) return <LoadingSpinner label="Generating Salesyn analytical reports..." />;
  if (!reports) return <div className="p-8 text-center">Failed to load reports.</div>;

  const { summary, employeePerformance, leadSourceReport } = reports;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-500" /> Salesyn Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit team revenue performance, lead acquisition channels, and conversion metrics.
          </p>
        </div>

        <ExportButtons data={employeePerformance} filename="salesyn_executive_performance" />
      </div>

      {/* Date & Rep Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Executive:</label>
          <select
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">All Team Members</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <p className="text-xs font-medium text-slate-500">Total Revenue</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${Number(summary.totalRevenue).toLocaleString()}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <p className="text-xs font-medium text-slate-500">Total Leads</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{summary.totalLeads}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <p className="text-xs font-medium text-slate-500">Total Customers</p>
          <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">{summary.totalCustomers}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <p className="text-xs font-medium text-slate-500">Total Deals</p>
          <p className="text-xl font-black text-brand-600 dark:text-brand-400 mt-1">{summary.totalDeals}</p>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm space-y-3">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Executive Sales Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Executive Name</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Leads Assigned</th>
                <th className="p-3.5">Leads Converted</th>
                <th className="p-3.5">Deals Won</th>
                <th className="p-3.5">Total Revenue ($)</th>
                <th className="p-3.5">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {employeePerformance.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{emp.name}</td>
                  <td className="p-3.5 text-slate-500">{emp.role.replace('_', ' ')}</td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{emp.totalLeads}</td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{emp.convertedLeads}</td>
                  <td className="p-3.5 font-bold text-emerald-600">{emp.wonDeals}</td>
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">${Number(emp.totalRevenue).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-brand-600">{emp.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Source Performance Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" /> Lead Source Acquisition Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Source Channel</th>
                <th className="p-3.5">Total Leads</th>
                <th className="p-3.5">Converted</th>
                <th className="p-3.5">Est. Pipeline Value</th>
                <th className="p-3.5">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {leadSourceReport.map((src) => (
                <tr key={src.source} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{src.source}</td>
                  <td className="p-3.5 font-semibold">{src.totalLeads}</td>
                  <td className="p-3.5 font-semibold text-emerald-600">{src.convertedLeads}</td>
                  <td className="p-3.5 font-bold">${Number(src.totalEstimatedValue).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-brand-600">{src.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
