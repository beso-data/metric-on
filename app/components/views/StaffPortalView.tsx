// app/components/views/StaffPortalView.tsx
'use client';

import React, { useState } from 'react';
import { useMetric, StaffRequestItem } from '@/app/context/MetricContext';
import {
  UserCheck, Clock, DollarSign, Package, Utensils, ClipboardCheck,
  LogOut, Coffee, Wrench, Calendar, Lock, Calculator,
  Eye, ShieldCheck
} from 'lucide-react';

interface StaffProfile {
  id: number;
  name: string;
  role: string;
  pin: string;
  contractType: string;
  weeklyHours: number;
  schedule: { [day: string]: string };
}

const STORE_STAFF_PROFILES: StaffProfile[] = [
  {
    id: 1,
    name: 'Γιώργος Αλεξίου',
    role: 'Cashier / Barista',
    pin: '1234',
    contractType: 'Part-time (Μερική)',
    weeklyHours: 40,
    schedule: {
      Δευ: '07:00-15:00',
      Τρι: '07:00-15:00',
      Τετ: '07:00-15:00',
      Πεμ: 'ΡΕΠΟ',
      Παρ: '07:00-15:00',
      Σαβ: '08:00-16:00',
      Κυρ: 'ΡΕΠΟ'
    }
  },
  {
    id: 2,
    name: 'Μαρία Κωνσταντίνου',
    role: 'Senior Barista & Shift Lead',
    pin: '5678',
    contractType: 'Full-time (Πλήρης)',
    weeklyHours: 40,
    schedule: {
      Δευ: '15:00-23:00',
      Τρι: '15:00-23:00',
      Τετ: 'ΡΕΠΟ',
      Πεμ: '15:00-23:00',
      Παρ: '15:00-23:00',
      Σαβ: 'ΡΕΠΟ',
      Κυρ: '10:00-18:00'
    }
  }
];

interface ChecklistTask {
  id: string;
  shiftType: 'Άνοιγμα' | 'Λειτουργία & HACCP' | 'Κλείσιμο';
  label: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

const INITIAL_SOP_CHECKLIST: ChecklistTask[] = [
  { id: 'c1', shiftType: 'Άνοιγμα', label: 'Προθέρμανση μηχανής Espresso & ρύθμιση άλεσης μύλου (18gr / 28sec)', completed: true, completedBy: 'Γιώργος Α.', completedAt: '07:10' },
  { id: 'c2', shiftType: 'Άνοιγμα', label: 'Καταμέτρηση αρχικού ταμείου (Float) & έλεγχος POS τερματικών', completed: true, completedBy: 'Γιώργος Α.', completedAt: '07:15' },
  { id: 'c3', shiftType: 'Λειτουργία & HACCP', label: 'Έλεγχος θερμοκρασίας ψυγείων γάλακτος (2°C - 4°C) & βιτρίνας snacks', completed: false },
  { id: 'c4', shiftType: 'Λειτουργία & HACCP', label: 'Αναπλήρωση ποτηριών, καπακιών & καλαμακιών στον πάγκο takeaway', completed: false },
  { id: 'c5', shiftType: 'Κλείσιμο', label: 'Backflush καθαρισμός γκρουπ μηχανής & αδειάσμα/πλύσιμο μύλων καφέ', completed: false },
  { id: 'c6', shiftType: 'Κλείσιμο', label: 'Τυφλή καταμέτρηση συρταριού (Blind Cash Count) & παράδοση βάρδιας', completed: false }
];

const BARISTA_RECIPES_SOP = [
  {
    name: 'Freddo Espresso',
    category: 'Κρύος Καφές',
    glass: 'Ποτήρι Takeaway 400ml',
    steps: ['18gr Espresso (Διπλή δόση ~38-40ml)', '3 παγάκια στη φραπιέρα (χτύπημα 8 δευτ.)', 'Γέμισμα ποτηριού με πάγο & σερβίρισμα']
  },
  {
    name: 'Freddo Cappuccino',
    category: 'Κρύος Καφές',
    glass: 'Ποτήρι Takeaway 400ml',
    steps: ['18gr Espresso (Διπλή δόση)', '140ml κρύο φρέσκο γάλα 3.5% (αφρόγαλα 15 δευτ.)', 'Προσθήκη αφρογάλατος στην κορυφή & καπάκι espresso']
  },
  {
    name: 'Cappuccino Double',
    category: 'Ζεστός Καφές',
    glass: 'Ποτήρι 12oz / Κούπα',
    steps: ['18gr Espresso (Διπλή δόση)', '160ml ζεστό βελούδινο αφρόγαλα (60°C-65°C)', 'Latte art & σερβίρισμα με καπάκι sip']
  },
  {
    name: 'Club Sandwich Classic',
    category: 'Κουζίνα / Snacks',
    glass: 'Takeaway Kraft Box',
    steps: ['3 φέτες φρυγανισμένο ψωμί τοστ', '90gr ζαμπόν & μπέικον, 60gr τυρί Gouda, ντομάτα, μαρούλι, σως', '150gr τηγανητές πατάτες μερίδα']
  }
];

export default function StaffPortalView() {
  const {
    employerConfig,
    setAuthRole,
    setIsAuthenticated,
    setPhysicalDrawerCounted,
    drawerExpenses,
    setDrawerExpenses,
    staffRequests,
    setStaffRequests,
    addStaffAlert,
    notify
  } = useMetric();

  const [activeStaffId, setActiveStaffId] = useState<number>(1);
  const [pinVerified, setPinVerified] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>('');

  const [staffTab, setStaffTab] = useState<'shift' | 'cash' | 'stock_waste' | 'recipes_sop' | 'requests'>('requests');

  // 1. Ψηφιακή Κάρτα Εργασίας
  const [clockStatus, setClockStatus] = useState<'OFF' | 'WORKING' | 'BREAK'>('WORKING');
  const [clockLogs, setClockLogs] = useState<{ id: number; staffName: string; action: string; time: string; erganiSynced: boolean }[]>([
    { id: 1, staffName: 'Γιώργος Αλεξίου', action: 'Έναρξη Βάρδιας (Check-In)', time: '07:02', erganiSynced: true }
  ]);

  // 2. Blind Cash Count
  const [denoms, setDenoms] = useState<{ [key: string]: number }>({
    '50': 5, '20': 18, '10': 14, '5': 10, '2': 8, '1': 12, '0.5': 8
  });
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverSubmitted, setHandoverSubmitted] = useState(false);

