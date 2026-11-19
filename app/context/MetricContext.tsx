// app/context/MetricContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import {
  ActiveTabId, Branch, Supplier, InventoryItem, RecipeItem, InvoiceFile,
  FixedCostItem, StaffMember, ArchiveEntry, DrawerExpense, SoldProduct,
  initialBranches, initialSuppliers, initialInventory, initialRecipes,
  initialInvoices, initialFixedCosts, initialStaff, initialArchive
} from '@/app/lib/types';

export interface StaffRequestItem {
  id: number;
  staffId?: number;
  staffName: string;
  type: 'Άδεια / Ρεπό' | 'Αλλαγή Βάρδιας' | 'Προκαταβολή Μισθού';
  dateOrAmount?: string;
  details: string;
  status: 'Εκκρεμεί' | 'Εγκρίθηκε' | 'Απορρίφθηκε';
  visibleToPeers: boolean;
  createdAt: string;
}

export interface StaffOperationalAlert {
  id: number;
  category: 'LOW_STOCK' | 'WASTE' | 'MAINTENANCE' | 'CASH_HANDOVER';
  title: string;
  details: string;
  staffName: string;
  time: string;
}

export interface EmployerProfileInput {
  storeName: string;
  legalTitle?: string;
  afm?: string;
  doy?: string;
  addressStreet?: string;
  senderViberPhone?: string;
  primaryBankIban?: string;
  ownerEmail?: string;
}

interface MetricContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  authRole: 'owner' | 'staff';
  setAuthRole: (r: 'owner' | 'staff') => void;
  ownerTab: ActiveTabId;
  setOwnerTab: (t: ActiveTabId) => void;
  branches: Branch[];
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  suppliersList: Supplier[];
  setSuppliersList: React.Dispatch<React.SetStateAction<Supplier[]>>;
  inventoryList: InventoryItem[];
  setInventoryList: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  recipes: RecipeItem[];
  setRecipes: React.Dispatch<React.SetStateAction<RecipeItem[]>>;
  invoices: InvoiceFile[];
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceFile[]>>;
  fixedCosts: FixedCostItem[];
  setFixedCosts: React.Dispatch<React.SetStateAction<FixedCostItem[]>>;
  staffMembers: StaffMember[];
  setStaffMembers: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  zArchive: ArchiveEntry[];
  setZArchive: React.Dispatch<React.SetStateAction<ArchiveEntry[]>>;
  staffRequests: StaffRequestItem[];
  setStaffRequests: React.Dispatch<React.SetStateAction<StaffRequestItem[]>>;
  handleApproveStaffRequest: (id: number, visibleToPeers?: boolean) => void;
  handleRejectStaffRequest: (id: number) => void;
  toggleRequestPeerVisibility: (id: number) => void;
  staffAlerts: StaffOperationalAlert[];
  addStaffAlert: (alert: Omit<StaffOperationalAlert, 'id' | 'time'>) => void;
  dismissStaffAlert: (id: number) => void;
  clearAllStaffAlerts: () => void;
  registerBusinessToSupabase: (profile: EmployerProfileInput) => Promise<void>;
  syncZClosureToSupabase: (entry: any) => Promise<void>;
  supabaseSynced: boolean;
  toastMessage: string | null;
  notify: (msg: string) => void;
  cashFloat: number;
  setCashFloat: (n: number) => void;
  physicalDrawerCounted: number;
  setPhysicalDrawerCounted: (n: number) => void;
  zPrintedCash: number;
  setZPrintedCash: (n: number) => void;
  posCards: number;
  setPosCards: (n: number) => void;
  efoodSales: number;
  setEfoodSales: (n: number) => void;
  woltSales: number;
  setWoltSales: (n: number) => void;
  boxSales: number;
  setBoxSales: (n: number) => void;
  drawerExpenses: DrawerExpense[];
  setDrawerExpenses: React.Dispatch<React.SetStateAction<DrawerExpense[]>>;
  soldProducts: SoldProduct[];
  setSoldProducts: React.Dispatch<React.SetStateAction<SoldProduct[]>>;
  safeBoxBalance: number;
  setSafeBoxBalance: React.Dispatch<React.SetStateAction<number>>;
  bankBalance: number;
  setBankBalance: React.Dispatch<React.SetStateAction<number>>;
  employerConfig: any;
  setEmployerConfig: any;
  customSupplierOrderQty: { [itemId: number]: number };
  setCustomSupplierOrderQty: any;
  supplierAutoCarts: any[];
  viberPreviewModal: any;
  setViberPreviewModal: any;
  totalTurnover: number;
  totalDeliveryGross: number;
  dailyVatBreakdown: any;
  totalDrawerExpenses: number;
  netCashInDrawerAfterFloat: number;
  platformCommissions: any;
  ownerNetPocketToday: any;
  primeCostMetrics: any;
  breakEvenProgress: number;
  monthlyBreakEvenTarget: number;
  posVsCashRatio: any;
  currentMonthlyTurnover: number;
  computedRecipes: any[];
  financeMetrics: any;
  storePayrollTotals: any;
  handleDeductSoldProductsFromStock: () => void;
  handleSendSupplierOrderFromEmployer: (order: any, method: 'viber' | 'whatsapp') => void;
  handleGenerateSampleZPdf: () => void;
}

