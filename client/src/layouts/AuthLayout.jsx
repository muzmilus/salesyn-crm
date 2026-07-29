import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto shadow-xl shadow-brand-500/25 mb-4">
          <svg className="w-9 h-9 text-white" viewBox="0 0 100 100" fill="none">
            <path d="M70 32C70 25.3726 62.8366 20 54 20C43 20 32 25 32 35C32 46 68 44 68 56C68 67 56 72 44 72C34.5 72 28 66 28 60" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="70" cy="32" r="6" fill="#38bdf8"/>
            <circle cx="28" cy="60" r="6" fill="#38bdf8"/>
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Salesyn
        </h1>
        <p className="mt-1 text-sm font-semibold text-brand-300 tracking-wider">
          Your Sales, Synchronized.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
