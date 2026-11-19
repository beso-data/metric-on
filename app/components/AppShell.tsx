// app/components/AppShell.tsx
'use client';

import React from 'react';
import { useMetric } from '@/app/context/MetricContext';
import LoginView from '@/app/components/views/LoginView';
import StaffPortalView from '@/app/components/views/StaffPortalView';
import {
  LayoutDashboard, Camera, Boxes, Truck, ChefHat, FileText,
  Users, Settings, HelpCircle, TrendingUp, Phone, Printer,
  LogOut, CheckCircle2, X, Building2, UserCheck
} from 'lucide-react';
import { ActiveTabId } from '@/app/lib/types';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated, ownerTab, setOwnerTab, employerConfig, authRole, setAuthRole, setIsAuthenticated,
    branches, currentBranchId, setCurrentBranchId, toastMessage, notify,
    viberPreviewModal, setViberPreviewModal, handleGenerateSampleZPdf
  } = useMetric();

  const navItems: { id: ActiveTabId; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Ταμπλό Ελέγχου', icon: LayoutDashboard },
    { id: 'sales', label: 'Ταμείο & Κλείσιμο Ζ', icon: Camera },
    { id: 'inventory', label: 'Αποθήκη & Παραγγελίες', icon: Boxes },
    { id: 'suppliers', label: 'Προμηθευτές & Κατάλογοι', icon: Truck },
    { id: 'recipes', label: 'Συνταγές BOM', icon: ChefHat },
    { id: 'invoices', label: 'Οικονομικά & Πάγια', icon: FileText },
    { id: 'payroll', label: 'Προσωπικό & Μισθοδοσία', icon: Users },
    { id: 'settings', label: 'Ρυθμίσεις Επιχείρησης', icon: Settings },
    { id: 'support', label: 'Υποστήριξη & FAQ', icon: HelpCircle },
  ];

  // Αν δεν έχει γίνει σύνδεση ή εγγραφή, δείχνει πρώτα την οθόνη Login / Εγγραφής
  if (!isAuthenticated) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-300 max-w-md">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        <LoginView />
      </>
    );
  }

  // Όταν ο ρόλος είναι Προσωπικό ('staff'), εμφανίζεται απευθείας το Staff Portal
  if (authRole === 'staff') {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-300 max-w-md">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
        <StaffPortalView />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-300 max-w-md">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Viber Dispatch */}
      {viberPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-purple-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">Viber Dispatch</span>
                <h3 className="text-base font-extrabold text-white mt-1">Αποστολή σε {viberPreviewModal.supplier}</h3>
              </div>
              <button onClick={() => setViberPreviewModal(null)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <textarea rows={7} readOnly value={viberPreviewModal.text} className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-emerald-300 font-mono" />
            <button onClick={() => { navigator.clipboard.writeText(viberPreviewModal.text); setViberPreviewModal(null); notify('Αντιγράφηκε!'); }} className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs">
              Αντιγραφή & Κλείσιμο
            </button>
          </div>
        </div>
      )}

      {/* ΑΡΙΣΤΕΡΟ SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-slate-900/95 shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md">
            <TrendingUp className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">Metric•On</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
              👑 SaaS ERP v2.0
            </span>
          </div>
        </div>

        <div className="p-3.5 border-b border-slate-800/80">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1.5">
            <Building2 className="h-3 w-3 text-emerald-400" />
            <span>Ενεργό Κατάστημα (Branch)</span>
          </label>
          <select
            value={currentBranchId}
            onChange={(e) => {
              setCurrentBranchId(e.target.value);
              notify('Αλλαγή ενεργού καταστήματος!');
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = ownerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setOwnerTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Γρήγορη μετάβαση στο Staff Portal */}
          <div className="pt-2 mt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setAuthRole('staff');
                notify('📱 Άνοιξε το Staff Portal (Περιβάλλον Βάρδιας Προσωπικού).');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition"
            >
              <UserCheck className="h-4 w-4 shrink-0 text-blue-400" />
              <span>Staff Portal (Tablet)</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span>Ρόλος:</span>
            <strong className="text-emerald-400">{authRole === 'owner' ? '👑 Διαχειριστής' : '📱 Προσωπικό'}</strong>
          </div>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              notify('Αποσυνδεθήκατε με επιτυχία.');
            }}
            className="w-full py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Αποσύνδεση</span>
          </button>
        </div>
      </aside>

      {/* ΚΥΡΙΩΣ ΠΕΡΙΕΧΟΜΕΝΟ */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-white">
              {navItems.find((n) => n.id === ownerTab)?.label} • <span className="text-emerald-400">{employerConfig.storeName}</span>
            </h2>
            <p className="text-[11px] text-slate-400">{employerConfig.legalTitle} (ΑΦΜ: {employerConfig.afm})</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Phone className="h-3.5 w-3.5 text-purple-400" />
              <span>Viber: <strong className="text-white">+{employerConfig.senderViberPhone}</strong></span>
            </span>
            <button onClick={handleGenerateSampleZPdf} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs">
              <Printer className="h-3.5 w-3.5" /><span>🖨️ Δοκιμαστικό PDF Ζ</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}