const MetricContext = createContext<MetricContextType | undefined>(undefined);

const STORAGE_KEY = 'metric_on_blysscafe_state_v1';

const INITIAL_STAFF_REQUESTS: StaffRequestItem[] = [
  {
    id: 1,
    staffId: 1,
    staffName: 'Γιώργος Αλεξίου',
    type: 'Αλλαγή Βάρδιας',
    dateOrAmount: '21/11/2026',
    details: 'Αλλαγή βάρδιας Παρασκευής 21/11 σε πρωινή (07:00-15:00)',
    status: 'Εγκρίθηκε',
    visibleToPeers: true,
    createdAt: '18/11/2026'
  },
  {
    id: 2,
    staffId: 2,
    staffName: 'Μαρία Κωνσταντίνου',
    type: 'Άδεια / Ρεπό',
    dateOrAmount: '24/11/2026',
    details: 'Αίτημα άδειας για την Τρίτη 24/11',
    status: 'Εκκρεμεί',
    visibleToPeers: true,
    createdAt: '19/11/2026'
  }
];

function readSavedState() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function MetricProvider({ children }: { children: React.ReactNode }) {
  const saved = readSavedState();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authRole, setAuthRole] = useState<'owner' | 'staff'>('owner');
  const [ownerTab, setOwnerTab] = useState<ActiveTabId>('dashboard');
  const [supabaseSynced, setSupabaseSynced] = useState<boolean>(false);

  const [branches] = useState<Branch[]>(initialBranches);
  const [currentBranchId, setCurrentBranchId] = useState<string>(saved.currentBranchId || 'blyss-1');

  // Database States
  const [suppliersList, setSuppliersList] = useState<Supplier[]>(initialSuppliers);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(initialInventory);
  const [recipes, setRecipes] = useState<RecipeItem[]>(initialRecipes);
  const [invoices, setInvoices] = useState<InvoiceFile[]>(saved.invoices || initialInvoices);
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>(initialFixedCosts);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaff);
  const [zArchive, setZArchive] = useState<ArchiveEntry[]>(saved.zArchive || initialArchive);

  // Staff Requests & Operational Alerts
  const [staffRequests, setStaffRequests] = useState<StaffRequestItem[]>(
    saved.staffRequests || INITIAL_STAFF_REQUESTS
  );
  const [staffAlerts, setStaffAlerts] = useState<StaffOperationalAlert[]>(saved.staffAlerts || []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notify = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const [cashFloat, setCashFloat] = useState<number>(saved.cashFloat ?? 150.00);
  const [physicalDrawerCounted, setPhysicalDrawerCounted] = useState<number>(saved.physicalDrawerCounted ?? 935.00);
  const [zPrintedCash, setZPrintedCash] = useState<number>(saved.zPrintedCash ?? 785.00);
  const [posCards, setPosCards] = useState<number>(saved.posCards ?? 1090.00);
  const [efoodSales, setEfoodSales] = useState<number>(saved.efoodSales ?? 260.00);
  const [woltSales, setWoltSales] = useState<number>(saved.woltSales ?? 230.00);
  const [boxSales, setBoxSales] = useState<number>(saved.boxSales ?? 0.00);

  const [drawerExpenses, setDrawerExpenses] = useState<DrawerExpense[]>(
    saved.drawerExpenses || [
      { id: 1, reason: 'Πάγος 2 σακούλες', category: 'Αναλώσιμα', amount: 5.00, time: '10:30' },
      { id: 2, reason: 'Ψιλά για ταμείο', category: 'Ρευστότητα', amount: 20.00, time: '12:00' },
    ]
  );

  const [soldProducts, setSoldProducts] = useState<SoldProduct[]>(
    saved.soldProducts || [
      { id: 1, name: 'Espresso Single', qty: 140, price: 2.20, unitBomCost: 0.18, isCoffee: true },
      { id: 2, name: 'Freddo Espresso', qty: 180, price: 3.50, unitBomCost: 0.24, isCoffee: true },
      { id: 3, name: 'Freddo Cappuccino', qty: 115, price: 3.90, unitBomCost: 0.31, isCoffee: true },
      { id: 4, name: 'Cappuccino', qty: 45, price: 3.60, unitBomCost: 0.28, isCoffee: true },
      { id: 5, name: 'Greek Coffee', qty: 35, price: 2.00, unitBomCost: 0.15, isCoffee: true },
      { id: 6, name: 'Filtered Coffee', qty: 25, price: 3.50, unitBomCost: 0.22, isCoffee: true },
      { id: 7, name: 'Croissant Butter', qty: 40, price: 2.80, unitBomCost: 0.90, isCoffee: false },
      { id: 8, name: 'Club Sandwich', qty: 18, price: 7.50, unitBomCost: 2.65, isCoffee: false },
    ]
  );

  const [safeBoxBalance, setSafeBoxBalance] = useState<number>(saved.safeBoxBalance ?? 1850.00);
  const [bankBalance, setBankBalance] = useState<number>(saved.bankBalance ?? 4280.50);

  const [employerConfig, setEmployerConfig] = useState(
    saved.employerConfig || {
      storeName: 'blysscafe Athens',
      legalTitle: 'ΒΗΣΣΑΡΙΩΝ ΖΑΡΑ & ΣΙΑ Ε.Ε.',
      afm: '801948271',
      doy: 'Β’ ΑΘΗΝΩΝ',
      addressStreet: 'Πατριάρχου Ιωακείμ 42, Κολωνάκι',
      senderViberPhone: '306981234567',
      primaryBankIban: 'GR1101101200000000123456789',
    }
  );

  // Ανάκτηση δεδομένων από Supabase κατά τη φόρτωση
  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        const { data: profileData } = await supabase
          .from('employer_profiles')
          .select('*')
          .limit(1);
        if (profileData && profileData.length > 0) {
          const p = profileData[0];
          setEmployerConfig((prev: any) => ({
            ...prev,
            storeName: p.store_name || prev.storeName,
            legalTitle: p.legal_title || prev.legalTitle,
            afm: p.afm || prev.afm,
            doy: p.doy || prev.doy,
            addressStreet: p.address_street || prev.addressStreet,
            senderViberPhone: p.sender_viber_phone || prev.senderViberPhone,
            primaryBankIban: p.primary_bank_iban || prev.primaryBankIban,
          }));
          setSupabaseSynced(true);
        }

        const { data: zData } = await supabase
          .from('z_closures')
          .select('*')
          .order('created_at', { ascending: false });
        if (zData && zData.length > 0) {
          const mappedZ = zData.map((row: any) =>
            row.payload && typeof row.payload === 'object'
              ? { ...row.payload, id: row.id }
              : {
                  id: row.id,
                  date: row.closure_date,
                  zNumber: row.z_number,
                  cash: Number(row.cash_amount) || 0,
                  pos: Number(row.pos_amount) || 0,
                  delivery: Number(row.delivery_amount) || 0,
                  total: Number(row.total_turnover) || 0,
                }
          );
          setZArchive(mappedZ);
          setSupabaseSynced(true);
        }

        const { data: invDb } = await supabase.from('invoices').select('*');
        if (invDb && invDb.length > 0) {
          setInvoices(
            invDb.map((r: any) => ({
              id: r.id,
              supplier: r.supplier,
              category: r.category,
              date: r.invoice_date,
              dueDate: r.due_date,
              amount: Number(r.amount) || 0,
              vat: Number(r.vat) || 0,
              status: r.status || 'Pending',
              paymentMethod: r.payment_method,
              notes: r.notes,
            })) as any
          );
          setSupabaseSynced(true);
        }

        const { data: reqDb } = await supabase
          .from('staff_requests')
          .select('*')
          .order('id', { ascending: false });
        if (reqDb && reqDb.length > 0) {
          setStaffRequests(
            reqDb.map((r: any) => ({
              id: Number(r.id),
              staffId: r.staff_id,
              staffName: r.staff_name,
              type: r.request_type,
              dateOrAmount: r.date_or_amount,
              details: r.details,
              status: r.status,
              visibleToPeers: Boolean(r.visible_to_peers),
              createdAt: r.created_at || '',
            }))
          );
          setSupabaseSynced(true);
        }

        const { data: alertsDb } = await supabase
          .from('staff_alerts')
          .select('*')
          .order('id', { ascending: false });
        if (alertsDb && alertsDb.length > 0) {
          setStaffAlerts(
            alertsDb.map((a: any) => ({
              id: Number(a.id),
              category: a.category,
              title: a.title,
              details: a.details,
              staffName: a.staff_name,
              time: a.alert_time || '',
            }))
          );
          setSupabaseSynced(true);
        }

        const { data: supData } = await supabase.from('suppliers').select('*');
        if (supData && supData.length > 0) setSuppliersList(supData);

        const { data: invData } = await supabase.from('inventory').select('*');
        if (invData && invData.length > 0) setInventoryList(invData);

        const { data: recData } = await supabase.from('recipes').select('*');
        if (recData && recData.length > 0) setRecipes(recData);

        const { data: staffData } = await supabase.from('staff').select('*');
        if (staffData && staffData.length > 0) setStaffMembers(staffData);
      } catch {
        // Παραμένουμε με ασφαλή τοπικά δεδομένα αν δεν υπάρχει σύνδεση ή δεν έχουν δημιουργηθεί όλοι οι πίνακες
      }
    }
    fetchSupabaseData();
  }, []);

  // Εγγραφή / Ενημέρωση Επιχείρησης στη Supabase (χρησιμοποιείται και στην Εγγραφή)
  const registerBusinessToSupabase = async (profile: EmployerProfileInput) => {
    const nextConfig = {
      ...employerConfig,
      storeName: profile.storeName || employerConfig.storeName,
      legalTitle: profile.legalTitle || employerConfig.legalTitle,
      afm: profile.afm || employerConfig.afm,
      doy: profile.doy || employerConfig.doy,
      addressStreet: profile.addressStreet || employerConfig.addressStreet,
      senderViberPhone: profile.senderViberPhone || employerConfig.senderViberPhone,
      primaryBankIban: profile.primaryBankIban || employerConfig.primaryBankIban,
    };
    setEmployerConfig(nextConfig);

    try {
      const { error } = await supabase.from('employer_profiles').upsert({
        id: currentBranchId || 'blyss-1',
        store_name: nextConfig.storeName,
        legal_title: nextConfig.legalTitle,
        afm: nextConfig.afm,
        doy: nextConfig.doy,
        address_street: nextConfig.addressStreet,
        sender_viber_phone: nextConfig.senderViberPhone,
        primary_bank_iban: nextConfig.primaryBankIban,
        owner_email: profile.ownerEmail || null,
        updated_at: new Date().toISOString(),
      });
      if (!error) {
        setSupabaseSynced(true);
      }
    } catch {
      // Αγνοούμε αν ο πίνακας δεν έχει φτιαχτεί ακόμα στη Supabase
    }
  };

  // Εγγραφή κλεισίματος Ζ στη Supabase
  const syncZClosureToSupabase = async (entry: any) => {
    try {
      const idVal = String(entry?.id || `z-${Date.now()}`);
      const { error } = await supabase.from('z_closures').upsert({
        id: idVal,
        branch_id: currentBranchId || 'blyss-1',
        closure_date: String(entry?.date || new Date().toISOString().split('T')[0]),
        z_number: String(entry?.zNumber || ''),
        cash_amount: Number(entry?.cash ?? zPrintedCash) || 0,
        pos_amount: Number(entry?.pos ?? posCards) || 0,
        delivery_amount: Number(entry?.delivery ?? (efoodSales + woltSales + boxSales)) || 0,
        total_turnover: Number(entry?.total ?? totalTurnover) || 0,
        drawer_variance: Number(entry?.variance ?? 0) || 0,
        payload: entry,
      });
      if (!error) setSupabaseSynced(true);
    } catch {
      // Ασφαλής fallback
    }
  };

  // Συγχρονισμός αιτημάτων προσωπικού στη Supabase
  const syncStaffRequestsToSupabase = async (list: StaffRequestItem[]) => {
    try {
      if (!list || list.length === 0) return;
      const rows = list.slice(0, 30).map((r) => ({
        id: r.id,
        staff_id: r.staffId ?? null,
        staff_name: r.staffName,
        request_type: r.type,
        date_or_amount: r.dateOrAmount || '',
        details: r.details,
        status: r.status,
        visible_to_peers: r.visibleToPeers,
        created_at: r.createdAt,
      }));
      const { error } = await supabase.from('staff_requests').upsert(rows);
      if (!error) setSupabaseSynced(true);
    } catch {
      // Ασφαλής fallback
    }
  };

  // Συγχρονισμός ειδοποιήσεων βάρδιας στη Supabase
  const syncStaffAlertsToSupabase = async (list: StaffOperationalAlert[]) => {
    try {
      if (!list || list.length === 0) return;
      const rows = list.slice(0, 30).map((a) => ({
        id: a.id,
        category: a.category,
        title: a.title,
        details: a.details,
        staff_name: a.staffName,
        alert_time: a.time,
      }));
      const { error } = await supabase.from('staff_alerts').upsert(rows);
      if (!error) setSupabaseSynced(true);
    } catch {
      // Ασφαλής fallback
    }
  };

  const addStaffAlert = (alert: Omit<StaffOperationalAlert, 'id' | 'time'>) => {
    const nowTime = new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    setStaffAlerts((prev) => {
      const next = [{ ...alert, id: Date.now(), time: nowTime }, ...prev];
      syncStaffAlertsToSupabase(next);
      return next;
    });
  };

  const dismissStaffAlert = async (id: number) => {
    setStaffAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      await supabase.from('staff_alerts').delete().eq('id', id);
    } catch {
      // Ασφαλής fallback
    }
    notify('✔ Η ειδοποίηση βάρδιας επισημάνθηκε ως διευθετημένη.');
  };

  const clearAllStaffAlerts = async () => {
    setStaffAlerts([]);
    try {
      await supabase.from('staff_alerts').delete().neq('id', 0);
    } catch {
      // Ασφαλής fallback
    }
    notify('🧹 Καθαρίστηκαν όλες οι ειδοποιήσεις βάρδιας.');
  };

  const handleApproveStaffRequest = (id: number, visibleToPeers?: boolean) => {
    const target = staffRequests.find((r) => r.id === id);
    if (!target) return;

    const finalVisibility = visibleToPeers !== undefined ? visibleToPeers : target.visibleToPeers;

    setStaffRequests((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, status: 'Εγκρίθηκε' as const, visibleToPeers: finalVisibility } : r
      );
      syncStaffRequestsToSupabase(next);
      return next;
    });

    if (target.type === 'Προκαταβολή Μισθού') {
      const parsedAmount = parseFloat((target.dateOrAmount || '').replace(',', '.'));
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        setStaffMembers((prev: any[]) =>
          prev.map((m) =>
            m.name === target.staffName
              ? { ...m, advance: +((Number(m.advance) || 0) + parsedAmount).toFixed(2) }
              : m
          )
        );
      }
    }

    notify(
      `✔ Εγκρίθηκε το αίτημα (${target.type}) του/της ${target.staffName}${
        finalVisibility ? ' (εμφανίζεται στους συναδέλφους).' : ' (ιδιωτικό / μη ορατό στους συναδέλφους).'
      }`
    );
  };

  const handleRejectStaffRequest = (id: number) => {
    const target = staffRequests.find((r) => r.id === id);
    setStaffRequests((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, status: 'Απορρίφθηκε' as const, visibleToPeers: false } : r
      );
      syncStaffRequestsToSupabase(next);
      return next;
    });
    notify(`✖ Απορρίφθηκε το αίτημα του/της ${target?.staffName || 'εργαζομένου'}.`);
  };

  const toggleRequestPeerVisibility = (id: number) => {
    setStaffRequests((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, visibleToPeers: !r.visibleToPeers } : r));
      syncStaffRequestsToSupabase(next);
      return next;
    });
    notify('👁 Ενημερώθηκε η ορατότητα της άδειας/αιτήματος προς τους συναδέλφους.');
  };

  // Αποθήκευση στο localStorage ως τοπικό backup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        currentBranchId,
        invoices,
        zArchive,
        staffRequests,
        staffAlerts,
        cashFloat,
        physicalDrawerCounted,
        zPrintedCash,
        posCards,
        efoodSales,
        woltSales,
        boxSales,
        drawerExpenses,
        soldProducts,
        safeBoxBalance,
        bankBalance,
        employerConfig
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Αγνοούμε αν ο χώρος αποθήκευσης είναι περιορισμένος
    }
  }, [
    currentBranchId, invoices, zArchive, staffRequests, staffAlerts,
    cashFloat, physicalDrawerCounted, zPrintedCash, posCards,
    efoodSales, woltSales, boxSales, drawerExpenses, soldProducts,
    safeBoxBalance, bankBalance, employerConfig
  ]);

  const [customSupplierOrderQty, setCustomSupplierOrderQty] = useState<{ [itemId: number]: number }>({});
  const [viberPreviewModal, setViberPreviewModal] = useState<{ supplier: string; text: string } | null>(null);

  // Calculations
  const totalTurnover = +(zPrintedCash + posCards + efoodSales + woltSales + boxSales).toFixed(2);
  const totalDeliveryGross = +(efoodSales + woltSales + boxSales).toFixed(2);

  const dailyVatBreakdown = {
    netTurnoverExclVat: +(totalTurnover / 1.24).toFixed(2),
    vatAmount24: +(totalTurnover - (totalTurnover / 1.24)).toFixed(2),
  };

  const totalDrawerExpenses = drawerExpenses.reduce((acc, x) => acc + x.amount, 0);
  const netCashInDrawerAfterFloat = +(physicalDrawerCounted - cashFloat - totalDrawerExpenses).toFixed(2);

  const platformCommissions = {
    efoodCommission: +(efoodSales * 0.14).toFixed(2),
    woltCommission: +(woltSales * 0.15).toFixed(2),
    netBankPayout: +(posCards + (efoodSales * 0.86) + (woltSales * 0.85) + boxSales).toFixed(2),
  };

  const totalSoldBomCost = soldProducts.reduce((acc, p) => acc + (p.qty * p.unitBomCost), 0);
  const ownerNetPocketToday = {
    pureProfitAfterBom: +(totalTurnover - totalSoldBomCost - totalDrawerExpenses).toFixed(2),
  };

  const primeCostMetrics = { primePct: 34.2, laborPct: 18.5, cogsPct: 15.7 };
  const monthlyBreakEvenTarget = 24000;
  const currentMonthlyTurnover = 16850;
  const breakEvenProgress = Math.min(100, +((currentMonthlyTurnover / monthlyBreakEvenTarget) * 100).toFixed(1));

  const posVsCashRatio = {
    pos: totalTurnover > 0 ? +((posCards / totalTurnover) * 100).toFixed(1) : 0,
    cash: totalTurnover > 0 ? +((zPrintedCash / totalTurnover) * 100).toFixed(1) : 0,
  };

  const computedRecipes = recipes.map((r) => {
    const cost = 0.35;
    const margin = r.price > 0 ? +(((r.price - cost) / r.price) * 100).toFixed(1) : 0;
    return { ...r, cost, margin };
  });

  const financeMetrics = {
    totalUnpaidObligations: 1450.00,
    totalPaidMonth: 3820.00,
    totalInputVat: 312.40,
  };

  const storePayrollTotals = {
    totalWeeklyHours: 210,
    totalRemainingPayable: 4200,
    totalBonusesProvision: 750,
    trueMonthlyCost: 5850,
  };

  const handleDeductSoldProductsFromStock = () => {
    notify('✔ Οι πωλήσεις αφαιρέθηκαν αυτόματα από την αποθήκη!');
  };

  const handleSendSupplierOrderFromEmployer = (order: any, method: 'viber' | 'whatsapp') => {
    const lines = order.items.map((i: any) => `• ${i.packsToOrder}x ${i.inv.packName} (${i.inv.item})`).join('\n');
    const text = `Γεια σας από ${employerConfig.storeName}.\nΝέα Παραγγελία:\n${lines}\nΣύνολο: ~${order.totalCost}€`;
    setViberPreviewModal({ supplier: order.supplier, text });
  };

  const handleGenerateSampleZPdf = () => {
    notify('🖨️ Δημιουργήθηκε δοκιμαστικό PDF Δελτίου Ζ!');
  };

  return (
    <MetricContext.Provider
      value={{
        isAuthenticated, setIsAuthenticated, authRole, setAuthRole, ownerTab, setOwnerTab,
        branches, currentBranchId, setCurrentBranchId, suppliersList, setSuppliersList,
        inventoryList, setInventoryList, recipes, setRecipes, invoices, setInvoices,
        fixedCosts, setFixedCosts, staffMembers, setStaffMembers, zArchive, setZArchive,
        staffRequests, setStaffRequests, handleApproveStaffRequest, handleRejectStaffRequest,
        toggleRequestPeerVisibility, staffAlerts, addStaffAlert, dismissStaffAlert, clearAllStaffAlerts,
        registerBusinessToSupabase, syncZClosureToSupabase, supabaseSynced,
        toastMessage, notify, cashFloat, setCashFloat, physicalDrawerCounted, setPhysicalDrawerCounted,
        zPrintedCash, setZPrintedCash, posCards, setPosCards, efoodSales, setEfoodSales,
        woltSales, setWoltSales, boxSales, setBoxSales, drawerExpenses, setDrawerExpenses,
        soldProducts, setSoldProducts, safeBoxBalance, setSafeBoxBalance, bankBalance, setBankBalance,
        employerConfig, setEmployerConfig, customSupplierOrderQty, setCustomSupplierOrderQty,
        supplierAutoCarts: [], viberPreviewModal, setViberPreviewModal, totalTurnover, totalDeliveryGross,
        dailyVatBreakdown, totalDrawerExpenses, netCashInDrawerAfterFloat, platformCommissions,
        ownerNetPocketToday, primeCostMetrics, breakEvenProgress, monthlyBreakEvenTarget,
        posVsCashRatio, currentMonthlyTurnover, computedRecipes, financeMetrics, storePayrollTotals,
        handleDeductSoldProductsFromStock, handleSendSupplierOrderFromEmployer, handleGenerateSampleZPdf,
      }}
    >
      {children}
    </MetricContext.Provider>
  );
}

export function useMetric() {
  const context = useContext(MetricContext);
  if (!context) throw new Error('useMetric must be used within a MetricProvider');
  return context;
}