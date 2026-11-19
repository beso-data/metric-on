// app/components/views/InvoicesView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import {
  FileText, Plus, Trash2, Edit3, X, Search,
  Landmark, Layers, Download, Calculator
} from 'lucide-react';

interface ManagedInvoice {
  id: string;
  supplier: string;
  category: 'Πρώτες Ύλες & Καφέδες' | 'Συσκευασία & Αναλώσιμα' | 'Εξοπλισμός & Συντήρηση' | 'Λοιπά Τιμολόγια';
  date: string;
  dueDate: string;
  amount: number;
  vat: number;
  status: 'Pending' | 'Paid';
  paymentMethod: 'Τράπεζα' | 'Μετρητά' | 'Κάρτα Εταιρείας' | 'IRIS / Άμεση';
  notes?: string;
}

interface FixedExpenseItem {
  id: number;
  title: string;
  category: 'Ενοίκιο' | 'Ενέργεια & Ύδρευση' | 'Λογιστήριο & Νομικά' | 'Τηλεπικοινωνίες & POS' | 'Ασφάλιστρα & Άδειες';
  billingDay: number;
  amount: number;
  vatRate: 0 | 13 | 24;
  paymentMethod: 'Τράπεζα' | 'Πάγια Εντολή' | 'Μετρητά';
  status: 'Pending' | 'Paid';
}

const DEFAULT_FIXED_EXPENSES: FixedExpenseItem[] = [
  {
    id: 1,
    title: 'Ενοίκιο Καταστήματος Κολωνακίου',
    category: 'Ενοίκιο',
    billingDay: 5,
    amount: 1650.00,
    vatRate: 0,
    paymentMethod: 'Τράπεζα',
    status: 'Paid'
  },
  {
    id: 2,
    title: 'Ρεύμα (ΔΕΗ / Πάροχος Ενέργειας)',
    category: 'Ενέργεια & Ύδρευση',
    billingDay: 18,
    amount: 420.00,
    vatRate: 24,
    paymentMethod: 'Πάγια Εντολή',
    status: 'Pending'
  },
  {
    id: 3,
    title: 'Λογιστικό Γραφείο & Μισθοδοσία ΕΡΓΑΝΗ',
    category: 'Λογιστήριο & Νομικά',
    billingDay: 25,
    amount: 280.00,
    vatRate: 24,
    paymentMethod: 'Τράπεζα',
    status: 'Pending'
  },
  {
    id: 4,
    title: 'Ίντερνετ, Τηλεφωνία & Συνδρομή POS',
    category: 'Τηλεπικοινωνίες & POS',
    billingDay: 20,
    amount: 95.00,
    vatRate: 24,
    paymentMethod: 'Πάγια Εντολή',
    status: 'Paid'
  },
  {
    id: 5,
    title: 'ΕΥΔΑΠ (Ύδρευση & Αποχέτευση)',
    category: 'Ενέργεια & Ύδρευση',
    billingDay: 22,
    amount: 68.00,
    vatRate: 13,
    paymentMethod: 'Πάγια Εντολή',
    status: 'Pending'
  }
];