  const [shiftExpReason, setShiftExpReason] = useState('');
  const [shiftExpAmount, setShiftExpAmount] = useState('');

  // 3. Ελλείψεις / Φθορές / Βλάβες
  const [stockReports, setStockReports] = useState<{ id: number; type: 'LOW_STOCK' | 'WASTE'; item: string; qtyNote: string; staff: string; time: string }[]>([
    { id: 101, type: 'LOW_STOCK', item: 'Espresso Beans Taf (Specialty Blend)', qtyNote: 'Έμειναν 2 σακούλες στον πάγκο', staff: 'Γιώργος Αλεξίου', time: '11:30' }
  ]);
  const [reportType, setReportType] = useState<'LOW_STOCK' | 'WASTE'>('LOW_STOCK');
  const [reportItem, setReportItem] = useState('Γάλα Φρέσκο Πλήρες 3.5%');
  const [reportQtyNote, setReportQtyNote] = useState('');

  const [equipmentIssue, setEquipmentIssue] = useState('');
  const [maintenanceTickets, setMaintenanceTickets] = useState<{ id: number; issue: string; urgency: string; staff: string; time: string }[]>([]);

  // 4. Checklist
  const [checklist, setChecklist] = useState<ChecklistTask[]>(INITIAL_SOP_CHECKLIST);

  // 5. Αιτήματα Άδειας / Αλλαγής Βάρδιας / Προκαταβολής
  const [reqType, setReqType] = useState<StaffRequestItem['type']>('Άδεια / Ρεπό');
  const [reqDateOrAmount, setReqDateOrAmount] = useState('');
  const [reqDetails, setReqDetails] = useState('');
  const [allowPeerVisibility, setAllowPeerVisibility] = useState<boolean>(true);

  const currentStaff = STORE_STAFF_PROFILES.find((s) => s.id === activeStaffId) || STORE_STAFF_PROFILES[0];

