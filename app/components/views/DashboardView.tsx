// app/components/views/DashboardView.tsx
'use client';

import React, { useState } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import {
  LayoutDashboard, Package, Receipt, ShieldCheck, ArrowUpRight,
  Zap, RefreshCw, Send, Coffee, PieChart, Bell, Check, Trash2, Calendar
} from 'lucide-react';

export default function DashboardView() {
  const {
    totalTurnover,
    zPrintedCash,
    posCards,
    setOwnerTab,
    notify,
    employerConfig,
    staffAlerts,
    dismissStaffAlert,
    clearAllStaffAlerts,
    staffRequests
  } = useMetric();

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [coffeePriceIncrease, setCoffeePriceIncrease] = useState(0.20);

  const timeframeMultiplier = timeframe === 'today' ? 1 : timeframe === 'week' ? 7 : 30;
  const estimatedExtraProfit = +(540 * coffeePriceIncrease * timeframeMultiplier).toFixed(2);

  const pendingRequestsCount = (staffRequests || []).filter((r) => r.status === 'Εκκρεμεί').length;

  const handleRefreshDashboard = () => {
    notify('🔄 Τα δεδομένα του ταμπλό ανανεώθηκαν επιτυχώς!');
  };

  return (
    <div className="space-y-6 text-slate-100">

      {/* Top Header & Interactive Timeframe Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-white truncate">Επισκόπηση Επιχείρησης & Live Δείκτες</h2>
            <p className="text-xs text-slate-400 truncate">
              Κατάστημα: <span className="text-emerald-400 font-bold">{employerConfig?.storeName}</span> ({employerConfig?.afm})
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1 flex-1 sm:flex-initial justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => { setTimeframe('today'); notify('Φίλτρο: Σήμερα'); }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${timeframe === 'today' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Σήμερα
            </button>
            <button
              type="button"
              onClick={() => { setTimeframe('week'); notify('Φίλτρο: Τρέχουσα Εβδομάδα'); }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${timeframe === 'week' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Εβδομάδα
            </button>
            <button
              type="button"
              onClick={() => { setTimeframe('month'); notify('Φίλτρο: Τρέχων Μήνας'); }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${timeframe === 'month' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Μήνας
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefreshDashboard}
            title="Ανανέωση Δεδομένων"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Live Banner Ειδοποιήσεων Βάρδιας & Εκκρεμών Αιτημάτων */}
      {(pendingRequestsCount > 0 || (staffAlerts && staffAlerts.length > 0)) && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
              <Bell className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Ειδοποιήσεις Βάρδιας & Εκκρεμότητες Εργοδότη</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {pendingRequestsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setOwnerTab('payroll')}
                  className="px-3 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 font-extrabold text-[11px] flex items-center gap-1 transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{pendingRequestsCount} Αιτήματα Προσωπικού προς Έγκριση</span>
                </button>
              )}
              {staffAlerts && staffAlerts.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllStaffAlerts}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Καθαρισμός Όλων</span>
                </button>
              )}
            </div>
          </div>

          {staffAlerts && staffAlerts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {staffAlerts.slice(0, 4).map((al) => (
                <div
                  key={al.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-white block">{al.title}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{al.details}</p>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      {al.staffName} • {al.time}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissStaffAlert(al.id)}
                    title="Σήμανση ως διευθετημένο"
                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 shrink-0 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setOwnerTab('sales')}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 flex items-center gap-2.5 sm:gap-3 transition text-left group min-w-0"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition shrink-0">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Καταχώρηση Ζ</span>
            <span className="text-[10px] text-slate-400 block truncate">Δελτία & Έλεγχος</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setOwnerTab('suppliers')}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 flex items-center gap-2.5 sm:gap-3 transition text-left group min-w-0"
        >
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition shrink-0">
            <Send className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Παραγγελία Viber</span>
            <span className="text-[10px] text-slate-400 block truncate">Αυτόματη αποστολή</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setOwnerTab('inventory')}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 flex items-center gap-2.5 sm:gap-3 transition text-left group min-w-0"
        >
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition shrink-0">
            <Package className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Αποθήκη & Stock</span>
            <span className="text-[10px] text-slate-400 block truncate">Όρια ασφαλείας</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setOwnerTab('payroll')}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 flex items-center gap-2.5 sm:gap-3 transition text-left group min-w-0"
        >
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Προσωπικό</span>
            <span className="text-[10px] text-slate-400 block truncate">Συμβάσεις & Ωράρια</span>
          </div>
        </button>
      </div>

      {/* Main Interactive KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setOwnerTab('sales')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 cursor-pointer hover:border-emerald-500/40 transition group"
        >
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
              Συνολικός Τζίρος ({timeframe === 'today' ? 'Σήμερα' : timeframe === 'week' ? 'Εβδομάδα' : 'Μήνας'})
            </span>
            <ArrowUpRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{(totalTurnover * timeframeMultiplier).toLocaleString()} €</p>
          <span className="text-[10px] text-slate-500 block">
            ΦΠΑ 24%: {((totalTurnover * timeframeMultiplier) - ((totalTurnover * timeframeMultiplier) / 1.24)).toFixed(2)} €
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Καθαρά στη Τσέπη</span>
          <p className="text-3xl font-black text-white">{(2128.90 * timeframeMultiplier).toLocaleString()} €</p>
          <span className="text-[10px] text-emerald-400 block">Μετά αφαίρεση εξόδων & παγίων</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Prime Cost (Labor + COGS)</span>
          <p className="text-3xl font-black text-amber-400">34.2%</p>
          <span className="text-[10px] text-slate-500 block">Μισθοδοσία: 18.5% • Α’ Υλες: 15.7%</span>
        </div>

        <div
          onClick={() => setOwnerTab('invoices')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 cursor-pointer hover:border-blue-500/40 transition group"
        >
          <div className="flex justify-between items-start gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Κάλυψη Break-Even</span>
            <ArrowUpRight className="h-4 w-4 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
          </div>
          <p className="text-3xl font-black text-blue-400">70.2%</p>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70.2%' }}></div>
          </div>
          <span className="text-[10px] text-slate-500 block">16.850 € / 24.000 € στόχος</span>
        </div>
      </div>

      {/* Second Row: Anti-Theft Coffee Check & Interactive Profitability Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase flex items-center gap-2">
              <Coffee className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Έλεγχος Κατανάλωσης Καφέ (Anti-Theft & Calibration)</span>
            </h3>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">Active Shield</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Πωληθέντες:</span>
              <span className="text-white font-black text-sm">540 τεμ.</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Θεωρητικά:</span>
              <span className="text-amber-400 font-black text-sm">10.21 kg</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Πραγματικά:</span>
              <span className="text-emerald-400 font-black text-sm">8.4 kg</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">* Ο αλγόριθμος anti-theft δεν εντόπισε αποκλίσεις στις εκχυλίσεις.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Προσομοιωτής Κερδοφορίας («Τι θα γίνει αν...»)</span>
            </h3>
            <span className="text-xs text-amber-400 font-bold">What-If Analysis</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-slate-400">Αύξηση τιμής καφέ (+{coffeePriceIncrease.toFixed(2)}€):</span>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={coffeePriceIncrease}
                onChange={(e) => setCoffeePriceIncrease(parseFloat(e.target.value) || 0)}
                className="w-full sm:w-36 accent-emerald-500 cursor-pointer"
              />
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center gap-2">
              <span className="text-white font-bold">Επιπλέον Κέρδος ({timeframe === 'today' ? 'Ημέρας' : timeframe === 'week' ? 'Εβδομάδας' : 'Μήνα'}):</span>
              <span className="text-emerald-400 font-black text-sm font-mono shrink-0">+{estimatedExtraProfit.toLocaleString()} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Hourly Sales Chart & 3-Tier Cash Liquidity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase">Ρυθμός Πωλήσεων ανά Ώρα (Hourly Sales Peak)</h3>
            <span className="text-xs text-slate-400 font-mono">Αιχμή: 11:00 - 13:00</span>
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-9 gap-2 items-end h-36 pt-4 min-w-[360px]">
              {[35, 60, 140, 280, 180, 240, 110, 140, 80].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group cursor-pointer">
                  <div className="w-full bg-emerald-500/80 rounded-t transition" style={{ height: `${(val / 300) * 100}%` }}></div>
                  <span className="text-[10px] text-slate-500 font-mono">{7 + idx}:00</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase">Ταμεία & Ρευστότητα (3-Tier Cash)</h3>
          <div className="space-y-3 text-xs font-mono">
            <div
              onClick={() => { setOwnerTab('sales'); notify('Μετάβαση στον έλεγχο ταμείου συρταριού'); }}
              className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition group gap-2"
            >
              <span className="text-slate-400 font-sans group-hover:text-white transition">1. Μετρητά Συρταριού:</span>
              <span className="text-emerald-400 font-bold shrink-0">785.00 €</span>
            </div>
            <div
              onClick={() => notify('Το χρηματοκιβώτιο είναι ασφαλές. Τελευταία κατάθεση: χθες βράδυ.')}
              className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition group gap-2"
            >
              <span className="text-slate-400 font-sans group-hover:text-white transition">2. Χρηματοκιβώτιο (Safe Box):</span>
              <span className="text-white font-bold shrink-0">1.850,00 €</span>
            </div>
            <div
              onClick={() => notify('Τραπεζικός λογαριασμός όψεως επιβεβαιωμένος.')}
              className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition group gap-2"
            >
              <span className="text-slate-400 font-sans group-hover:text-white transition">3. Τράπεζα / Όψεις:</span>
              <span className="text-blue-400 font-bold shrink-0">4.280,50 €</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );