// app/components/views/PayrollView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import {
  Users, UserPlus, ShieldCheck, AlertTriangle,
  CheckCircle2, Edit3, Trash2, X, Search,
  Award, FileCheck2, Calendar
} from 'lucide-react';

interface WeeklyScheduleMap {
  Δευ: string;
  Τρι: string;
  Τετ: string;
  Πεμ: string;
  Παρ: string;
  Σαβ: string;
  Κυρ: string;
}

interface LegalStaffMember {
  id: number;
  name: string;
  role: string;
  afm: string;
  amka: string;
  efkaRegistry: string;
  idNumber: string;
  phone: string;
  email: string;
  iban: string;
  hireDate: string;
  contractType: 'Full-time (Πλήρης)' | 'Part-time (Μερική)' | 'Εκ Περιτροπής' | 'Ορισμένου Χρόνου';
  erganiStatus: 'Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας' | 'Σε Αναμονή Δήλωσης' | 'Εκτός Κάρτας';
  healthCertExpiry: string;
  payMode: 'hourly' | 'monthly';
  basePay: number;
  weeklyHours: number;
  advancePaid: number;
  tipsShare: number;
  sundayShiftBonusPct: number;
  schedule: WeeklyScheduleMap;
}

const DEFAULT_SCHEDULE: WeeklyScheduleMap = {
  Δευ: '07:00-15:00',
  Τρι: '07:00-15:00',
  Τετ: '07:00-15:00',
  Πεμ: 'ΡΕΠΟ',
  Παρ: '07:00-15:00',
  Σαβ: '08:00-16:00',
  Κυρ: 'ΡΕΠΟ'
};

const INITIAL_LEGAL_STAFF: LegalStaffMember[] = [
  {
    id: 1,
    name: 'Γιώργος Αλεξίου',
    role: 'Cashier / Barista',
    afm: '123456789',
    amka: '01019500000',
    efkaRegistry: '09876543210',
    idNumber: 'ΑΚ-449102',
    phone: '6945678123',
    email: 'giorgos.alexiou@blysscafe.gr',
    iban: 'GR1201101230000000045678901',
    hireDate: '2025-03-01',
    contractType: 'Part-time (Μερική)',
    erganiStatus: 'Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας',
    healthCertExpiry: '2029-01-15',
    payMode: 'hourly',
    basePay: 6.50,
    weeklyHours: 40,
    advancePaid: 100.00,
    tipsShare: 65.00,
    sundayShiftBonusPct: 75,
    schedule: { ...DEFAULT_SCHEDULE }
  },
  {
    id: 2,
    name: 'Μαρία Κωνσταντίνου',
    role: 'Senior Barista & Shift Lead',
    afm: '148920311',
    amka: '14059401122',
    efkaRegistry: '09112233445',
    idNumber: 'ΑΟ-882319',
    phone: '6978112233',
    email: 'maria.k@blysscafe.gr',
    iban: 'GR4901401120000000011223344',
    hireDate: '2024-10-15',
    contractType: 'Full-time (Πλήρης)',
    erganiStatus: 'Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας',
    healthCertExpiry: '2026-12-05',
    payMode: 'hourly',
    basePay: 7.20,
    weeklyHours: 40,
    advancePaid: 150.00,
    tipsShare: 85.00,
    sundayShiftBonusPct: 75,
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

export default function PayrollView() {
  const {
    staffRequests,
    handleApproveStaffRequest,
    handleRejectStaffRequest,
    toggleRequestPeerVisibility,
    notify
  } = useMetric();

  const [staffList, setStaffList] = useState<LegalStaffMember[]>(INITIAL_LEGAL_STAFF);

  // Φίλτρα & Αναζήτηση
  const [searchQuery, setSearchQuery] = useState('');
  const [contractFilter, setContractFilter] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<'ALL' | 'ALERT'>('ALL');

  // Modal Νέας Πρόσληψης / Επεξεργασίας Εργαζομένου
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [role, setRole] = useState('Cashier / Barista');
  const [afm, setAfm] = useState('');
  const [amka, setAmka] = useState('');
  const [efkaRegistry, setEfkaRegistry] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('69');
  const [email, setEmail] = useState('');
  const [iban, setIban] = useState('GR');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractType, setContractType] = useState<LegalStaffMember['contractType']>('Part-time (Μερική)');
  const [erganiStatus, setErganiStatus] = useState<LegalStaffMember['erganiStatus']>('Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας');
  const [healthCertExpiry, setHealthCertExpiry] = useState('2029-06-30');
  const [payMode, setPayMode] = useState<'hourly' | 'monthly'>('hourly');
  const [basePay, setBasePay] = useState<number>(6.50);
  const [weeklyHours, setWeeklyHours] = useState<number>(40);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [tipsShare, setTipsShare] = useState<number>(0);
  const [sundayShiftBonusPct, setSundayShiftBonusPct] = useState<number>(75);
  const [schedule, setSchedule] = useState<WeeklyScheduleMap>({ ...DEFAULT_SCHEDULE });

  const getHealthCertStatus = (expiryDateStr: string): 'EXPIRED' | 'EXPIRING_SOON' | 'VALID' => {
    if (!expiryDateStr) return 'EXPIRED';
    const exp = new Date(expiryDateStr);
    const now = new Date('2026-11-19');
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'EXPIRED';
    if (diffDays <= 30) return 'EXPIRING_SOON';
    return 'VALID';
  };

  const computeStaffPay = (m: LegalStaffMember) => {
    const grossMonthly = m.payMode === 'hourly'
      ? +(m.weeklyHours * 4.33 * m.basePay).toFixed(2)
      : +m.basePay.toFixed(2);
    const employerBurden = +(grossMonthly * 0.22).toFixed(2);
    const netPayableAfterAdvance = +(grossMonthly + m.tipsShare - m.advancePaid).toFixed(2);
    return { grossMonthly, employerBurden, netPayableAfterAdvance };
  };

  const payrollKpis = useMemo(() => {
    let totalWeeklyHrs = 0;
    let totalGross = 0;
    let totalAdvances = 0;
    let totalNetPayable = 0;
    let complianceAlertsCount = 0;

    staffList.forEach((m) => {
      totalWeeklyHrs += m.weeklyHours;
      const calc = computeStaffPay(m);
      totalGross += calc.grossMonthly;
      totalAdvances += m.advancePaid;
      totalNetPayable += calc.netPayableAfterAdvance;

      const certStatus = getHealthCertStatus(m.healthCertExpiry);
      if (certStatus !== 'VALID' || m.erganiStatus !== 'Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας') {
        complianceAlertsCount++;
      }
    });

    return {
      count: staffList.length,
      totalWeeklyHrs,
      totalGross: +totalGross.toFixed(2),
      totalAdvances: +totalAdvances.toFixed(2),
      totalNetPayable: +totalNetPayable.toFixed(2),
      complianceAlertsCount
    };
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.afm.includes(q) ||
        m.amka.includes(q);
      const matchesContract = contractFilter === 'ALL' || m.contractType === contractFilter;
      const certStatus = getHealthCertStatus(m.healthCertExpiry);
      const hasAlert = certStatus !== 'VALID' || m.erganiStatus !== 'Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας';
      const matchesCompliance = complianceFilter === 'ALL' || (complianceFilter === 'ALERT' && hasAlert);
      return matchesSearch && matchesContract && matchesCompliance;
    });
  }, [staffList, searchQuery, contractFilter, complianceFilter]);

  const handleOpenNewHire = () => {
    setEditingId(null);
    setName('');
    setRole('Cashier / Barista');
    setAfm('');
    setAmka('');
    setEfkaRegistry('');
    setIdNumber('');
    setPhone('69');
    setEmail('');
    setIban('GR');
    setHireDate(new Date().toISOString().split('T')[0]);
    setContractType('Part-time (Μερική)');
    setErganiStatus('Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας');
    setHealthCertExpiry('2029-06-30');
    setPayMode('hourly');
    setBasePay(6.50);
    setWeeklyHours(40);
    setAdvancePaid(0);
    setTipsShare(0);
    setSundayShiftBonusPct(75);
    setSchedule({ ...DEFAULT_SCHEDULE });
    setShowModal(true);
  };

  const handleOpenEditStaff = (m: LegalStaffMember) => {
    setEditingId(m.id);
    setName(m.name);
    setRole(m.role);
    setAfm(m.afm);
    setAmka(m.amka);
    setEfkaRegistry(m.efkaRegistry);
    setIdNumber(m.idNumber);
    setPhone(m.phone);
    setEmail(m.email);
    setIban(m.iban);
    setHireDate(m.hireDate);
    setContractType(m.contractType);
    setErganiStatus(m.erganiStatus);
    setHealthCertExpiry(m.healthCertExpiry);
    setPayMode(m.payMode);
    setBasePay(m.basePay);
    setWeeklyHours(m.weeklyHours);
    setAdvancePaid(m.advancePaid);
    setTipsShare(m.tipsShare);
    setSundayShiftBonusPct(m.sundayShiftBonusPct);
    setSchedule({ ...m.schedule });
    setShowModal(true);
  };

  const handleQuickAdvance = (id: number, memberName: string) => {
    setStaffList((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, advancePaid: +(m.advancePaid + 50).toFixed(2) } : m
      )
    );
    notify(`💶 Καταχωρήθηκε προκαταβολή +50.00 € στον εργαζόμενο "${memberName}".`);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !afm.trim()) {
      notify('⚠️ Συμπληρώστε υποχρεωτικά Ονοματεπώνυμο και ΑΦΜ!');
      return;
    }

    const record: LegalStaffMember = {
      id: editingId ?? Date.now(),
      name: name.trim(),
      role: role.trim() || 'Εργαζόμενος',
      afm: afm.trim(),
      amka: amka.trim() || '___________',
      efkaRegistry: efkaRegistry.trim() || '___________',
      idNumber: idNumber.trim() || 'ΑΔΤ-______',
      phone: phone.trim() || '6900000000',
      email: email.trim() || 'staff@blysscafe.gr',
      iban: iban.trim() || 'GR___________________________',
      hireDate,
      contractType,
      erganiStatus,
      healthCertExpiry,
      payMode,
      basePay: Math.max(0, Number(basePay) || 0),
      weeklyHours: Math.max(1, Number(weeklyHours) || 40),
      advancePaid: Math.max(0, Number(advancePaid) || 0),
      tipsShare: Math.max(0, Number(tipsShare) || 0),
      sundayShiftBonusPct: Math.max(0, Number(sundayShiftBonusPct) || 75),
      schedule
    };

    if (editingId !== null) {
      setStaffList((prev) => prev.map((m) => (m.id === editingId ? record : m)));
      notify(`✔ Τα στοιχεία & η σύμβαση του εργαζομένου "${record.name}" ενημερώθηκαν!`);
    } else {
      setStaffList([record, ...staffList]);
      notify(`✔ Ο εργαζόμενος "${record.name}" καταχωρήθηκε πλήρως στο Μητρώο ΕΡΓΑΝΗ / ΣΕΠΕ!`);
    }

    setShowModal(false);
    setEditingId(null);
  };

  const handleDeleteStaff = (id: number, memberName: string) => {
    setStaffList((prev) => prev.filter((m) => m.id !== id));
    notify(`🗑️ Ο εργαζόμενος "${memberName}" αφαιρέθηκε από το ενεργό μητρώο.`);
  };

  const pendingRequestsCount = staffRequests.filter((r) => r.status === 'Εκκρεμεί').length;

  return (
    <div className="space-y-6 text-slate-100">

      {/* Top Header, Legal Compliance Banner & KPIs */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Users className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">
                Μητρώο Προσωπικού, Συμβάσεις & Νομική Συμμόρφωση (ΣΕΠΕ / ΕΡΓΑΝΗ ΙΙ)
              </h2>
              {pendingRequestsCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {pendingRequestsCount} Νέα Αιτήματα
                </span>
              )}
              {payrollKpis.complianceAlertsCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {payrollKpis.complianceAlertsCount} Έλεγχοι Συμμόρφωσης
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ασφαλιστικά στοιχεία (ΑΦΜ, ΑΜΚΑ, ΕΦΚΑ), Ψηφιακή Κάρτα Εργασίας, πιστοποιητικά υγείας, αιτήματα αδειών, προκαταβολές και εβδομαδιαίες βάρδιες.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNewHire}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Νέα Πρόσληψη / Σύμβαση</span>
          </button>
        </div>

        {/* Legal Checklist Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Ψηφιακή Κάρτα Εργασίας & ΕΡΓΑΝΗ ΙΙ</span>
              <span className="text-[10px] text-slate-400">Υποχρεωτική δήλωση ωραρίου & μεταβολών πριν την ανάληψη</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Award className="h-4 w-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Πιστοποιητικά Υγείας (Υγειονομικό)</span>
              <span className="text-[10px] text-slate-400">Απαραίτητα σε κάθε έλεγχο σε επιχείρηση καφέ/εστίασης</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Κυριακές, Αργίες & Προκαταβολές</span>
              <span className="text-[10px] text-slate-400">Παρακολούθηση προσαυξήσεων, φιλοδωρημάτων & καταβολών</span>
            </div>
          </div>
        </div>

        {/* 4 Payroll KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Ενεργό Μητρώο Προσωπικού</span>
            <p className="text-2xl font-black text-white">{payrollKpis.count} Άτομα</p>
            <span className="text-[10px] text-emerald-400 block">
              Σύνολο ωραρίων: {payrollKpis.totalWeeklyHrs} ώρες / εβδομάδα
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Εκτιμώμενες Μικτές Αποδοχές</span>
            <p className="text-2xl font-black text-emerald-400">{payrollKpis.totalGross.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">Βάσει συμφωνημένου ωραρίου & αμοιβών</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Δοθείσες Προκαταβολές Μήνα</span>
            <p className="text-2xl font-black text-amber-400">{payrollKpis.totalAdvances.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">Αφαιρούνται αυτόματα από το πληρωτέο</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Εκτιμώμενο Καθαρό Πληρωτέο</span>
            <p className="text-2xl font-black text-blue-400">{payrollKpis.totalNetPayable.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">Μετά προκαταβολές (+ φιλοδωρήματα)</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Αναζήτηση εργαζομένου, ειδικότητας, ΑΦΜ ή ΑΜΚΑ..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:outline-none"
            >
              <option value="ALL">Όλοι οι Τύποι Συμβάσεων</option>
              <option value="Part-time (Μερική)">Part-time (Μερική)</option>
              <option value="Full-time (Πλήρης)">Full-time (Πλήρης)</option>
              <option value="Εκ Περιτροπής">Εκ Περιτροπής</option>
              <option value="Ορισμένου Χρόνου">Ορισμένου Χρόνου</option>
            </select>
          </div>

          <div className="md:col-span-3 flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setComplianceFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                complianceFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Όλοι ({staffList.length})
            </button>
            <button
              type="button"
              onClick={() => setComplianceFilter('ALERT')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                complianceFilter === 'ALERT' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              Έλεγχοι ({payrollKpis.complianceAlertsCount})
            </button>
          </div>
        </div>
      </div>

      {/* Αιτήματα Προσωπικού (Άδειες, Βάρδιες & Προκαταβολές) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>Αιτήματα Προσωπικού (Άδειες, Αλλαγές Βάρδιας & Προκαταβολές)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Εγκρίνετε ή απορρίπτετε αιτήματα από το Staff Portal και ορίζετε αν η εγκεκριμένη μέρα θα φαίνεται στους συναδέλφους.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs">
            Εκκρεμή: {pendingRequestsCount}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {(staffRequests || []).map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-white">{req.staffName}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                    {req.type}
                  </span>
                  {req.dateOrAmount && (
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                      ({req.dateOrAmount})
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
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
                <p className="text-slate-300">{req.details}</p>
                <span className="text-[10px] text-slate-500 block">Καταχωρήθηκε: {req.createdAt}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {req.type !== 'Προκαταβολή Μισθού' && (
                  <button
                    type="button"
                    onClick={() => toggleRequestPeerVisibility(req.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      req.visibleToPeers
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {req.visibleToPeers ? '👁 Ορατό σε συναδέλφους' : '🙈 Απόρρητο (Μη ορατό)'}
                  </button>
                )}

                {req.status !== 'Εγκρίθηκε' && (
                  <button
                    type="button"
                    onClick={() => handleApproveStaffRequest(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] transition"
                  >
                    ✔ Έγκριση
                  </button>
                )}

                {req.status !== 'Απορρίφθηκε' && (
                  <button
                    type="button"
                    onClick={() => handleRejectStaffRequest(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-[11px] transition"
                  >
                    ✖ Απόρριψη
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredStaff.map((member) => {
          const certStatus = getHealthCertStatus(member.healthCertExpiry);
          const { grossMonthly, employerBurden, netPayableAfterAdvance } = computeStaffPay(member);

          return (
            <div
              key={member.id}
              className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-3 border-b border-slate-900 pb-3.5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-white">{member.name}</h3>
                      <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                        {member.contractType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {member.role} • Πρόσληψη: <span className="font-mono text-slate-300">{member.hireDate}</span> •{' '}
                      <span className="font-mono text-blue-300">{member.weeklyHours}h/εβδ.</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-mono font-black text-emerald-400 block">
                      {member.basePay.toFixed(2)} € {member.payMode === 'hourly' ? '/ ώρα' : '/ μήνα'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Μικτά: ~{grossMonthly.toFixed(2)} € (+{member.sundayShiftBonusPct}% Κυρ.)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold border inline-flex items-center gap-1 ${
                      member.erganiStatus === 'Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{member.erganiStatus}</span>
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold border inline-flex items-center gap-1 ${
                      certStatus === 'EXPIRED'
                        ? 'bg-red-500/15 text-red-400 border-red-500/35'
                        : certStatus === 'EXPIRING_SOON'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>
                      Υγειονομικό: {member.healthCertExpiry}{' '}
                      {certStatus === 'EXPIRED' ? '(ΛΗΞΕ)' : certStatus === 'EXPIRING_SOON' ? '(Λήγει σύντομα)' : ''}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ΑΦΜ:</span>
                    <span className="text-white font-mono font-bold">{member.afm}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ΑΜΚΑ:</span>
                    <span className="text-white font-mono font-bold">{member.amka}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Μητρώο ΕΦΚΑ / ΑΔΤ:</span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      {member.efkaRegistry} • {member.idNumber}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-3 pt-1.5 border-t border-slate-800 flex flex-wrap justify-between gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">IBAN Μισθοδοσίας:</span>
                      <span className="text-emerald-400 font-mono text-[11px]">{member.iban}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Επικοινωνία:</span>
                      <span className="text-slate-200 font-mono text-[11px]">{member.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Προκαταβολές</span>
                    <span className="text-amber-400 font-bold">-{member.advancePaid.toFixed(2)} €</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Φιλοδωρήματα</span>
                    <span className="text-emerald-400 font-bold">+{member.tipsShare.toFixed(2)} €</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Πληρωτέο</span>
                    <span className="text-blue-400 font-black">{netPayableAfterAdvance.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Δηλωμένο Πρόγραμμα Βαρδιών (Εβδομάδα):
                  </span>
                  <div className="grid grid-cols-7 gap-1 text-[10px]">
                    {(['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'] as const).map((day) => {
                      const val = member.schedule?.[day] || 'ΡΕΠΟ';
                      const isRepo = val.toUpperCase().includes('ΡΕΠΟ');
                      return (
                        <div
                          key={day}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center"
                        >
                          <span className="text-slate-400 font-bold block">{day}</span>
                          <span className={`font-mono text-[9px] block truncate ${isRepo ? 'text-red-400' : 'text-emerald-400'}`}>
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-900 text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Εκτ. Εργοδοτικό Κόστος: ~{(grossMonthly + employerBurden).toFixed(2)} €/μήνα
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAdvance(member.id, member.name)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px] transition"
                  >
                    +50€ Προκαταβολή
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditStaff(member)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Επεξεργασία</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStaff(member.id, member.name)}
                    title="Διαγραφή Εργαζομένου"
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition inline-flex items-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Νέα Πρόσληψη ή Επεξεργασία Εργαζομένου */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveStaff}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-3xl space-y-5 shadow-2xl my-8 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-emerald-400" />
                  <span>
                    {editingId !== null
                      ? `Επεξεργασία Καρτέλας Εργαζομένου: ${name}`
                      : 'Νέα Πρόσληψη & Δήλωση Στοιχείων (ΕΡΓΑΝΗ ΙΙ / ΣΕΠΕ)'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Συμπληρώστε ταυτοτικά, ασφαλιστικά, μισθοδοτικά στοιχεία και το εβδομαδιαίο πρόγραμμα βαρδιών.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1 font-bold">Ονοματεπώνυμο (όπως σε Ταυτότητα / ΕΡΓΑΝΗ) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="π.χ. Κώστας Παπαδόπουλος"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Ειδικότητα / Θέση:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">ΑΦΜ (9 ψηφία) *</label>
                <input
                  type="text"
                  required
                  maxLength={9}
                  value={afm}
                  onChange={(e) => setAfm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">ΑΜΚΑ (11 ψηφία):</label>
                <input
                  type="text"
                  maxLength={11}
                  value={amka}
                  onChange={(e) => setAmka(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Μητρώο ΕΦΚΑ / ΑΔΤ:</label>
                <input
                  type="text"
                  value={efkaRegistry}
                  onChange={(e) => setEfkaRegistry(e.target.value)}
                  placeholder="π.χ. 09876543210"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">ΑΔΤ / Διαβατήριο:</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="π.χ. ΑΚ-123456"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Κινητό Τηλέφωνο:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Εργαζομένου:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-slate-400 block mb-1">IBAN Μισθοδοσίας:</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1">Τύπος Σύμβασης:</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as LegalStaffMember['contractType'])}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold"
                >
                  <option value="Part-time (Μερική)">Part-time (Μερική)</option>
                  <option value="Full-time (Πλήρης)">Full-time (Πλήρης)</option>
                  <option value="Εκ Περιτροπής">Εκ Περιτροπής</option>
                  <option value="Ορισμένου Χρόνου">Ορισμένου Χρόνου</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Κατάσταση ΕΡΓΑΝΗ & Κάρτας:</label>
                <select
                  value={erganiStatus}
                  onChange={(e) => setErganiStatus(e.target.value as LegalStaffMember['erganiStatus'])}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 font-bold"
                >
                  <option value="Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας">Δηλωμένος ΕΡΓΑΝΗ & Κάρτα Εργασίας</option>
                  <option value="Σε Αναμονή Δήλωσης">Σε Αναμονή Δήλωσης</option>
                  <option value="Εκτός Κάρτας">Εκτός Κάρτας</option>
                </select>
              </div>

              <div>
                <label className="text-amber-400 block mb-1 font-bold">Λήξη Πιστοποιητικού Υγείας:</label>
                <input
                  type="date"
                  value={healthCertExpiry}
                  onChange={(e) => setHealthCertExpiry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-amber-500/30 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Τύπος Αμοιβής:</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as 'hourly' | 'monthly')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="hourly">Ωρομίσθιο (€/ώρα)</option>
                  <option value="monthly">Μηνιαίος Μισθός (€/μήνα)</option>
                </select>
              </div>

              <div>
                <label className="text-emerald-400 block mb-1 font-bold">
                  {payMode === 'hourly' ? 'Συμφωνηθέν Ωρομίσθιο (€):' : 'Συμφωνηθείς Μισθός (€):'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={basePay}
                  onChange={(e) => setBasePay(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ώρες / Εβδομάδα:</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 40)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-amber-400 block mb-1">Προκαταβολές Μήνα (€):</label>
                <input
                  type="number"
                  step="5"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-emerald-400 block mb-1">Φιλοδωρήματα Μήνα (€):</label>
                <input
                  type="number"
                  step="5"
                  value={tipsShare}
                  onChange={(e) => setTipsShare(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ημ/νία Πρόσληψης:</label>
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <span className="font-extrabold text-slate-300 block">
                Εβδομαδιαίο Πρόγραμμα Βαρδιών (π.χ. 07:00-15:00 ή ΡΕΠΟ):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                {(['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'] as const).map((day) => (
                  <div key={day} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">{day}</label>
                    <input
                      type="text"
                      value={schedule[day]}
                      onChange={(e) => setSchedule({ ...schedule, [day]: e.target.value })}
                      className="w-full px-1.5 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow"
              >
                {editingId !== null ? 'Αποθήκευση Αλλαγών' : 'Καταχώρηση στο Μητρώο'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}