  const handleSwitchStaff = (nextId: number) => {
    setActiveStaffId(nextId);
    setPinVerified(false);
    setPinInput('');
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === currentStaff.pin || pinInput === '0000') {
      setPinVerified(true);
      notify(`✔ Καλωσήρθες στη βάρδια, ${currentStaff.name}!`);
    } else {
      notify('⚠️ Λάθος PIN. Δοκιμάστε το 4ψήφιο PIN σας (π.χ. 1234 ή 5678).');
    }
  };

  const handleClockAction = (nextStatus: 'WORKING' | 'BREAK' | 'OFF', label: string) => {
    const nowTime = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    setClockStatus(nextStatus);
    setClockLogs((prev) => [
      { id: Date.now(), staffName: currentStaff.name, action: label, time: nowTime, erganiSynced: true },
      ...prev
    ]);
    notify(`🕒 ${label} καταγράφηκε στις ${nowTime} για ${currentStaff.name}.`);
  };

  const countedCashTotal = +Object.entries(denoms)
    .reduce((acc, [val, count]) => acc + parseFloat(val) * (count || 0), 0)
    .toFixed(2);

  const handleSubmitBlindCashCount = () => {
    setPhysicalDrawerCounted(countedCashTotal);
    setHandoverSubmitted(true);
    addStaffAlert({
      category: 'CASH_HANDOVER',
      title: `Καταμέτρηση Συρταριού: ${countedCashTotal.toFixed(2)} €`,
      details: handoverNotes.trim() || 'Παράδοση μετρητών βάρδιας από Staff Portal.',
      staffName: currentStaff.name
    });
    notify(`🔒 Η καταμέτρηση συρταριού (${countedCashTotal.toFixed(2)} €) στάλθηκε στο Ταμείο του Εργοδότη!`);
  };

  const handleAddShiftExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(shiftExpAmount);
    if (!shiftExpReason.trim() || isNaN(num) || num <= 0) {
      notify('⚠️ Συμπληρώστε αιτιολογία και ποσό μικροεξόδου.');
      return;
    }
    const nowTime = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    setDrawerExpenses([
      {
        id: Date.now(),
        reason: `${shiftExpReason.trim()} (${currentStaff.name.split(' ')[0]})`,
        category: 'Αναλώσιμα',
        amount: +num.toFixed(2),
        time: nowTime
      },
      ...drawerExpenses
    ]);
    setShiftExpReason('');
    setShiftExpAmount('');
    notify(`✔ Το έξοδο βάρδιας (${num.toFixed(2)} €) ενημέρωσε το Ταμείο του Εργοδότη!`);
  };

  const handleAddStockReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportQtyNote.trim()) {
      notify('⚠️ Περιγράψτε την ποσότητα που λείπει ή χάθηκε.');
      return;
    }
    const nowTime = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    setStockReports([
      {
        id: Date.now(),
        type: reportType,
        item: reportItem,
        qtyNote: reportQtyNote.trim(),
        staff: currentStaff.name,
        time: nowTime
      },
      ...stockReports
    ]);
    addStaffAlert({
      category: reportType,
      title: `${reportType === 'LOW_STOCK' ? 'Έλλειψη Υλικού' : 'Φθορά / Απώλεια'}: ${reportItem}`,
      details: reportQtyNote.trim(),
      staffName: currentStaff.name
    });
    setReportQtyNote('');
    notify(
      reportType === 'LOW_STOCK'
        ? `📦 Ειδοποίηση έλλειψης για "${reportItem}" στάλθηκε στον Εργοδότη!`
        : `🔥 Δήλωση φθοράς για "${reportItem}" καταχωρήθηκε!`
    );
  };

  const handleReportEquipmentIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentIssue.trim()) return;
    const nowTime = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    setMaintenanceTickets([
      {
        id: Date.now(),
        issue: equipmentIssue.trim(),
        urgency: 'Άμεσος Έλεγχος',
        staff: currentStaff.name,
        time: nowTime
      },
      ...maintenanceTickets
    ]);
    addStaffAlert({
      category: 'MAINTENANCE',
      title: 'Αναφορά Βλάβης Εξοπλισμού',
      details: equipmentIssue.trim(),
      staffName: currentStaff.name
    });
    setEquipmentIssue('');
    notify('🔧 Η αναφορά τεχνικής βλάβης στάλθηκε άμεσα στον Εργοδότη!');
  };

  const handleToggleChecklist = (id: string) => {
    const nowTime = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    setChecklist((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextDone = !task.completed;
          return {
            ...task,
            completed: nextDone,
            completedBy: nextDone ? currentStaff.name.split(' ')[0] : undefined,
            completedAt: nextDone ? nowTime : undefined
          };
        }
        return task;
      })
    );
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDetails.trim()) {
      notify('⚠️ Γράψτε λεπτομέρειες για το αίτημά σας.');
      return;
    }

    const newReq: StaffRequestItem = {
      id: Date.now(),
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      type: reqType,
      dateOrAmount: reqDateOrAmount.trim() || (reqType === 'Προκαταβολή Μισθού' ? '100€' : 'Επόμενη εβδομάδα'),
      details: reqDetails.trim(),
      status: 'Εκκρεμεί',
      visibleToPeers: reqType === 'Προκαταβολή Μισθού' ? false : allowPeerVisibility,
      createdAt: new Date().toLocaleDateString('el-GR')
    };

    setStaffRequests([newReq, ...staffRequests]);
    setReqDateOrAmount('');
    setReqDetails('');
    notify(`📨 Το αίτημα (${reqType}) στάλθηκε στον Εργοδότη για έγκριση!`);
  };

  const completedChecklistCount = checklist.filter((c) => c.completed).length;

  const visibleApprovedPeerLeaves = staffRequests.filter(
    (r) => r.status === 'Εγκρίθηκε' && r.visibleToPeers && r.type !== 'Προκαταβολή Μισθού'
  );

  const myRequests = staffRequests.filter((r) => r.staffName === currentStaff.name);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full min-w-0 space-y-6">

        {/* Top Staff Tablet Header */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white break-words">
                  Staff Portal • {employerConfig?.storeName || 'blysscafe Athens'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Περιβάλλον Βάρδιας Προσωπικού
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Κάρτα εργασίας, παράδοση συρταριού, ελλείψεις ραφιού & συνταγές παρασκευής (Τα οικονομικά στοιχεία είναι κλειδωμένα).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs w-full sm:w-auto min-w-0">
              <span className="text-slate-400 shrink-0">Εργαζόμενος:</span>
              <select
                value={activeStaffId}
                onChange={(e) => handleSwitchStaff(Number(e.target.value))}
                className="w-full sm:w-auto max-w-full min-w-0 truncate bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
              >
                {STORE_STAFF_PROFILES.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} ({sp.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setAuthRole('owner');
                notify('👑 Επιστροφή σε Προβολή Εργοδότη / Διαχειριστή.');
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-extrabold text-xs transition whitespace-nowrap"
            >
              Εναλλαγή σε Εργοδότη
            </button>

            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Έξοδος</span>
            </button>
          </div>
        </div>

        {/* PIN Lock Screen */}
        {!pinVerified ? (
          <form
            onSubmit={handleVerifyPin}
            className="max-w-md mx-auto p-7 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Επιβεβαίωση Προσωπικού PIN</h2>
              <p className="text-xs text-slate-400 mt-1">
                Εισάγετε το 4ψήφιο PIN για τον λογαριασμό <strong className="text-white">{currentStaff.name}</strong> (Δοκιμαστικό PIN: {currentStaff.pin})
              </p>
            </div>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-40 mx-auto block text-center text-xl tracking-[0.5em] font-mono px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition"
            >
              Ξεκλείδωμα Βάρδιας
            </button>
          </form>
        ) : (
          <div className="space-y-6 min-w-0">
            {/* Navigation Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs min-w-0">
              <button
                type="button"
                onClick={() => setStaffTab('shift')}
                className={`p-3 rounded-xl font-extrabold flex items-center justify-center gap-2 border transition min-w-0 ${
                  staffTab === 'shift'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Clock className="h-4 w-4 shrink-0" />
                <span className="truncate">1. Κάρτα & Βάρδιες</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffTab('cash')}
                className={`p-3 rounded-xl font-extrabold flex items-center justify-center gap-2 border transition min-w-0 ${
                  staffTab === 'cash'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <DollarSign className="h-4 w-4 shrink-0" />
                <span className="truncate">2. Παράδοση Ταμείου</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffTab('stock_waste')}
                className={`p-3 rounded-xl font-extrabold flex items-center justify-center gap-2 border transition min-w-0 ${
                  staffTab === 'stock_waste'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Package className="h-4 w-4 shrink-0" />
                <span className="truncate">3. Ελλείψεις & Φθορές</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffTab('recipes_sop')}
                className={`p-3 rounded-xl font-extrabold flex items-center justify-center gap-2 border transition min-w-0 ${
                  staffTab === 'recipes_sop'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Utensils className="h-4 w-4 shrink-0" />
                <span className="truncate">4. Συνταγές & Checklist ({completedChecklistCount}/{checklist.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffTab('requests')}
                className={`p-3 rounded-xl font-extrabold flex items-center justify-center gap-2 border transition col-span-2 sm:col-span-1 min-w-0 ${
                  staffTab === 'requests'
                    ? 'bg-slate-700 text-white border-slate-600 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">5. Αιτήματα & Άδειες</span>
              </button>
            </div>

            {/* TAB 1: Κάρτα & Βάρδιες */}
            {staffTab === 'shift' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
                <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 min-w-0">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-extrabold text-white">Ψηφιακή Κάρτα Εργασίας</h2>
                      <p className="text-[11px] text-slate-400">Συγχρονισμός παρουσίας με Εργοδότη</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border shrink-0 ${
                        clockStatus === 'WORKING'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : clockStatus === 'BREAK'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {clockStatus === 'WORKING' ? '● Σε Βάρδια' : clockStatus === 'BREAK' ? '⏸ Σε Διάλειμμα' : '○ Εκτός Βάρδιας'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleClockAction('WORKING', 'Έναρξη Βάρδιας (Check-In)')}
                      className="py-3 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition shadow"
                    >
                      ▶ Έναρξη Βάρδιας
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClockAction('BREAK', 'Έναρξη Διαλείμματος')}
                      className="py-3 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-extrabold transition"
                    >
                      ☕ Διάλειμμα
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClockAction('OFF', 'Λήξη Βάρδιας (Check-Out)')}
                      className="py-3 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-extrabold transition"
                    >
                      ■ Λήξη Βάρδιας
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-300 block">Σημερινές Κινήσεις Κάρτας:</span>
                    <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/70 text-xs">
                      {clockLogs.map((log) => (
                        <div key={log.id} className="p-3 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{log.action}</span>
                            <span className="text-[10px] text-slate-400">{log.staffName}</span>
                          </div>
                          <div className="text-right font-mono shrink-0">
                            <span className="text-emerald-400 font-bold block">{log.time}</span>
                            <span className="text-[9px] text-slate-500">Καταχωρήθηκε</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 min-w-0">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-extrabold text-white">Το Εβδομαδιαίο Πρόγραμμα Βαρδιών μου</h2>
                    <p className="text-[11px] text-slate-400">
                      Σύμβαση: {currentStaff.contractType} • Δηλωμένο Ωράριο: {currentStaff.weeklyHours} ώρες / εβδομάδα
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {Object.entries(currentStaff.schedule).map(([day, hours]) => {
                      const isRepo = hours.includes('ΡΕΠΟ');
                      return (
                        <div
                          key={day}
                          className={`p-4 rounded-xl border space-y-1 ${
                            isRepo
                              ? 'bg-slate-950/60 border-slate-800/80'
                              : 'bg-slate-950 border-blue-500/30'
                          }`}
                        >
                          <span className="text-slate-400 font-bold block">{day}</span>
                          <span className={`font-mono font-black text-sm block ${isRepo ? 'text-red-400' : 'text-emerald-400'}`}>
                            {hours}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {isRepo ? 'Ημέρα Ανάπαυσης' : '8ωρη Βάρδια'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Παράδοση Ταμείου */}
            {staffTab === 'cash' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 min-w-0">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Τυφλή Καταμέτρηση Συρταριού (Blind Cash Count)</span>
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Το σύνολο αποστέλλεται απευθείας στο Ταμείο & Κλείσιμο Ζ του Εργοδότη.
                      </p>
                    </div>
                    <span className="text-base font-mono font-black text-emerald-400 shrink-0">
                      {countedCashTotal.toFixed(2)} €
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    {['50', '20', '10', '5', '2', '1', '0.5'].map((denom) => (
                      <div key={denom} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-slate-300">{denom} € ×</span>
                        <input
                          type="number"
                          min="0"
                          value={denoms[denom] || 0}
                          onChange={(e) =>
                            setDenoms({ ...denoms, [denom]: Math.max(0, parseInt(e.target.value) || 0) })
                          }
                          className="w-14 min-w-0 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-right font-mono font-bold text-white"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="text-xs space-y-1.5">
                    <label className="text-slate-400 font-bold block">Σημειώσεις Παράδοσης Βάρδιας:</label>
                    <input
                      type="text"
                      value={handoverNotes}
                      onChange={(e) => setHandoverNotes(e.target.value)}
                      placeholder="π.χ. Αφέθηκαν 150€ ψιλά στο συρτάρι για την επόμενη βάρδια"
                      className="w-full max-w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitBlindCashCount}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition"
                  >
                    {handoverSubmitted
                      ? `✔ Απεστάλη στον Εργοδότη (${countedCashTotal.toFixed(2)} €) — Ενημέρωση Ξανά`
                      : `🔒 Υποβολή Καταμέτρησης (${countedCashTotal.toFixed(2)} €) στον Εργοδότη`}
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 min-w-0">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-extrabold text-white">Καταχώρηση Μικροεξόδων Βάρδιας</h2>
                    <p className="text-[11px] text-slate-400">
                      Όποια πληρωμή γίνεται με μετρητά από το συρτάρι περνάει αυτόματα στο Ταμείο Ζ.
                    </p>
                  </div>

                  <form onSubmit={handleAddShiftExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                    <input
                      type="text"
                      value={shiftExpReason}
                      onChange={(e) => setShiftExpReason(e.target.value)}
                      placeholder="Αιτιολογία (π.χ. Πάγος 2 σακούλες)"
                      className="sm:col-span-7 min-w-0 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={shiftExpAmount}
                      onChange={(e) => setShiftExpAmount(e.target.value)}
                      placeholder="Ποσό €"
                      className="sm:col-span-3 min-w-0 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-right"
                    />
                    <button
                      type="submit"
                      className="sm:col-span-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold"
                    >
                      + Πέρασμα
                    </button>
                  </form>

                  <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/70 text-xs max-h-60 overflow-y-auto">
                    {drawerExpenses.map((exp) => (
                      <div key={exp.id} className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{exp.reason}</span>
                          <span className="text-[10px] text-slate-500">Ώρα: {exp.time}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-400 shrink-0">{exp.amount.toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Ελλείψεις & Φθορές */}
            {staffTab === 'stock_waste' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 min-w-0">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-extrabold text-white">Ειδοποίηση Έλλειψης Υλικών / Δήλωση Φθοράς</h2>
                    <p className="text-[11px] text-slate-400">
                      Ενημερώστε άμεσα τον Εργοδότη αν τελειώνει κάποιο προϊόν στον πάγκο ή αν υπήρξε απώλεια.
                    </p>
                  </div>

                  <form onSubmit={handleAddStockReport} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setReportType('LOW_STOCK')}
                        className={`py-2 px-2 rounded-xl font-extrabold border transition truncate ${
                          reportType === 'LOW_STOCK'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        📦 Τελειώνει Υλικό
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportType('WASTE')}
                        className={`py-2 px-2 rounded-xl font-extrabold border transition truncate ${
                          reportType === 'WASTE'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        🔥 Φθορά / Απώλεια
                      </button>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Είδος / Προϊόν:</label>
                      <select
                        value={reportItem}
                        onChange={(e) => setReportItem(e.target.value)}
                        className="w-full max-w-full min-w-0 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="Espresso Beans Taf (Specialty Blend)">Espresso Beans Taf (Specialty Blend)</option>
                        <option value="Γάλα Φρέσκο Πλήρες 3.5%">Γάλα Φρέσκο Πλήρες 3.5%</option>
                        <option value="Γάλα Βρώμης (Oat Barista)">Γάλα Βρώμης (Oat Barista)</option>
                        <option value="Ποτήρια Takeaway 14oz">Ποτήρια Takeaway 14oz</option>
                        <option value="Καπάκια Ποτηριών Φ90">Καπάκια Ποτηριών Φ90</option>
                        <option value="Ψωμάκια Brioche & Club">Ψωμάκια Brioche & Club</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Ποσότητα / Σημείωση:</label>
                      <input
                        type="text"
                        required
                        value={reportQtyNote}
                        onChange={(e) => setReportQtyNote(e.target.value)}
                        placeholder="π.χ. Έμεινε 1 κιβώτιο γάλατα, χρειάζεται παραγγελία αύριο"
                        className="w-full max-w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold transition"
                    >
                      Αποστολή Ειδοποίησης στον Εργοδότη
                    </button>
                  </form>

                  <div className="space-y-2 pt-2">
                    {stockReports.map((rep) => (
                      <div key={rep.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-start gap-2 text-xs">
                        <div className="min-w-0">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded mr-2 inline-block ${rep.type === 'LOW_STOCK' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                            {rep.type === 'LOW_STOCK' ? 'Έλλειψη' : 'Φθορά'}
                          </span>
                          <span className="font-bold text-white break-words">{rep.item}</span>
                          <p className="text-[11px] text-slate-400 mt-1">{rep.qtyNote}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{rep.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 min-w-0">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>Αναφορά Βλάβης Εξοπλισμού / Μηχανημάτων</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Μηχανή espresso, μύλοι άλεσης, παγομηχανή, ψυγεία ή POS.
                    </p>
                  </div>

                  <form onSubmit={handleReportEquipmentIssue} className="space-y-3 text-xs">
                    <textarea
                      rows={3}
                      value={equipmentIssue}
                      onChange={(e) => setEquipmentIssue(e.target.value)}
                      placeholder="Περιγράψτε το πρόβλημα..."
                      className="w-full max-w-full min-w-0 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold transition"
                    >
                      Άμεση Ειδοποίηση Τεχνικού / Εργοδότη
                    </button>
                  </form>

                  <div className="space-y-2">
                    {maintenanceTickets.map((t) => (
                      <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-blue-500/30 text-xs">
                        <div className="flex justify-between gap-2 text-[10px] text-blue-400 font-bold mb-1">
                          <span>{t.urgency} • {t.staff}</span>
                          <span>{t.time}</span>
                        </div>
                        <p className="text-white">{t.issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Συνταγές & Checklist */}
            {staffTab === 'recipes_sop' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
                <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 min-w-0">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Checklist Βάρδιας & HACCP</span>
                      </h2>
                      <p className="text-[11px] text-slate-400">Υποχρεωτικές εργασίες ανοίγματος, λειτουργίας & κλεισίματος</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono font-bold text-xs shrink-0">
                      {completedChecklistCount} / {checklist.length}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {checklist.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleChecklist(task.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex items-start justify-between gap-3 transition min-w-0 ${
                          task.completed
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {}}
                            className="mt-0.5 h-4 w-4 accent-emerald-500 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 block">{task.shiftType}</span>
                            <span className={`font-bold break-words ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                              {task.label}
                            </span>
                          </div>
                        </div>
                        {task.completed && (
                          <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                            ✔ {task.completedBy} ({task.completedAt})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 min-w-0">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-purple-400 shrink-0" />
                      <span>Οδηγός Παρασκευής & Δοσολογίες (Barista SOP)</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Τυποποιημένες συνταγές καταστήματος για σταθερή ποιότητα.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    {BARISTA_RECIPES_SOP.map((rec) => (
                      <div key={rec.name} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-black text-white text-sm">{rec.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                            {rec.glass}
                          </span>
                        </div>
                        <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                          {rec.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Αιτήματα & Άδειες + Δεσμευμένες Ημέρες Συναδέλφων */}
            {staffTab === 'requests' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
                <form
                  onSubmit={handleSubmitRequest}
                  className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs min-w-0"
                >
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-extrabold text-white">Υποβολή Νέου Αιτήματος στον Εργοδότη</h2>
                    <p className="text-[11px] text-slate-400">
                      Άδειες, ρεπό, αλλαγή βάρδιας ή αίτημα προκαταβολής (ενημερώνεται άμεσα ο Εργοδότης).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <div className="min-w-0">
                      <label className="text-slate-400 block mb-1 font-bold">Κατηγορία Αιτήματος:</label>
                      <select
                        value={reqType}
                        onChange={(e) => {
                          const nextType = e.target.value as StaffRequestItem['type'];
                          setReqType(nextType);
                          if (nextType === 'Προκαταβολή Μισθού') {
                            setAllowPeerVisibility(false);
                          } else {
                            setAllowPeerVisibility(true);
                          }
                        }}
                        className="w-full max-w-full min-w-0 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="Άδεια / Ρεπό">Άδεια / Ρεπό</option>
                        <option value="Αλλαγή Βάρδιας">Αλλαγή Βάρδιας</option>
                        <option value="Προκαταβολή Μισθού">Προκαταβολή Μισθού</option>
                      </select>
                    </div>

                    <div className="min-w-0">
                      <label className="text-slate-400 block mb-1 font-bold">
                        {reqType === 'Προκαταβολή Μισθού' ? 'Επιθυμητό Ποσό (€):' : 'Ημερομηνία / Διάστημα:'}
                      </label>
                      <input
                        type="text"
                        value={reqDateOrAmount}
                        onChange={(e) => setReqDateOrAmount(e.target.value)}
                        placeholder={reqType === 'Προκαταβολή Μισθού' ? 'π.χ. 100€' : 'π.χ. 25/11/2026 ή 25-27/11'}
                        className="w-full max-w-full min-w-0 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="text-slate-400 block mb-1 font-bold">Λεπτομέρειες / Σημειώσεις:</label>
                    <textarea
                      rows={3}
                      required
                      value={reqDetails}
                      onChange={(e) => setReqDetails(e.target.value)}
                      placeholder="π.χ. Αίτημα άδειας για την Τρίτη 25/11..."
                      className="w-full max-w-full min-w-0 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  {reqType !== 'Προκαταβολή Μισθού' && (
                    <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer min-w-0">
                      <div className="flex items-start sm:items-center gap-2 min-w-0">
                        <Eye className="h-4 w-4 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-white block">
                            Κοινοποίηση δεσμευμένης ημέρας στους συναδέλφους (μετά την έγκριση)
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Βοηθάει να μην ζητήσει άλλος την ίδια μέρα άδεια. Ο Εργοδότης έχει τον τελικό λόγο.
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowPeerVisibility}
                        onChange={(e) => setAllowPeerVisibility(e.target.checked)}
                        className="h-4 w-4 accent-emerald-500 shrink-0"
                      />
                    </label>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition"
                  >
                    Αποστολή Αιτήματος στον Εργοδότη
                  </button>
                </form>

                <div className="lg:col-span-6 space-y-5 text-xs min-w-0">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 min-w-0">
                    <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-sm font-extrabold text-white truncate">Τα Δικά μου Αιτήματα ({currentStaff.name})</h2>
                        <p className="text-[11px] text-slate-400">Κατάσταση έγκρισης από τον Εργοδότη</p>
                      </div>
                      <span className="font-mono text-slate-400 shrink-0">{myRequests.length}</span>
                    </div>

                    {myRequests.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3">Δεν έχετε υποβάλει αιτήματα ακόμα.</p>
                    ) : (
                      <div className="space-y-2">
                        {myRequests.map((req) => (
                          <div key={req.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 min-w-0">
                            <div className="min-w-0">
                              <span className="font-extrabold text-white block truncate">
                                {req.type} {req.dateOrAmount ? `• ${req.dateOrAmount}` : ''}
                              </span>
                              <p className="text-[11px] text-slate-400 mt-0.5 break-words">{req.details}</p>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border shrink-0 ${
                                req.status === 'Εγκρίθηκε'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : req.status === 'Απορρίφθηκε'
                                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/25 space-y-3 min-w-0">
                    <div className="border-b border-slate-800 pb-2.5">
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>Εγκεκριμένες Άδειες & Δεσμευμένες Ημέρες Βάρδιας</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Εμφανίζονται μόνο οι εγκεκριμένες απουσίες που επιτρέπεται να κοινοποιούνται στους συναδέλφους.
                      </p>
                    </div>

                    {visibleApprovedPeerLeaves.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">
                        Δεν υπάρχουν κοινοποιημένες εγκεκριμένες άδειες προς το παρόν.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {visibleApprovedPeerLeaves.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 min-w-0"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-blue-300 block truncate">
                                Δεσμευμένη Ημέρα: {item.dateOrAmount || 'Καθορισμένη ημέρα'} ({item.type})
                              </span>
                              <span className="text-[11px] text-slate-300">
                                {item.staffName} — Εγκεκριμένη απουσία
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold shrink-0">
                              Κατειλημμένη Μέρα
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}