export default function InvoicesView() {
  const {
    invoices,
    setInvoices,
    currentMonthlyTurnover,
    platformCommissions,
    primeCostMetrics,
    storePayrollTotals,
    employerConfig,
    notify
  } = useMetric();

  const normalizedInvoices: ManagedInvoice[] = useMemo(() => {
    return (invoices || []).map((inv: any) => ({
      id: inv.id,
      supplier: inv.supplier || 'Προμηθευτής',
      category: inv.category || 'Πρώτες Ύλες & Καφέδες',
      date: inv.date || new Date().toLocaleDateString('el-GR'),
      dueDate: inv.dueDate || '2026-12-01',
      amount: Number(inv.amount) || 0,
      vat: inv.vat !== undefined ? Number(inv.vat) : +((Number(inv.amount) || 0) * 0.24 / 1.24).toFixed(2),
      status: inv.status === 'Paid' ? 'Paid' : 'Pending',
      paymentMethod: inv.paymentMethod || 'Τράπεζα',
      notes: inv.notes || ''
    }));
  }, [invoices]);

  const [fixedList, setFixedList] = useState<FixedExpenseItem[]>(DEFAULT_FIXED_EXPENSES);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Paid'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoiceOriginalId, setEditingInvoiceOriginalId] = useState<string | null>(null);
  const [invCode, setInvCode] = useState('ΤΔΑ-');
  const [invSupplier, setInvSupplier] = useState('Taf Coffee');
  const [invCategory, setInvCategory] = useState<ManagedInvoice['category']>('Πρώτες Ύλες & Καφέδες');
  const [invDate, setInvDate] = useState(new Date().toLocaleDateString('el-GR'));
  const [invDueDate, setInvDueDate] = useState('2026-12-10');
  const [invAmount, setInvAmount] = useState<number>(350);
  const [invVat, setInvVat] = useState<number>(+(350 * 0.13 / 1.13).toFixed(2));
  const [invPaymentMethod, setInvPaymentMethod] = useState<ManagedInvoice['paymentMethod']>('Τράπεζα');
  const [invStatus, setInvStatus] = useState<'Pending' | 'Paid'>('Pending');
  const [invNotes, setInvNotes] = useState('');

  const [showFixedModal, setShowFixedModal] = useState(false);
  const [editingFixedId, setEditingFixedId] = useState<number | null>(null);
  const [fixTitle, setFixTitle] = useState('');
  const [fixCategory, setFixCategory] = useState<FixedExpenseItem['category']>('Ενέργεια & Ύδρευση');
  const [fixBillingDay, setFixBillingDay] = useState<number>(15);
  const [fixAmount, setFixAmount] = useState<number>(150);
  const [fixVatRate, setFixVatRate] = useState<0 | 13 | 24>(24);
  const [fixPaymentMethod, setFixPaymentMethod] = useState<FixedExpenseItem['paymentMethod']>('Τράπεζα');
  const [fixStatus, setFixStatus] = useState<'Pending' | 'Paid'>('Pending');

  const filteredInvoices = useMemo(() => {
    return normalizedInvoices.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.id.toLowerCase().includes(q) ||
        inv.supplier.toLowerCase().includes(q) ||
        (inv.notes || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchesCat = categoryFilter === 'ALL' || inv.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [normalizedInvoices, searchQuery, statusFilter, categoryFilter]);

  const metrics = useMemo(() => {
    const pendingInvoicesAmount = normalizedInvoices
      .filter((i) => i.status === 'Pending')
      .reduce((acc, i) => acc + i.amount, 0);

    const paidInvoicesAmount = normalizedInvoices
      .filter((i) => i.status === 'Paid')
      .reduce((acc, i) => acc + i.amount, 0);

    const invoicesVatTotal = normalizedInvoices.reduce((acc, i) => acc + (i.vat || 0), 0);

    const fixedMonthlyTotal = fixedList.reduce((acc, f) => acc + f.amount, 0);
    const fixedPendingTotal = fixedList
      .filter((f) => f.status === 'Pending')
      .reduce((acc, f) => acc + f.amount, 0);

    const fixedVatTotal = fixedList.reduce((acc, f) => {
      if (f.vatRate === 0) return acc;
      return acc + (f.amount * (f.vatRate / 100)) / (1 + f.vatRate / 100);
    }, 0);

    const monthlyTurnover = Number(currentMonthlyTurnover) || 16850;
    const estDeliveryCommissionsMonthly = +(
      ((Number(platformCommissions?.efoodCommission) || 0) +
        (Number(platformCommissions?.woltCommission) || 0)) * 20
    ).toFixed(2);
    const estCogsMonthly = +((monthlyTurnover * (Number(primeCostMetrics?.cogsPct) || 15.7)) / 100).toFixed(2);
    const estPayrollMonthly = Number(storePayrollTotals?.trueMonthlyCost) || 5850;
    const netMonthlyResult = +(
      monthlyTurnover -
      estDeliveryCommissionsMonthly -
      estCogsMonthly -
      estPayrollMonthly -
      fixedMonthlyTotal
    ).toFixed(2);

    return {
      pendingInvoicesAmount: +pendingInvoicesAmount.toFixed(2),
      paidInvoicesAmount: +paidInvoicesAmount.toFixed(2),
      totalInputVat: +(invoicesVatTotal + fixedVatTotal).toFixed(2),
      fixedMonthlyTotal: +fixedMonthlyTotal.toFixed(2),
      fixedPendingTotal: +fixedPendingTotal.toFixed(2),
      totalObligationsOpen: +(pendingInvoicesAmount + fixedPendingTotal).toFixed(2),
      monthlyTurnover,
      estDeliveryCommissionsMonthly,
      estCogsMonthly,
      estPayrollMonthly,
      netMonthlyResult
    };
  }, [normalizedInvoices, fixedList, currentMonthlyTurnover, platformCommissions, primeCostMetrics, storePayrollTotals]);

// Εξαγωγή Αναφοράς Λογιστή σε CSV (Καθαρά Ελληνικά & Στήλες στο Excel)
  const handleExportAccountantCsv = () => {
    const esc = (val: string | number) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const fmtNum = (n: number) => Number(n || 0).toFixed(2).replace('.', ',');

    const rows: string[] = [
      [
        'ΕΝΟΤΗΤΑ',
        'ΚΩΔΙΚΟΣ / ΠΕΡΙΓΡΑΦΗ',
        'ΠΡΟΜΗΘΕΥΤΗΣ / ΚΑΤΗΓΟΡΙΑ',
        'ΗΜΕΡΟΜΗΝΙΑ / ΛΗΞΗ',
        'ΦΠΑ (€)',
        'ΠΟΣΟ (€)',
        'ΚΑΤΑΣΤΑΣΗ'
      ].map(esc).join(';'),
      [
        'P&L ΜΗΝΑ',
        'Τζίρος Μήνα',
        employerConfig?.storeName || 'blysscafe Athens',
        'Τρέχων Μήνας',
        fmtNum(0),
        fmtNum(metrics.monthlyTurnover),
        'Ενημερωτικό'
      ].map(esc).join(';'),
      [
        'P&L ΜΗΝΑ',
        'Εκτ. Προμήθειες Delivery',
        'Πλατφόρμες Delivery',
        'Τρέχων Μήνας',
        fmtNum(0),
        fmtNum(-metrics.estDeliveryCommissionsMonthly),
        'Ενημερωτικό'
      ].map(esc).join(';'),
      [
        'P&L ΜΗΝΑ',
        "Εκτ. Κόστος Α' Υλών (COGS)",
        'Αποθήκη / BOM',
        'Τρέχων Μήνας',
        fmtNum(0),
        fmtNum(-metrics.estCogsMonthly),
        'Ενημερωτικό'
      ].map(esc).join(';'),
      [
        'P&L ΜΗΝΑ',
        'Εκτ. Μισθοδοσία & Εισφορές',
        'Προσωπικό',
        'Τρέχων Μήνας',
        fmtNum(0),
        fmtNum(-metrics.estPayrollMonthly),
        'Ενημερωτικό'
      ].map(esc).join(';'),
      [
        'P&L ΜΗΝΑ',
        'Μηνιαία Πάγια Έξοδα',
        'Λειτουργικά Έξοδα',
        'Τρέχων Μήνας',
        fmtNum(metrics.totalInputVat),
        fmtNum(-metrics.fixedMonthlyTotal),
        'Ενημερωτικό'
      ].map(esc).join(';'),
      [
        'P&L ΜΗΝΑ',
        'Εκτιμώμενο Καθαρό Αποτέλεσμα Μήνα',
        'Σύνολο P&L',
        'Τρέχων Μήνας',
        fmtNum(0),
        fmtNum(metrics.netMonthlyResult),
        'Σύνοψη'
      ].map(esc).join(';')
    ];

    normalizedInvoices.forEach((inv) => {
      rows.push(
        [
          'ΤΙΜΟΛΟΓΙΟ',
          inv.id,
          `${inv.supplier} (${inv.category})`,
          `${inv.date} / ${inv.dueDate}`,
          fmtNum(inv.vat),
          fmtNum(inv.amount),
          inv.status
        ].map(esc).join(';')
      );
    });

    fixedList.forEach((fix) => {
      rows.push(
        [
          'ΠΑΓΙΟ',
          fix.title,
          fix.category,
          `Κάθε ${fix.billingDay}η`,
          fmtNum(0),
          fmtNum(fix.amount),
          fix.status
        ].map(esc).join(';')
      );
    });

    const csvContent = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anafora_Logistiriou_${employerConfig?.afm || 'blysscafe'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('📥 Κατέβηκε η αναφορά λογιστηρίου (.csv) με καθαρά ελληνικά!');
  };
  const handleOpenNewInvoice = () => {
    setEditingInvoiceOriginalId(null);
    setInvCode(`ΤΔΑ-${Math.floor(1000 + Math.random() * 9000)}`);
    setInvSupplier('Taf Coffee');
    setInvCategory('Πρώτες Ύλες & Καφέδες');
    setInvDate(new Date().toLocaleDateString('el-GR'));
    setInvDueDate('2026-12-10');
    setInvAmount(320.00);
    setInvVat(+(320 * 0.13 / 1.13).toFixed(2));
    setInvPaymentMethod('Τράπεζα');
    setInvStatus('Pending');
    setInvNotes('');
    setShowInvoiceModal(true);
  };

  const handleOpenEditInvoice = (inv: ManagedInvoice) => {
    setEditingInvoiceOriginalId(inv.id);
    setInvCode(inv.id);
    setInvSupplier(inv.supplier);
    setInvCategory(inv.category);
    setInvDate(inv.date);
    setInvDueDate(inv.dueDate);
    setInvAmount(inv.amount);
    setInvVat(inv.vat);
    setInvPaymentMethod(inv.paymentMethod);
    setInvStatus(inv.status);
    setInvNotes(inv.notes || '');
    setShowInvoiceModal(true);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invCode.trim() || !invSupplier.trim()) {
      notify('⚠️ Συμπληρώστε αριθμό παραστατικού και προμηθευτή.');
      return;
    }

    const updatedRecord: ManagedInvoice = {
      id: invCode.trim(),
      supplier: invSupplier.trim(),
      category: invCategory,
      date: invDate,
      dueDate: invDueDate,
      amount: Math.max(0, Number(invAmount) || 0),
      vat: Math.max(0, Number(invVat) || 0),
      status: invStatus,
      paymentMethod: invPaymentMethod,
      notes: invNotes.trim()
    };

    if (editingInvoiceOriginalId) {
      setInvoices(
        normalizedInvoices.map((item) =>
          item.id === editingInvoiceOriginalId ? updatedRecord : item
        )
      );
      notify(`✔ Το τιμολόγιο ${updatedRecord.id} ενημερώθηκε επιτυχώς!`);
    } else {
      setInvoices([updatedRecord, ...normalizedInvoices]);
      notify(`✔ Το τιμολόγιο ${updatedRecord.id} καταχωρήθηκε επιτυχώς!`);
    }

    setShowInvoiceModal(false);
    setEditingInvoiceOriginalId(null);
  };

  const handleToggleInvoiceStatus = (id: string) => {
    const updated = normalizedInvoices.map((i) => {
      if (i.id === id) {
        const nextStatus: 'Pending' | 'Paid' = i.status === 'Pending' ? 'Paid' : 'Pending';
        notify(
          nextStatus === 'Paid'
            ? `✔ Το τιμολόγιο ${id} σημειώθηκε ως Εξοφλημένο!`
            : `ℹ Το τιμολόγιο ${id} επέστρεψε σε εκκρεμότητα (Pending).`
        );
        return { ...i, status: nextStatus };
      }
      return i;
    });
    setInvoices(updated);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(normalizedInvoices.filter((i) => i.id !== id));
    notify(`🗑️ Το τιμολόγιο ${id} διαγράγράφηκε.`);
  };

  const handleOpenNewFixed = () => {
    setEditingFixedId(null);
    setFixTitle('');
    setFixCategory('Ενέργεια & Ύδρευση');
    setFixBillingDay(15);
    setFixAmount(150);
    setFixVatRate(24);
    setFixPaymentMethod('Τράπεζα');
    setFixStatus('Pending');
    setShowFixedModal(true);
  };

  const handleOpenEditFixed = (item: FixedExpenseItem) => {
    setEditingFixedId(item.id);
    setFixTitle(item.title);
    setFixCategory(item.category);
    setFixBillingDay(item.billingDay);
    setFixAmount(item.amount);
    setFixVatRate(item.vatRate);
    setFixPaymentMethod(item.paymentMethod);
    setFixStatus(item.status);
    setShowFixedModal(true);
  };

  const handleSaveFixedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixTitle.trim()) {
      notify('⚠️ Συμπληρώστε περιγραφή παγίου εξόδου.');
      return;
    }

    const payload: FixedExpenseItem = {
      id: editingFixedId ?? Date.now(),
      title: fixTitle.trim(),
      category: fixCategory,
      billingDay: Math.min(31, Math.max(1, Number(fixBillingDay) || 1)),
      amount: Math.max(0, Number(fixAmount) || 0),
      vatRate: fixVatRate,
      paymentMethod: fixPaymentMethod,
      status: fixStatus
    };

    if (editingFixedId !== null) {
      setFixedList((prev) => prev.map((f) => (f.id === editingFixedId ? payload : f)));
      notify(`✔ Το πάγιο "${payload.title}" ενημερώθηκε!`);
    } else {
      setFixedList((prev) => [payload, ...prev]);
      notify(`✔ Προστέθηκε νέο πάγιο έξοδο: "${payload.title}"!`);
    }
    setShowFixedModal(false);
    setEditingFixedId(null);
  };

  const handleToggleFixedStatus = (id: number) => {
    setFixedList((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const next: 'Pending' | 'Paid' = f.status === 'Pending' ? 'Paid' : 'Pending';
          notify(next === 'Paid' ? `✔ Εξοφλήθηκε το πάγιο "${f.title}".` : `ℹ Επέστρεψε σε εκκρεμότητα το πάγιο "${f.title}".`);
          return { ...f, status: next };
        }
        return f;
      })
    );
  };

  const handleDeleteFixedExpense = (id: number, title: string) => {
    setFixedList((prev) => prev.filter((f) => f.id !== id));
    notify(`🗑️ Διαγράφηκε το πάγιο "${title}".`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Header & Primary Actions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <FileText className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">
                Οικονομικά, Τιμολόγια Προμηθευτών & Πάγια Έξοδα
              </h2>
              {metrics.totalObligationsOpen > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Ανοιχτές Υποχρεώσεις: {metrics.totalObligationsOpen.toFixed(2)} €
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Πλήρης διαχείριση παραστατικών, μηνιαίων παγίων, συνοπτικού μηνιαίου P&L και εξαγωγή αναφοράς για τον λογιστή.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportAccountantCsv}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-extrabold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="h-4 w-4 text-purple-400" />
              <span>Εξαγωγή Λογιστηρίου (.csv)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewFixed}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 font-extrabold text-xs flex items-center gap-1.5 transition"
            >
              <Landmark className="h-4 w-4 text-blue-400" />
              <span>+ Νέο Πάγιο Έξοδο</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewInvoice}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition"
            >
              <Plus className="h-4 w-4" />
              <span>+ Καταχώρηση Τιμολογίου</span>
            </button>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Ανοιχτά Τιμολόγια Προμηθευτών</span>
            <p className="text-2xl font-black text-amber-400">{metrics.pendingInvoicesAmount.toFixed(2)} €</p>
            <span className="text-[10px] text-emerald-400 block">
              Εξοφλημένα τιμολόγια: {metrics.paidInvoicesAmount.toFixed(2)} €
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Μηνιαία Πάγια Λειτουργίας</span>
            <p className="text-2xl font-black text-white">{metrics.fixedMonthlyTotal.toFixed(2)} €</p>
            <span className="text-[10px] text-amber-400 block">
              Ανεξόφλητα πάγια μήνα: {metrics.fixedPendingTotal.toFixed(2)} €
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Συνολικές Ανοιχτές Οφειλές</span>
            <p className="text-2xl font-black text-red-400">{metrics.totalObligationsOpen.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              Τιμολόγια + Εκκρεμή Πάγια Έξοδα
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Εκτιμώμενος ΦΠΑ Εισροών</span>
            <p className="text-2xl font-black text-blue-400">{metrics.totalInputVat.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              Συμψηφιστέος ΦΠΑ από παραστατικά & πάγια
            </span>
          </div>
        </div>
      </div>

      {/* Μηνιαία Σύνοψη P&L (Αποτελέσματα Χρήσης) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-400" />
              <span>Συνοπτική Μηνιαία Εικόνα Αποτελεσμάτων (P&L)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Ενδεικτική μηνιαία σύνοψη εσόδων και βασικών εξόδων λειτουργίας για γρήγορο έλεγχο από τον εργοδότη.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Τρέχων Μήνας
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">Τζίρος Μήνα</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 block">
              +{metrics.monthlyTurnover.toFixed(2)} €
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">Προμήθειες Delivery</span>
            <span className="text-sm font-bold text-amber-400 mt-0.5 block">
              -{metrics.estDeliveryCommissionsMonthly.toFixed(2)} €
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">Κόστος Α’ Υλών</span>
            <span className="text-sm font-bold text-amber-400 mt-0.5 block">
              -{metrics.estCogsMonthly.toFixed(2)} €
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">Μισθοδοσία & Εισφορές</span>
            <span className="text-sm font-bold text-amber-400 mt-0.5 block">
              -{metrics.estPayrollMonthly.toFixed(2)} €
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans block">Πάγια Μήνα</span>
            <span className="text-sm font-bold text-amber-400 mt-0.5 block">
              -{metrics.fixedMonthlyTotal.toFixed(2)} €
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
            <span className="text-[10px] text-slate-300 font-sans font-bold block">Καθαρό Αποτέλεσμα</span>
            <span
              className={`text-sm font-black mt-0.5 block ${
                metrics.netMonthlyResult >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {metrics.netMonthlyResult >= 0 ? '+' : ''}
              {metrics.netMonthlyResult.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Suppliers Invoices Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>1. Παραστατικά & Τιμολόγια Προμηθευτών ({filteredInvoices.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Πατήστε «Επεξεργασία» για αλλαγή ποσών/ημερομηνιών, «Εξόφληση» για κλείσιμο οφειλής ή διαγραφή.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Αναζήτηση ΤΔΑ ή προμηθευτή..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:outline-none"
            >
              <option value="ALL">Όλες οι Κατηγορίες</option>
              <option value="Πρώτες Ύλες & Καφέδες">Πρώτες Ύλες & Καφέδες</option>
              <option value="Συσκευασία & Αναλώσιμα">Συσκευασία & Αναλώσιμα</option>
              <option value="Εξοπλισμός & Συντήρηση">Εξοπλισμός & Συντήρηση</option>
              <option value="Λοιπά Τιμολόγια">Λοιπά Τιμολόγια</option>
            </select>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
              {(['ALL', 'Pending', 'Paid'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'Όλα' : st === 'Pending' ? 'Εκκρεμεί' : 'Εξοφλημένα'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3.5">Παραστατικό</th>
                <th className="p-3.5">Προμηθευτής & Κατηγορία</th>
                <th className="p-3.5">Ημερομηνία / Λήξη</th>
                <th className="p-3.5">Τρόπος</th>
                <th className="p-3.5 text-right">ΦΠΑ</th>
                <th className="p-3.5 text-right">Ποσό (Gross)</th>
                <th className="p-3.5 text-center">Κατάσταση</th>
                <th className="p-3.5 text-right">Έλεγχος & Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    Δεν βρέθηκαν τιμολόγια με τα επιλεγμένα κριτήρια.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3.5 font-mono font-bold text-white">
                      <span>{inv.id}</span>
                      {inv.notes && (
                        <span className="text-[10px] text-slate-500 font-sans block truncate max-w-[140px]">
                          {inv.notes}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-200 font-bold block">{inv.supplier}</span>
                      <span className="text-[10px] text-slate-500">{inv.category}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      <span className="block">Έκδοση: {inv.date}</span>
                      <span className="text-[10px] text-amber-400/90 block">Λήξη: {inv.dueDate}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">{inv.paymentMethod}</td>
                    <td className="p-3.5 font-mono text-right text-blue-400">{(inv.vat || 0).toFixed(2)} €</td>
                    <td className="p-3.5 font-mono font-black text-right text-emerald-400 text-sm">
                      {inv.amount.toFixed(2)} €
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {inv.status === 'Paid' ? 'Εξοφλημένο' : 'Εκκρεμεί'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleInvoiceStatus(inv.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition border ${
                          inv.status === 'Paid'
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                        }`}
                      >
                        {inv.status === 'Paid' ? 'Ακύρωση Πληρωμής' : 'Εξόφληση'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditInvoice(inv)}
                        title="Επεξεργασία Τιμολογίου"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition inline-flex items-center"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInvoice(inv.id)}
                        title="Διαγραφή Τιμολογίου"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 transition inline-flex items-center"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Monthly Fixed Costs */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Landmark className="h-4 w-4 text-blue-400" />
              <span>2. Μηνιαία Πάγια Λειτουργικά Έξοδα ({fixedList.length} πάγια)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Επαναλαμβανόμενα έξοδα έδρας & λειτουργίας (ενοίκιο, ρεύμα, ύδρευση, λογιστήριο, POS) με δυνατότητα επεξεργασίας & εξόφλησης.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/30">
            Σύνολο Παγίων Μήνα: {metrics.fixedMonthlyTotal.toFixed(2)} €
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3.5">Περιγραφή Παγίου</th>
                <th className="p-3.5">Κατηγορία</th>
                <th className="p-3.5 text-center">Ημ. Μήνα</th>
                <th className="p-3.5">Τρόπος</th>
                <th className="p-3.5 text-right">Ποσό</th>
                <th className="p-3.5 text-center">Κατάσταση</th>
                <th className="p-3.5 text-right">Έλεγχος & Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {fixedList.map((fix) => (
                <tr key={fix.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3.5 font-bold text-white">{fix.title}</td>
                  <td className="p-3.5 text-slate-400">{fix.category}</td>
                  <td className="p-3.5 text-center font-mono text-slate-300">Κάθε {fix.billingDay}η</td>
                  <td className="p-3.5 text-slate-300">{fix.paymentMethod}</td>
                  <td className="p-3.5 font-mono font-black text-right text-white">{fix.amount.toFixed(2)} €</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                        fix.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {fix.status === 'Paid' ? 'Εξοφλημένο' : 'Εκκρεμεί'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleFixedStatus(fix.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition border ${
                        fix.status === 'Paid'
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                      }`}
                    >
                      {fix.status === 'Paid' ? 'Ακύρωση' : 'Εξόφληση'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditFixed(fix)}
                      title="Επεξεργασία Παγίου"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition inline-flex items-center"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFixedExpense(fix.id, fix.title)}
                      title="Διαγραφή Παγίου"
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 transition inline-flex items-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Καταχώρηση / Επεξεργασία Τιμολογίου */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveInvoice}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <span>
                  {editingInvoiceOriginalId
                    ? `Επεξεργασία Τιμολογίου: ${editingInvoiceOriginalId}`
                    : 'Καταχώρηση Νέου Τιμολογίου'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Αριθμός Παραστατικού *</label>
                <input
                  type="text"
                  required
                  value={invCode}
                  onChange={(e) => setInvCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Προμηθευτής *</label>
                <input
                  type="text"
                  required
                  value={invSupplier}
                  onChange={(e) => setInvSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Κατηγορία:</label>
                <select
                  value={invCategory}
                  onChange={(e) => setInvCategory(e.target.value as ManagedInvoice['category'])}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Πρώτες Ύλες & Καφέδες">Πρώτες Ύλες & Καφέδες</option>
                  <option value="Συσκευασία & Αναλώσιμα">Συσκευασία & Αναλώσιμα</option>
                  <option value="Εξοπλισμός & Συντήρηση">Εξοπλισμός & Συντήρηση</option>
                  <option value="Λοιπά Τιμολόγια">Λοιπά Τιμολόγια</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Τρόπος Πληρωμής:</label>
                <select
                  value={invPaymentMethod}
                  onChange={(e) => setInvPaymentMethod(e.target.value as ManagedInvoice['paymentMethod'])}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Τράπεζα">Τράπεζα</option>
                  <option value="Μετρητά">Μετρητά</option>
                  <option value="Κάρτα Εταιρείας">Κάρτα Εταιρείας</option>
                  <option value="IRIS / Άμεση">IRIS / Άμεση</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Συνολικό Ποσό Gross (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={invAmount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setInvAmount(val);
                    setInvVat(+(val * 0.13 / 1.13).toFixed(2));
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Ποσό ΦΠΑ (€):</label>
                <input
                  type="number"
                  step="0.01"
                  value={invVat}
                  onChange={(e) => setInvVat(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ημ/νία Λήξης:</label>
                <input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Κατάσταση:</label>
                <select
                  value={invStatus}
                  onChange={(e) => setInvStatus(e.target.value as 'Pending' | 'Paid')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="Pending">Εκκρεμεί (Pending)</option>
                  <option value="Paid">Εξοφλημένο (Paid)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Σημειώσεις / Περιγραφή:</label>
                <input
                  type="text"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="π.χ. Τροφοδοσία καφέ Νοεμβρίου"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow transition"
              >
                {editingInvoiceOriginalId ? 'Αποθήκευση Αλλαγών' : 'Αποθήκευση Τιμολογίου'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Καταχώρηση / Επεξεργασία Παγίου Εξόδου */}
      {showFixedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveFixedExpense}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-400" />
                <span>{editingFixedId !== null ? 'Επεξεργασία Παγίου Εξόδου' : 'Νέο Μηνιαίο Πάγιο Έξοδο'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowFixedModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Περιγραφή Παγίου *</label>
                <input
                  type="text"
                  required
                  value={fixTitle}
                  onChange={(e) => setFixTitle(e.target.value)}
                  placeholder="π.χ. Ενοίκιο / ΔΕΗ / Λογιστήριο"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Κατηγορία:</label>
                  <select
                    value={fixCategory}
                    onChange={(e) => setFixCategory(e.target.value as FixedExpenseItem['category'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Ενοίκιο">Ενοίκιο</option>
                    <option value="Ενέργεια & Ύδρευση">Ενέργεια & Ύδρευση</option>
                    <option value="Λογιστήριο & Νομικά">Λογιστήριο & Νομικά</option>
                    <option value="Τηλεπικοινωνίες & POS">Τηλεπικοινωνίες & POS</option>
                    <option value="Ασφάλιστρα & Άδειες">Ασφάλιστρα & Άδειες</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Ημέρα Μήνα (1-31):</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={fixBillingDay}
                    onChange={(e) => setFixBillingDay(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Ποσό (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fixAmount}
                    onChange={(e) => setFixAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Συντελεστής ΦΠΑ:</label>
                  <select
                    value={fixVatRate}
                    onChange={(e) => setFixVatRate(Number(e.target.value) as 0 | 13 | 24)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  >
                    <option value={0}>0% (Απαλλαγή / Ενοίκιο)</option>
                    <option value={13}>13%</option>
                    <option value={24}>24%</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowFixedModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow"
              >
                Αποθήκευση Παγίου
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}