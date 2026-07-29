import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/crmServices';
import { Search, Users, Building2, TrendingUp, X, Loader2, ArrowRight } from 'lucide-react';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ leads: [], customers: [], opportunities: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ leads: [], customers: [], opportunities: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.searchAll(query);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  const totalResults = results.leads.length + results.customers.length + results.opportunities.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, customers, deals, companies..."
            autoFocus
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
          />
          {loading && <Loader2 className="w-5 h-5 text-brand-500 animate-spin flex-shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {!query.trim() && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type at least 2 characters to search across all Salesyn records.
            </div>
          )}

          {query.trim() && !loading && totalResults === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              No matching records found for "{query}".
            </div>
          )}

          {/* Leads Results */}
          {results.leads.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Leads ({results.leads.length})
              </h4>
              <div className="space-y-1">
                {results.leads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => handleSelect(`/leads`)}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {lead.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lead.company || 'No Company'} • {lead.email}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Results */}
          {results.customers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Customers ({results.customers.length})
              </h4>
              <div className="space-y-1">
                {results.customers.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => handleSelect(`/customers/${cust.id}`)}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {cust.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {cust.company || 'Private'} • {cust.city || 'No Location'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Results */}
          {results.opportunities.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Opportunities ({results.opportunities.length})
              </h4>
              <div className="space-y-1">
                {results.opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => handleSelect(`/opportunities`)}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {opp.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Stage: {opp.stage}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      ${Number(opp.value).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
