import React from 'react';
import { Download, Printer } from 'lucide-react';

const ExportButtons = ({ data = [], filename = 'salesyn_report', headers = [] }) => {
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    const keys = headers.length > 0 ? headers.map(h => h.key) : Object.keys(data[0]);
    const labels = headers.length > 0 ? headers.map(h => h.label) : Object.keys(data[0]);

    let csvContent = 'data:text/csv;charset=utf-8,' + labels.join(',') + '\n';

    data.forEach((row) => {
      const line = keys.map((key) => {
        let val = row[key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        // Escape quotes
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',');
      csvContent += line + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToCSV}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        Print PDF
      </button>
    </div>
  );
};

export default ExportButtons;
