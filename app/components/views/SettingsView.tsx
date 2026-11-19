// app/components/views/SettingsView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import {
  Settings, Store, Building, Save, ShieldCheck, Percent,
  Truck, RotateCcw, Download, Bell, CheckCircle2, MapPin, CreditCard
} from 'lucide-react';

export default function SettingsView() {
  const {
    employerConfig,
    setEmployerConfig,
    cashFloat,
    setCashFloat,
    branches,
    currentBranchId,
    setCurrentBranchId,
    notify
  } = useMetric();

  // Τοπική κατάσταση για αναλυτικές παραμέτρους λειτουργίας & φορολογίας
  const [taxAndLegal, setTaxAndLegal] = useState({
    kad: '56.10.11 - Υπηρεσίες παροχής γευμάτων από εστιατόρια',
    accountantName: 'Λογιστικό Γραφείο Αθηνών',
    accountantPhone: '2103600000',
    standardVat: 24,
    reducedVat: 13,
    strictPosAccounting: true
  });

  const [operationsConfig, setOperationsConfig] = useState({
    efoodCommissionPct: 14,
    woltCommissionPct: 15,
    boxCommissionPct: 0,
    monthlyBreakEvenGoal: 24000,
    lowStockAlertsEnabled: true,
    zVarianceAlertThreshold: 5
  });

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Συγχρονισμός αρχικών στοιχείων επιχείρησης αν λείπει κάτι από το context
  useEffect(() => {
    if (!employerConfig?.storeName) {
      setEmployerConfig((prev: any) => ({
        ...prev,
        storeName: 'blysscafe Athens',
        legalTitle: 'ΒΗΣΣΑΡΙΩΝ ΖΑΡΑ & ΣΙΑ Ε.Ε.',
        afm: '801948271',
        doy: 'Β’ ΑΘΗΝΩΝ',
        addressStreet: 'Πατριάρχου Ιωακείμ 42, Κολωνάκι',
        senderViberPhone: '306981234567',
        primaryBankIban: 'GR1101101200000000123456789'
      }));
    }
  }, []);

  const handleSaveAllSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nowTime = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    setLastSavedAt(nowTime);
    notify(`✔ Όλες οι ρυθμίσεις της επιχείρησης "${employerConfig?.storeName || 'blysscafe Athens'}" αποθηκεύτηκαν (${nowTime})!`);
  };

  const handleExportConfigJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      activeBranchId: currentBranchId,
      employerConfig,
      taxAndLegal,
      operationsConfig,
      cashFloat
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MetricOn_Settings_${(employerConfig?.afm || 'store')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('📥 Εξήχθη το αρχείο αντιγράφου ρυθμίσεων (.json)!');
  };

  const handleResetDefaults = () => {
    setEmployerConfig({
      storeName: 'blysscafe Athens',
      legalTitle: 'ΒΗΣΣΑΡΙΩΝ ΖΑΡΑ & ΣΙΑ Ε.Ε.',
      afm: '801948271',
      doy: 'Β’ ΑΘΗΝΩΝ',
      addressStreet: 'Πατριάρχου Ιωακείμ 42, Κολωνάκι',
      senderViberPhone: '306981234567',
      primaryBankIban: 'GR1101101200000000123456789'
    });
    setOperationsConfig({
      efoodCommissionPct: 14,
      woltCommissionPct: 15,
      boxCommissionPct: 0,
      monthlyBreakEvenGoal: 24000,
      lowStockAlertsEnabled: true,
      zVarianceAlertThreshold: 5
    });
    setCashFloat(150);
    notify('🔄 Οι παράμετροι επανήλθαν στις προεπιλεγμένες τιμές καταστήματος.');
  };

  const activeBranchObj = (branches || []).find((b: any) => b.id === currentBranchId);

  return (
    <form onSubmit={handleSaveAllSettings} className="space-y-6 text-slate-100">
      
      {/* Top Header & Save / Export Controls */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Settings className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">
                Ρυθμίσεις & Στοιχεία Επιχείρησης
              </h2>
              {lastSavedAt && (
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Αποθηκεύτηκε στις {lastSavedAt}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Διαχείριση φορολογικών στοιχείων, επωνυμίας, τραπεζικών λογαριασμών, προμηθειών delivery και λειτουργικών ορίων.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportConfigJson}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="h-4 w-4 text-blue-400" />
              <span>Εξαγωγή Ρυθμίσεων (.json)</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <span>Επαναφορά</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition"
            >
              <Save className="h-4 w-4" />
              <span>Αποθήκευση Αλλαγών</span>
            </button>
          </div>
        </div>

        {/* Active Branch Selector Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">
                Ενεργό Κατάστημα Διαχείρισης: {activeBranchObj?.name || employerConfig?.storeName || 'blysscafe - Κολωνάκι'}
              </span>
              <span className="text-[10px] text-slate-400">
                Οι αλλαγές στοιχείων εφαρμόζονται άμεσα στην κεφαλίδα, στις παραγγελίες και στα δελτία.
              </span>
            </div>
          </div>

          {branches && branches.length > 0 && (
            <select
              value={currentBranchId}
              onChange={(e) => {
                setCurrentBranchId(e.target.value);
                notify('📍 Ενημερώθηκε το ενεργό κατάστημα.');
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-emerald-500 focus:outline-none"
            >
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Grid: Store & Tax Info + Contact & Banking Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Στοιχεία Καταστήματος & Φορολογικά */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Store className="h-4 w-4 text-emerald-400" />
            <span>1. Στοιχεία Καταστήματος & Φορολογική Έδρα</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">Όνομα Καταστήματος:</label>
              <input
                type="text"
                value={employerConfig?.storeName || ''}
                onChange={(e) => setEmployerConfig({ ...employerConfig, storeName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Νομική Επωνυμία:</label>
              <input
                type="text"
                value={employerConfig?.legalTitle || ''}
                onChange={(e) => setEmployerConfig({ ...employerConfig, legalTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">ΑΦΜ:</label>
                <input
                  type="text"
                  value={employerConfig?.afm || ''}
                  onChange={(e) => setEmployerConfig({ ...employerConfig, afm: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">ΔΟΥ:</label>
                <input
                  type="text"
                  value={employerConfig?.doy || ''}
                  onChange={(e) => setEmployerConfig({ ...employerConfig, doy: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Κύριος ΚΑΔ / Δραστηριότητα:</label>
              <input
                type="text"
                value={taxAndLegal.kad}
                onChange={(e) => setTaxAndLegal({ ...taxAndLegal, kad: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-400 block mb-1">Λογιστήριο / Συνεργάτης:</label>
                <input
                  type="text"
                  value={taxAndLegal.accountantName}
                  onChange={(e) => setTaxAndLegal({ ...taxAndLegal, accountantName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Τηλέφωνο Λογιστηρίου:</label>
                <input
                  type="text"
                  value={taxAndLegal.accountantPhone}
                  onChange={(e) => setTaxAndLegal({ ...taxAndLegal, accountantPhone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Επικοινωνία, Τραπεζικά & Διαφάνεια */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="h-4 w-4 text-purple-400" />
            <span>2. Επικοινωνία, Τραπεζικά Στοιχεία & Έλεγχος</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">Διεύθυνση Καταστήματος:</label>
              <input
                type="text"
                value={employerConfig?.addressStreet || ''}
                onChange={(e) => setEmployerConfig({ ...employerConfig, addressStreet: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Τηλέφωνο Αποστολής Viber / Επικοινωνίας:</label>
              <input
                type="text"
                value={employerConfig?.senderViberPhone || ''}
                onChange={(e) => setEmployerConfig({ ...employerConfig, senderViberPhone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Βασικό IBAN Τράπεζας:</label>
              <input
                type="text"
                value={employerConfig?.primaryBankIban || ''}
                onChange={(e) => setEmployerConfig({ ...employerConfig, primaryBankIban: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Διαφανής Λογιστική Καταγραφή POS / Ταμείου</span>
                  <span className="text-[10px] text-slate-400">
                    Πλήρης συμφωνία δελτίων Ζ, καρτών & μετρητών χωρίς αποκλίσεις
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={taxAndLegal.strictPosAccounting}
                onChange={(e) => setTaxAndLegal({ ...taxAndLegal, strictPosAccounting: e.target.checked })}
                className="h-4 w-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Ειδοποιήσεις Χαμηλού Στοκ & Λήξεων</span>
                  <span className="text-[10px] text-slate-400">
                    Επισήμανση ειδών κάτω από το όριο ασφαλείας σε αποθήκη & παραγγελίες
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={operationsConfig.lowStockAlertsEnabled}
                onChange={(e) =>
                  setOperationsConfig({ ...operationsConfig, lowStockAlertsEnabled: e.target.checked })
                }
                className="h-4 w-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Delivery Commissions, Cash Float & Break-Even Targets */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Percent className="h-4 w-4 text-amber-400" />
              <span>3. Παράμετροι Delivery, Ρευστότητας Ταμείου & Στόχου Κάλυψης</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Ρυθμίστε τα ποσοστά προμηθειών πλατφορμών, το αρχικό float του συρταριού και τον μηνιαίο στόχο break-even.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-slate-400 block mb-1">Προμήθεια e-food (%):</label>
            <input
              type="number"
              step="0.5"
              value={operationsConfig.efoodCommissionPct}
              onChange={(e) =>
                setOperationsConfig({ ...operationsConfig, efoodCommissionPct: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold text-right"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-slate-400 block mb-1">Προμήθεια Wolt (%):</label>
            <input
              type="number"
              step="0.5"
              value={operationsConfig.woltCommissionPct}
              onChange={(e) =>
                setOperationsConfig({ ...operationsConfig, woltCommissionPct: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold text-right"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-slate-400 block mb-1">Προμήθεια Box / Web (%):</label>
            <input
              type="number"
              step="0.5"
              value={operationsConfig.boxCommissionPct}
              onChange={(e) =>
                setOperationsConfig({ ...operationsConfig, boxCommissionPct: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-right"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-slate-400 block mb-1">Αρχικό Cash Float (€):</label>
            <input
              type="number"
              step="5"
              value={cashFloat}
              onChange={(e) => setCashFloat(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-blue-500/40 text-blue-400 font-mono font-bold text-right"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <label className="text-slate-400 block mb-1">Στόχος Break-Even Μήνα (€):</label>
            <input
              type="number"
              step="100"
              value={operationsConfig.monthlyBreakEvenGoal}
              onChange={(e) =>
                setOperationsConfig({ ...operationsConfig, monthlyBreakEvenGoal: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-right"
            />
          </div>
        </div>
      </div>

    </form>
  );
}