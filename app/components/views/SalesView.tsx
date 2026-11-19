// app/components/views/SalesView.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import { 
  TrendingUp, DollarSign, Receipt, Printer, Plus, Trash2, Edit3, 
  Check, X, Vault, PackageCheck, Calculator, Archive, 
  Calendar, User, Upload, Download, ChevronLeft, ChevronRight, 
  FolderOpen, CheckCircle2, Sparkles, FileText, ClipboardPaste
} from 'lucide-react';

interface DaySnapshot {
  date: string;
  shift: 'Πρωινή (07:00-15:00)' | 'Απογευματινή (15:00-23:00)' | 'Ολοήμερο Κλείσιμο';
  cashier: string;
  zPrintedCash: number;
  posCards: number;
  efoodSales: number;
  woltSales: number;
  boxSales: number;
  cashFloat: number;
  physicalDrawerCounted: number;
  drawerExpenses: { id: number; reason: string; category: string; amount: number; time: string }[];
  soldProducts: { id: number; name: string; qty: number; price: number; unitBomCost: number; isCoffee: boolean }[];
}

const INITIAL_HISTORICAL_DAYS: { [date: string]: DaySnapshot } = {
  '2026-11-17': {
    date: '2026-11-17',
    shift: 'Ολοήμερο Κλείσιμο',
    cashier: 'Βησσαρίων (Διαχειριστής)',
    zPrintedCash: 690.00,
    posCards: 945.50,
    efoodSales: 215.00,
    woltSales: 185.00,
    boxSales: 32.00,
    cashFloat: 150.00,
    physicalDrawerCounted: 822.00,
    drawerExpenses: [
      { id: 101, reason: 'Πάγος 3 σακούλες (Χθες 17/11)', category: 'Αναλώσιμα', amount: 7.50, time: '11:15' },
      { id: 102, reason: 'Γάλατα έκτακτης ανάγκης', category: 'Πρώτες Ύλες', amount: 10.50, time: '14:40' }
    ],
    soldProducts: [
      { id: 1, name: 'Espresso Single', qty: 118, price: 2.20, unitBomCost: 0.18, isCoffee: true },
      { id: 2, name: 'Freddo Espresso', qty: 162, price: 3.50, unitBomCost: 0.24, isCoffee: true },
      { id: 3, name: 'Freddo Cappuccino', qty: 98, price: 3.90, unitBomCost: 0.31, isCoffee: true },
      { id: 4, name: 'Cappuccino', qty: 42, price: 3.60, unitBomCost: 0.28, isCoffee: true },
      { id: 5, name: 'Greek Coffee', qty: 28, price: 2.00, unitBomCost: 0.15, isCoffee: true },
      { id: 6, name: 'Filtered Coffee', qty: 19, price: 3.50, unitBomCost: 0.22, isCoffee: true },
      { id: 7, name: 'Croissant Butter', qty: 31, price: 2.80, unitBomCost: 0.90, isCoffee: false },
      { id: 8, name: 'Club Sandwich', qty: 14, price: 7.50, unitBomCost: 2.65, isCoffee: false }
    ]
  },
  '2026-11-16': {
    date: '2026-11-16',
    shift: 'Ολοήμερο Κλείσιμο',
    cashier: 'Γιώργος Αλεξίου',
    zPrintedCash: 610.00,
    posCards: 880.00,
    efoodSales: 190.00,
    woltSales: 165.00,
    boxSales: 0.00,
    cashFloat: 150.00,
    physicalDrawerCounted: 748.00,
    drawerExpenses: [
      { id: 201, reason: 'Καθαριστικά κουζίνας (16/11)', category: 'Αναλώσιμα', amount: 12.00, time: '09:50' }
    ],
    soldProducts: [
      { id: 1, name: 'Espresso Single', qty: 105, price: 2.20, unitBomCost: 0.18, isCoffee: true },
      { id: 2, name: 'Freddo Espresso', qty: 145, price: 3.50, unitBomCost: 0.24, isCoffee: true },
      { id: 3, name: 'Freddo Cappuccino', qty: 88, price: 3.90, unitBomCost: 0.31, isCoffee: true },
      { id: 4, name: 'Cappuccino', qty: 36, price: 3.60, unitBomCost: 0.28, isCoffee: true },
      { id: 5, name: 'Greek Coffee', qty: 22, price: 2.00, unitBomCost: 0.15, isCoffee: true },
      { id: 6, name: 'Filtered Coffee', qty: 15, price: 3.50, unitBomCost: 0.22, isCoffee: true },
      { id: 7, name: 'Croissant Butter', qty: 26, price: 2.80, unitBomCost: 0.90, isCoffee: false },
      { id: 8, name: 'Club Sandwich', qty: 11, price: 7.50, unitBomCost: 2.65, isCoffee: false }
    ]
  }
};

// Βοηθητική συνάρτηση μετατροπής Ελληνικού αριθμού (π.χ. "1.090,00" ή "785,00") σε float
function parseGreekNumber(raw: string): number {
  if (!raw) return NaN;
  const cleaned = raw.replace(/[€\s]/g, '').trim();
  // Αν έχει και τελεία και κόμμα (π.χ. 1.725,66), η τελεία είναι χιλιάδες και το κόμμα δεκαδικά
  if (cleaned.includes('.') && cleaned.includes(',')) {
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }
  // Αν έχει μόνο κόμμα (π.χ. 785,00), το κόμμα είναι δεκαδικό
  if (cleaned.includes(',')) {
    return parseFloat(cleaned.replace(',', '.'));
  }
  return parseFloat(cleaned);
}

// Εξαγωγή κειμένου από αρχείο PDF μέσω pdf.js CDN (ή fallback αποκωδικοποίησης)
async function extractTextFromPdfBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const win = window as any;
    if (!win.pdfjsLib) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load pdf.js'));
        document.head.appendChild(script);
      });
      win.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const pdf = await win.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      // Ομαδοποίηση ανά γραμμή (Y coordinate) ώστε να διατηρηθούν οι γραμμές της απόδειξης Ζ
      const linesMap: { [y: string]: string[] } = {};
      content.items.forEach((item: any) => {
        const yKey = Math.round(item.transform[5]).toString();
        if (!linesMap[yKey]) linesMap[yKey] = [];
        linesMap[yKey].push(item.str);
      });
      const sortedYs = Object.keys(linesMap).sort((a, b) => Number(b) - Number(a));
      sortedYs.forEach((y) => {
        fullText += linesMap[y].join(' ') + '\n';
      });
    }
    if (fullText.trim().length > 10) return fullText;
  } catch (err) {
    console.warn('PDF.js fallback notice:', err);
  }

  // Fallback: Ανάγνωση UTF-8 από το buffer
  const utf8Text = new TextDecoder('utf-8').decode(arrayBuffer);
  return utf8Text;
}

export default function SalesView() {
  const {
    totalTurnover,
    zPrintedCash, setZPrintedCash,
    posCards, setPosCards,
    efoodSales, setEfoodSales,
    woltSales, setWoltSales,
    boxSales, setBoxSales,
    cashFloat, setCashFloat,
    physicalDrawerCounted, setPhysicalDrawerCounted,
    drawerExpenses, setDrawerExpenses,
    totalDrawerExpenses,
    netCashInDrawerAfterFloat,
    platformCommissions,
    dailyVatBreakdown,
    soldProducts, setSoldProducts,
    safeBoxBalance, setSafeBoxBalance,
    zArchive, setZArchive,
    handleDeductSoldProductsFromStock,
    handleGenerateSampleZPdf,
    notify
  } = useMetric();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State Ημερομηνίας, Βάρδιας & Αποθήκης Στιγμιοτύπων ανά Ημέρα
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-18');
  const [selectedShift, setSelectedShift] = useState<'Πρωινή (07:00-15:00)' | 'Απογευματινή (15:00-23:00)' | 'Ολοήμερο Κλείσιμο'>('Ολοήμερο Κλείσιμο');
  const [cashierName, setCashierName] = useState<string>('Βησσαρίων (Διαχειριστής)');
  const [dailySnapshots, setDailySnapshots] = useState<{ [date: string]: DaySnapshot }>(INITIAL_HISTORICAL_DAYS);
  
  // State Αναφοράς Σαρωμένου Αρχείου Ζ
  const [lastScannedFileInfo, setLastScannedFileInfo] = useState<{
    name: string;
    itemsParsed: number;
    productsCount: number;
    zNumber?: string;
    receiptsCount?: number;
    vat13?: number;
    vat24?: number;
    timestamp: string;
  } | null>(null);

  // Modal Επικόλλησης Κειμένου Απόδειξης Ζ
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedReceiptText, setPastedReceiptText] = useState('');

  // State Μικροεξόδων Συρταριού (CRUD)
  const [expReason, setExpReason] = useState('');
  const [expCategory, setExpCategory] = useState('Αναλώσιμα');
  const [expAmount, setExpAmount] = useState<string>('');
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [editExpReason, setEditExpReason] = useState('');
  const [editExpAmount, setEditExpAmount] = useState<number>(0);

  // State Καταμετρητή Χαρτονομισμάτων
  const [showDenomCalc, setShowDenomCalc] = useState(false);
  const [denoms, setDenoms] = useState<{ [key: string]: number }>({
    '50': 6, '20': 20, '10': 15, '5': 12, '2': 10, '1': 10, '0.5': 10
  });

  // State Επεξεργασίας Πωληθέντων Προϊόντων
  const [editingProdId, setEditingProdId] = useState<number | null>(null);
  const [editProdQty, setEditProdQty] = useState<number>(0);
  const [stockDeductedToday, setStockDeductedToday] = useState(false);

  // Αρχικοποίηση Ιστορικού Πίνακα αν λείπουν οι 17/11 και 16/11
  useEffect(() => {
    const existingDates = new Set((zArchive || []).map((a: any) => a.date));
    const additions: any[] = [];

    Object.values(INITIAL_HISTORICAL_DAYS).forEach((snap) => {
      if (!existingDates.has(snap.date)) {
        const tTurnover = +(snap.zPrintedCash + snap.posCards + snap.efoodSales + snap.woltSales + snap.boxSales).toFixed(2);
        const tExp = snap.drawerExpenses.reduce((acc, x) => acc + x.amount, 0);
        const expDrawer = +(snap.zPrintedCash + snap.cashFloat - tExp).toFixed(2);
        additions.push({
          id: `Z-${snap.date.replace(/-/g, '').slice(4)}`,
          date: snap.date,
          shift: snap.shift,
          cashier: snap.cashier,
          totalTurnover: tTurnover,
          cash: snap.zPrintedCash,
          pos: snap.posCards,
          delivery: +(snap.efoodSales + snap.woltSales + snap.boxSales).toFixed(2),
          expenses: tExp,
          variance: +(snap.physicalDrawerCounted - expDrawer).toFixed(2)
        });
      }
    });

    if (additions.length > 0) {
      setZArchive([...additions, ...(zArchive || [])]);
    }
  }, []);

  // Αποθήκευση τρέχουσας κατάστασης πριν αλλάξουμε ημερομηνία
  const saveCurrentStateToSnapshot = (dateKey: string) => {
    setDailySnapshots((prev) => ({
      ...prev,
      [dateKey]: {
        date: dateKey,
        shift: selectedShift,
        cashier: cashierName,
        zPrintedCash,
        posCards,
        efoodSales,
        woltSales,
        boxSales,
        cashFloat,
        physicalDrawerCounted,
        drawerExpenses: [...drawerExpenses],
        soldProducts: [...soldProducts]
      }
    }));
  };

  // Εναλλαγή Ημερομηνίας & Φόρτωση Δεδομένων Εκείνης της Ημέρας
  const handleSelectDate = (newDate: string) => {
    if (!newDate) return;
    saveCurrentStateToSnapshot(selectedDate);
    setSelectedDate(newDate);

    const targetSnapshot = dailySnapshots[newDate];
    if (targetSnapshot) {
      setSelectedShift(targetSnapshot.shift);
      setCashierName(targetSnapshot.cashier);
      setZPrintedCash(targetSnapshot.zPrintedCash);
      setPosCards(targetSnapshot.posCards);
      setEfoodSales(targetSnapshot.efoodSales);
      setWoltSales(targetSnapshot.woltSales);
      setBoxSales(targetSnapshot.boxSales);
      setCashFloat(targetSnapshot.cashFloat);
      setPhysicalDrawerCounted(targetSnapshot.physicalDrawerCounted);
      setDrawerExpenses(targetSnapshot.drawerExpenses);
      setSoldProducts(targetSnapshot.soldProducts);
      notify(`📅 Φορτώθηκαν τα δεδομένα της ${newDate.split('-').reverse().join('/')}!`);
    } else {
const archived: any = (zArchive || []).find((a: any) => a.date === newDate);
      if (archived) {
        setZPrintedCash(Number(archived.cash || 0));
        setPosCards(Number(archived.pos || 0));
        setEfoodSales(Number(archived.delivery || 0));
        setWoltSales(0);
        setBoxSales(0);
        setPhysicalDrawerCounted(Number(archived.cash || 0) + cashFloat - Number(archived.expenses || 0));
        notify(`📅 Φορτώθηκε το αρχειοθετημένο Ζ της ${newDate.split('-').reverse().join('/')}.`);
      } else {
        setZPrintedCash(0);
        setPosCards(0);
        setEfoodSales(0);
        setWoltSales(0);
        setBoxSales(0);
        setPhysicalDrawerCounted(cashFloat);
        setDrawerExpenses([]);
        notify(`📅 Νέο φύλλο ταμείου για ${newDate.split('-').reverse().join('/')}.`);
      }
    }
  };

  const handleShiftDay = (offsetDays: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offsetDays);
    const nextDateStr = current.toISOString().split('T')[0];
    handleSelectDate(nextDateStr);
  };

  // ΚΕΝΤΡΙΚΟΣ ΚΙΝΗΤΗΡΑΣ ΑΝΑΛΥΣΗΣ ΚΕΙΜΕΝΟΥ ΔΕΛΤΙΟΥ Ζ (Υποστηρίζει Απόδειξη ΑΑΔΕ PDF & CSV/TXT)
  const parseZReceiptText = (rawText: string, sourceName: string) => {
    let parsedFieldsCount = 0;
    const lines = rawText.split(/\r?\n/);

    let foundDate: string | null = null;
    let foundZNumber: string | undefined;
    let foundReceiptsCount: number | undefined;
    let foundVat13: number | undefined;
    let foundVat24: number | undefined;

    let foundCash: number | null = null;
    let foundPos: number | null = null;
    let foundEfood: number | null = null;
    let foundWolt: number | null = null;
    let foundBox: number | null = null;
    let foundFloat: number | null = null;
    let foundCounted: number | null = null;

    const parsedExpenses: any[] = [];
    const extractedReceiptProducts: { id: number; name: string; qty: number; price: number; unitBomCost: number; isCoffee: boolean }[] = [];

    // Εκτίμηση κόστους BOM ανά κατηγορία προϊόντος όταν διαβάζεται από απόδειξη Ζ
    const estimateBomCost = (name: string, price: number): { bom: number; isCoffee: boolean } => {
      const upper = name.toUpperCase();
      if (upper.includes('ESPRESSO') || upper.includes('CAPPUCCINO') || upper.includes('COFFEE') || upper.includes('ΚΑΦΕ')) {
        return { bom: +(price * 0.08).toFixed(2), isCoffee: true };
      }
      if (upper.includes('SANDWICH') || upper.includes('BRIOCHE') || upper.includes('ΤΟΣΤ') || upper.includes('ΚΡΟΥΑΣΑΝ')) {
        return { bom: +(price * 0.34).toFixed(2), isCoffee: false };
      }
      if (upper.includes('ΧΥΜΟΣ') || upper.includes('ΝΕΡΟ')) {
        return { bom: +(price * 0.25).toFixed(2), isCoffee: false };
      }
      return { bom: +(price * 0.22).toFixed(2), isCoffee: false };
    };

    lines.forEach((line, idx) => {
      const clean = line.trim();
      if (!clean || clean.startsWith('#')) return;
      const upper = clean.toUpperCase();

      // 1. Ανίχνευση Ημερομηνίας Ελληνικής Απόδειξης (π.χ. "ΗΜ/ΝΙΑ: 14/11/2026" ή "DATE,2026-11-14")
      const grDateMatch = clean.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (grDateMatch && (upper.includes('ΗΜ/ΝΙΑ') || upper.includes('ΗΜΕΡΟΜΗΝΙΑ') || upper.includes('DATE'))) {
        foundDate = `${grDateMatch[3]}-${grDateMatch[2]}-${grDateMatch[1]}`;
        parsedFieldsCount++;
      }
      const isoDateMatch = clean.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (isoDateMatch && (upper.includes('DATE') || upper.includes('ΗΜ'))) {
        foundDate = `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
        parsedFieldsCount++;
      }

      // 2. Ανίχνευση Αρ. Δελτίου Ζ (π.χ. "ΑΡ. ΔΕΛΤΙΟΥ Ζ: 0215")
      const zNumMatch = clean.match(/ΔΕΛΤΙΟΥ\s*Ζ\s*[:\-]?\s*(\d+)/i);
      if (zNumMatch) {
        foundZNumber = zNumMatch[1];
        parsedFieldsCount++;
      }

      // 3. Ανίχνευση Πλήθους Αποδείξεων (π.χ. "ΠΛΗΘΟΣ ΑΠΟΔΕΙΞΕΩΝ: 412")
      const recMatch = clean.match(/ΑΠΟΔΕΙΞΕΩΝ\s*[:\-]?\s*(\d+)/i);
      if (recMatch) {
        foundReceiptsCount = parseInt(recMatch[1], 10);
        parsedFieldsCount++;
      }

      // 4. Ανίχνευση ΦΠΑ 13% & 24% (π.χ. "ΦΠΑ 13%: 224,34 €" και "ΦΠΑ 24%: 80,32 €")
      if (upper.startsWith('ΦΠΑ 13%')) {
        const m = clean.match(/[:\-]\s*([\d.,]+)/);
        if (m) { foundVat13 = parseGreekNumber(m[1]); parsedFieldsCount++; }
      }
      if (upper.startsWith('ΦΠΑ 24%')) {
        const m = clean.match(/[:\-]\s*([\d.,]+)/);
        if (m) { foundVat24 = parseGreekNumber(m[1]); parsedFieldsCount++; }
      }

      // 5. Ανίχνευση Γραμμής Προϊόντος Ελληνικής Απόδειξης Ζ:
      // π.χ. "FREDDO ESPRESSO: 190 x 3,50 = 665,00" ή "CLUB SANDWICH: 48 x 7,50 = 360,00"
      const receiptProdMatch = clean.match(/^([A-Za-zΑ-Ωα-ωΆ-Ώά-ώ0-9\s\-./]+?)\s*:\s*(\d+)\s*[xXχΧ*]\s*([\d.,]+)\s*=\s*([\d.,]+)/);
      if (receiptProdMatch) {
        const rawProdName = receiptProdMatch[1].trim();
        const qty = parseInt(receiptProdMatch[2], 10);
        const unitPrice = parseGreekNumber(receiptProdMatch[3]);
        if (rawProdName && !isNaN(qty) && !isNaN(unitPrice)) {
          const { bom, isCoffee } = estimateBomCost(rawProdName, unitPrice);
          extractedReceiptProducts.push({
            id: Date.now() + idx,
            name: rawProdName,
            qty,
            price: unitPrice,
            unitBomCost: bom,
            isCoffee
          });
          parsedFieldsCount++;
          return;
        }
      }

      // 6. Ανίχνευση Τρόπων Πληρωμής Απόδειξης Ζ (π.χ. "ΜΕΤΡΗΤΑ Ζ: 785,00 €", "ΚΑΡΤΕΣ POS: 1.090,00 €", "EFOOD: 260,00 €", "WOLT: 230,00 €")
      const colonParts = clean.split(':');
      if (colonParts.length >= 2) {
        const leftKey = colonParts[0].trim().toUpperCase();
        const rightVal = parseGreekNumber(colonParts.slice(1).join(':'));

        if (!isNaN(rightVal)) {
          if (leftKey.includes('ΜΕΤΡΗΤΑ') || leftKey.includes('Z_CASH')) {
            foundCash = rightVal;
            parsedFieldsCount++;
            return;
          }
          if (leftKey.includes('ΚΑΡΤΕΣ') || leftKey.includes('POS')) {
            foundPos = rightVal;
            parsedFieldsCount++;
            return;
          }
          if (leftKey.includes('EFOOD') || leftKey.includes('E-FOOD')) {
            foundEfood = rightVal;
            parsedFieldsCount++;
            return;
          }
          if (leftKey.includes('WOLT')) {
            foundWolt = rightVal;
            parsedFieldsCount++;
            return;
          }
          if (leftKey.includes('BOX')) {
            foundBox = rightVal;
            parsedFieldsCount++;
            return;
          }
        }
      }

      // 7. Υποστήριξη CSV Μορφής (KEY,VALUE)
      const csvParts = clean.split(/[;,|\t]/).map((s) => s.trim());
      if (csvParts.length >= 2) {
        const key = csvParts[0].toUpperCase();
        const numVal = parseGreekNumber(csvParts[1]);

        if ((key.includes('Z_CASH') || key.includes('ΜΕΤΡΗΤΑ')) && !isNaN(numVal)) {
          foundCash = numVal; parsedFieldsCount++;
        } else if ((key.includes('POS_CARDS') || key.includes('ΚΑΡΤΕΣ')) && !isNaN(numVal)) {
          foundPos = numVal; parsedFieldsCount++;
        } else if (key.includes('EFOOD') && !isNaN(numVal)) {
          foundEfood = numVal; parsedFieldsCount++;
        } else if (key.includes('WOLT') && !isNaN(numVal)) {
          foundWolt = numVal; parsedFieldsCount++;
        } else if (key.includes('BOX') && !isNaN(numVal)) {
          foundBox = numVal; parsedFieldsCount++;
        } else if (key.includes('FLOAT') && !isNaN(numVal)) {
          foundFloat = numVal; parsedFieldsCount++;
        } else if ((key.includes('PHYSICAL') || key.includes('COUNTED')) && !isNaN(numVal)) {
          foundCounted = numVal; parsedFieldsCount++;
        } else if (key === 'EXPENSE' || key === 'ΕΞΟΔΟ') {
          const reason = csvParts[1] || 'Έξοδο Αρχείου Ζ';
          const category = csvParts[2] || 'Αναλώσιμα';
          const amount = parseGreekNumber(csvParts[3] || '0');
          const time = csvParts[4] || '12:00';
          if (!isNaN(amount) && amount > 0) {
            parsedExpenses.push({ id: Date.now() + idx, reason, category, amount, time });
            parsedFieldsCount++;
          }
        } else if (key === 'PRODUCT' || key === 'ΠΡΟΪΟΝ') {
          const prodName = csvParts[1] || '';
          const qty = parseInt(csvParts[2] || '0', 10);
          const price = parseGreekNumber(csvParts[3] || '3.50');
          const bom = parseGreekNumber(csvParts[4] || '0.25');
          if (prodName && !isNaN(qty)) {
            extractedReceiptProducts.push({
              id: Date.now() + idx,
              name: prodName,
              qty,
              price: !isNaN(price) ? price : 3.50,
              unitBomCost: !isNaN(bom) ? bom : 0.25,
              isCoffee: prodName.toUpperCase().includes('ESPRESSO') || prodName.toUpperCase().includes('CAPPUCCINO')
            });
            parsedFieldsCount++;
          }
        }
      }
    });

    // Ενημέρωση όλων των States με τα αληθινά δεδομένα του αρχείου
    if (foundDate) setSelectedDate(foundDate);
    if (foundCash !== null) setZPrintedCash(foundCash);
    if (foundPos !== null) setPosCards(foundPos);
    if (foundEfood !== null) setEfoodSales(foundEfood);
    if (foundWolt !== null) setWoltSales(foundWolt);
    if (foundBox !== null) setBoxSales(foundBox);
    else if (foundCash !== null || foundPos !== null) setBoxSales(0); // Μηδενισμός Box αν δεν υπάρχει στην απόδειξη

    if (foundFloat !== null) setCashFloat(foundFloat);
    if (parsedExpenses.length > 0) setDrawerExpenses(parsedExpenses);
    if (extractedReceiptProducts.length > 0) {
      setSoldProducts(extractedReceiptProducts);
    }

    const activeCash = foundCash !== null ? foundCash : zPrintedCash;
    const activeFloat = foundFloat !== null ? foundFloat : cashFloat;
    const activeExp = parsedExpenses.length > 0
      ? parsedExpenses.reduce((a, b) => a + b.amount, 0)
      : totalDrawerExpenses;

    if (foundCounted !== null) {
      setPhysicalDrawerCounted(foundCounted);
    } else if (foundCash !== null) {
      setPhysicalDrawerCounted(+(activeCash + activeFloat - activeExp).toFixed(2));
    }

    // Αποθήκευση και στο snapshot της ημερομηνίας του PDF (π.χ. 14/11/2026)
    const targetDateKey = foundDate || selectedDate;
    setDailySnapshots((prev) => ({
      ...prev,
      [targetDateKey]: {
        date: targetDateKey,
        shift: selectedShift,
        cashier: cashierName,
        zPrintedCash: foundCash !== null ? foundCash : zPrintedCash,
        posCards: foundPos !== null ? foundPos : posCards,
        efoodSales: foundEfood !== null ? foundEfood : efoodSales,
        woltSales: foundWolt !== null ? foundWolt : woltSales,
        boxSales: foundBox !== null ? foundBox : 0,
        cashFloat: activeFloat,
        physicalDrawerCounted: foundCounted !== null ? foundCounted : +(activeCash + activeFloat - activeExp).toFixed(2),
        drawerExpenses: parsedExpenses.length > 0 ? parsedExpenses : drawerExpenses,
        soldProducts: extractedReceiptProducts.length > 0 ? extractedReceiptProducts : soldProducts
      }
    }));

    setLastScannedFileInfo({
      name: sourceName,
      itemsParsed: parsedFieldsCount,
      productsCount: extractedReceiptProducts.length,
      zNumber: foundZNumber,
      receiptsCount: foundReceiptsCount,
      vat13: foundVat13,
      vat24: foundVat24,
      timestamp: new Date().toLocaleTimeString('el-GR')
    });

    if (parsedFieldsCount > 0) {
      notify(`✔ Επιτυχής ανάγνωση "${sourceName}"! Ενημερώθηκαν ${parsedFieldsCount} πεδία (${extractedReceiptProducts.length} προϊόντα).`);
    } else {
      notify(`⚠️ Δεν εντοπίστηκε αναγνωρίσιμο κείμενο στο "${sourceName}". Δοκιμάστε το κουμπί "Επικόλληση Κειμένου Ζ".`);
    }
  };

  // Χειριστής Ανεβάσματος Αρχείου (.pdf, .csv, .txt, .json)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        notify(`⏳ Γίνεται εξαγωγή κειμένου από το PDF "${file.name}"...`);
        const arrayBuffer = await file.arrayBuffer();
        const extractedText = await extractTextFromPdfBuffer(arrayBuffer);
        parseZReceiptText(extractedText, file.name);
      } else {
        const text = await file.text();
        parseZReceiptText(text, file.name);
      }
    } catch (err) {
      console.error('File parsing error:', err);
      notify('⚠️ Σφάλμα κατά την ανάγνωση του αρχείου.');
    }

    e.target.value = '';
  };

  // Λήψη Δοκιμαστικού Αρχείου Ζ στην ακριβή μορφή της Απόδειξης ΑΑΔΕ (όπως το document.pdf)
  const handleDownloadSampleZFile = () => {
    const receiptText = [
      'BLYSSCAFE ΕΣΤΙΑΣΗ',
      'ΑΦΜ: 099887766 - ΔΟΥ: ΚΑΛΛΙΘΕΑΣ',
      'ΗΜ/ΝΙΑ: 14/11/2026 - ΩΡΑ: 23:45',
      '-----------------------------------------',
      'ΔΕΛΤΙΟ ΗΜΕΡΗΣΙΑΣ ΚΙΝΗΣΗΣ (Ζ)',
      'ΑΡ. ΔΕΛΤΙΟΥ Ζ: 0215',
      '-----------------------------------------',
      'ΑΝΑΛΥΣΗ ΠΩΛΗΣΕΩΝ ΑΝΑ ΕΙΔΟΣ:',
      'FREDDO ESPRESSO: 190 x 3,50 = 665,00',
      'CAPPUCCINO DOUBLE: 130 x 3,80 = 494,00',
      'FREDDO CAPPUCCINO: 105 x 3,80 = 399,00',
      'CLUB SANDWICH: 48 x 7,50 = 360,00',
      'BRIOCHE ΓΑΛΟΠΟΥΛΑ: 60 x 3,20 = 192,00',
      'ΦΥΣΙΚΟΣ ΧΥΜΟΣ: 40 x 4,50 = 180,00',
      'ΝΕΡΟ 500ML: 150 x 0,50 = 75,00',
      '-----------------------------------------',
      'ΠΛΗΘΟΣ ΑΠΟΔΕΙΞΕΩΝ: 412',
      'ΚΑΘΑΡΗ ΑΞΙΑ ΦΠΑ 13%: 1.725,66 €',
      'ΦΠΑ 13%: 224,34 €',
      'ΚΑΘΑΡΗ ΑΞΙΑ ΦΠΑ 24%: 334,68 €',
      'ΦΠΑ 24%: 80,32 €',
      '-----------------------------------------',
      'ΜΕΤΡΗΤΑ Ζ: 785,00 €',
      'ΚΑΡΤΕΣ POS: 1.090,00 €',
      'EFOOD: 260,00 €',
      'WOLT: 230,00 €',
      '-----------------------------------------',
      'ΣΥΝΟΛΟ ΗΜΕΡΑΣ Ζ: 2.365,00 €',
      'ΦΗΜΑΣ: 9988776600112233',
      'ΝΟΜΙΜΗ ΑΠΟΔΕΙΞΗ ΑΑΔΕ'
    ].join('\n');

    const blob = new Blob(['\uFEFF' + receiptText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Deltio_Z_0215_blysscafe.txt`;
    a.click();
    URL.revokeObjectURL(url);
    notify('📥 Κατέβηκε το πρότυπο Δελτίο Ζ (Deltio_Z_0215_blysscafe.txt)!');
  };

  // Υπολογισμός αναμενόμενων μετρητών στο συρτάρι & διαφοράς (Variance)
  const expectedCashInDrawer = +(zPrintedCash + cashFloat - totalDrawerExpenses).toFixed(2);
  const cashVariance = +(physicalDrawerCounted - expectedCashInDrawer).toFixed(2);

  // Εφαρμογή Καταμετρητή Χαρτονομισμάτων
  const denomTotal = Object.entries(denoms).reduce((acc, [val, count]) => acc + (parseFloat(val) * (count || 0)), 0);
  
  const handleApplyDenominations = () => {
    setPhysicalDrawerCounted(+denomTotal.toFixed(2));
    setShowDenomCalc(false);
    notify(`✔ Η φυσική καταμέτρηση ενημερώθηκε στα ${denomTotal.toFixed(2)} €`);
  };

  // CRUD Μικροεξόδων Ταμείου
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(expAmount);
    if (!expReason.trim() || isNaN(numAmount) || numAmount <= 0) {
      notify('⚠️ Συμπληρώστε αιτιολογία και έγκυρο ποσό εξόδου.');
      return;
    }
    const newExp = {
      id: Date.now(),
      reason: expReason.trim(),
      category: expCategory,
      amount: +numAmount.toFixed(2),
      time: new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
    };
    setDrawerExpenses([newExp, ...drawerExpenses]);
    setExpReason('');
    setExpAmount('');
    notify(`✔ Προστέθηκε έξοδο ταμείου: ${newExp.reason} (${newExp.amount.toFixed(2)} €)`);
  };

  const handleStartEditExp = (exp: any) => {
    setEditingExpId(exp.id);
    setEditExpReason(exp.reason);
    setEditExpAmount(exp.amount);
  };

  const handleSaveEditExp = (id: number) => {
    setDrawerExpenses(drawerExpenses.map(x => x.id === id ? { ...x, reason: editExpReason, amount: +Number(editExpAmount).toFixed(2) } : x));
    setEditingExpId(null);
    notify('✔ Το έξοδο ταμείου ενημερώθηκε.');
  };

  const handleDeleteExpense = (id: number) => {
    setDrawerExpenses(drawerExpenses.filter(x => x.id !== id));
    notify('🗑️ Το έξοδο αφαιρέθηκε από το συρτάρι.');
  };

  // Safe Drop στο Χρηματοκιβώτιο
  const handleSafeDrop = () => {
    if (netCashInDrawerAfterFloat <= 0) {
      notify('⚠️ Δεν υπάρχουν διαθέσιμα καθαρά μετρητά πέραν του Float για μεταφορά.');
      return;
    }
    const amountToDrop = netCashInDrawerAfterFloat;
    setSafeBoxBalance((prev: number) => +(prev + amountToDrop).toFixed(2));
    setPhysicalDrawerCounted(cashFloat);
    notify(`🔒 Safe Drop: ${amountToDrop.toFixed(2)} € μεταφέρθηκαν στο Χρηματοκιβώτιο!`);
  };

  // Επεξεργασία Πωληθέντων Προϊόντων
  const handleSaveProdQty = (id: number) => {
    setSoldProducts(soldProducts.map(p => p.id === id ? { ...p, qty: Math.max(0, editProdQty) } : p));
    setEditingProdId(null);
    notify('✔ Η ποσότητα πωλήσεων ενημερώθηκε.');
  };

  const handleTriggerBomDeduction = () => {
    handleDeductSoldProductsFromStock();
    setStockDeductedToday(true);
  };

  // Οριστικοποίηση / Ενημέρωση & Αποθήκευση στο Ιστορικό Ζ
  const handleFinalizeZ = () => {
    saveCurrentStateToSnapshot(selectedDate);

    const existingIdx = (zArchive || []).findIndex((a: any) => a.date === selectedDate);
    const updatedEntry: any = {
      id: lastScannedFileInfo?.zNumber ? `Z-${lastScannedFileInfo.zNumber}` : (existingIdx > -1 ? zArchive[existingIdx].id : `Z-${selectedDate.replace(/-/g, '').slice(4)}`),
      date: selectedDate,
      shift: selectedShift,
      cashier: cashierName,
      totalTurnover,
      cash: zPrintedCash,
      pos: posCards,
      delivery: +(efoodSales + woltSales + boxSales).toFixed(2),
      expenses: totalDrawerExpenses,
      variance: cashVariance,
      netVat: dailyVatBreakdown?.vatAmount24 || +(totalTurnover - totalTurnover / 1.24).toFixed(2)
    };

    if (existingIdx > -1) {
      const copy = [...zArchive];
      copy[existingIdx] = updatedEntry;
      setZArchive(copy);
      notify(`✔ Το Δελτίο ${updatedEntry.id} (${selectedDate.split('-').reverse().join('/')}) ενημερώθηκε επιτυχώς!`);
    } else {
      setZArchive([updatedEntry, ...(zArchive || [])]);
      notify(`✔ Το Δελτίο ${updatedEntry.id} (${selectedDate.split('-').reverse().join('/')}) καταχωρήθηκε στο αρχείο!`);
    }
  };

  const handleDeleteArchiveZ = (id: string) => {
    setZArchive((zArchive || []).filter((item: any) => item.id !== id));
    notify('🗑️ Η εγγραφή αφαιρέθηκε από το ιστορικό Ζ.');
  };

  const totalSoldItemsCount = soldProducts.reduce((acc, p) => acc + p.qty, 0);
  const totalSoldRevenue = soldProducts.reduce((acc, p) => acc + (p.qty * p.price), 0);
  const totalSoldBomCost = soldProducts.reduce((acc, p) => acc + (p.qty * p.unitBomCost), 0);
  const isEditingExistingDay = Boolean(dailySnapshots[selectedDate] || (zArchive || []).some((a: any) => a.date === selectedDate));

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Κρυφό File Input που δέχεται PDF, CSV, TXT, JSON */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,.txt,.json,.xml"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header & Real File Scanner Controls */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">
                Ταμείο & Κλείσιμο Ζ (Daily Z & Cash Control)
              </h2>
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${
                selectedDate === '2026-11-18'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              }`}>
                {selectedDate === '2026-11-18' ? 'Σημερινή Βάρδια (18/11)' : `Ημερομηνία Ζ: ${selectedDate.split('-').reverse().join('/')}`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ανεβάστε απευθείας το PDF του Δελτίου Ζ (π.χ. document.pdf) ή CSV/TXT για αυτόματη εξαγωγή προϊόντων, ΦΠΑ και τρόπων πληρωμής.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadSampleZFile}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="h-4 w-4 text-blue-400" />
              <span>Λήψη Προτύπου Ζ (.txt)</span>
            </button>

            <button
              onClick={() => setShowPasteModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ClipboardPaste className="h-4 w-4 text-purple-400" />
              <span>Επικόλληση Κειμένου Ζ</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition"
            >
              <Upload className="h-4 w-4" />
              <span>Εισαγωγή Αρχείου Ζ (PDF / CSV / TXT)</span>
            </button>

            <button
              onClick={handleFinalizeZ}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isEditingExistingDay ? 'Ενημέρωση & Αποθήκευση Ζ' : 'Οριστικοποίηση & Αποθήκευση Ζ'}</span>
            </button>
          </div>
        </div>

        {/* Αναλυτικό Banner Επιβεβαίωσης Σάρωσης PDF / Αρχείου */}
        {lastScannedFileInfo && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-purple-200 font-bold">
                  Αναγνώστηκε: <span className="text-white font-mono underline">{lastScannedFileInfo.name}</span>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ✔ {lastScannedFileInfo.itemsParsed} πεδία & {lastScannedFileInfo.productsCount} είδη POS ενημερώθηκαν
              </span>
              {lastScannedFileInfo.zNumber && (
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-700">
                  Αρ. Ζ: {lastScannedFileInfo.zNumber}
                </span>
              )}
              {lastScannedFileInfo.receiptsCount && (
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-700">
                  Αποδείξεις: {lastScannedFileInfo.receiptsCount}
                </span>
              )}
              {(lastScannedFileInfo.vat13 !== undefined || lastScannedFileInfo.vat24 !== undefined) && (
                <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-mono border border-blue-500/30">
                  ΦΠΑ 13%: {(lastScannedFileInfo.vat13 || 0).toFixed(2)}€ | ΦΠΑ 24%: {(lastScannedFileInfo.vat24 || 0).toFixed(2)}€
                </span>
              )}
            </div>
            <button
              onClick={() => setLastScannedFileInfo(null)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              Κλείσιμο
            </button>
          </div>
        )}

        {/* Shift & Interactive Date Navigation Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-6 flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400 font-bold">Ημερομηνία:</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleShiftDay(-1)}
                title="Προηγούμενη Ημέρα"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleSelectDate(e.target.value)}
                className="bg-slate-900 text-white font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-700 focus:border-emerald-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleShiftDay(1)}
                title="Επόμενη Ημέρα"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSelectDate('2026-11-16')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                  selectedDate === '2026-11-16'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                16/11
              </button>
              <button
                type="button"
                onClick={() => handleSelectDate('2026-11-17')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                  selectedDate === '2026-11-17'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Χθες (17/11)
              </button>
              <button
                type="button"
                onClick={() => handleSelectDate('2026-11-18')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                  selectedDate === '2026-11-18'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Σήμερα (18/11)
              </button>
            </div>
          </div>

          <div className="md:col-span-3 flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800">
            <Receipt className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-slate-400">Βάρδια:</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value as any)}
              className="bg-slate-900 text-white font-bold ml-auto rounded px-2 py-1 border border-slate-800 focus:outline-none"
            >
              <option value="Ολοήμερο Κλείσιμο">Ολοήμερο Κλείσιμο</option>
              <option value="Πρωινή (07:00-15:00)">Πρωινή (07:00-15:00)</option>
              <option value="Απογευματινή (15:00-23:00)">Απογευματινή (15:00-23:00)</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800">
            <User className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-slate-400">Υπεύθυνος:</span>
            <input
              type="text"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              className="bg-transparent text-white font-bold text-right ml-auto focus:outline-none w-40"
            />
          </div>
        </div>

        {/* 4 Primary Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Συνολικός Τζίρος ({selectedDate.split('-').reverse().join('/')})</span>
            <p className="text-2xl font-black text-emerald-400">{totalTurnover.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              {lastScannedFileInfo?.vat13 !== undefined
                ? `ΦΠΑ 13%: ${lastScannedFileInfo.vat13.toFixed(2)} € • ΦΠΑ 24%: ${(lastScannedFileInfo.vat24 || 0).toFixed(2)} €`
                : `Καθαρά προ ΦΠΑ: ${(totalTurnover / 1.24).toFixed(2)} € • ΦΠΑ: {(totalTurnover - totalTurnover / 1.24).toFixed(2)} €`}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Καθαρή Είσπραξη Τράπεζας (POS + Web)</span>
            <p className="text-2xl font-black text-white">{platformCommissions.netBankPayout.toFixed(2)} €</p>
            <span className="text-[10px] text-purple-400 block">
              Προμήθειες Delivery: -{(platformCommissions.efoodCommission + platformCommissions.woltCommission).toFixed(2)} €
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Καθαρά Μετρητά στο Συρτάρι</span>
            <p className="text-2xl font-black text-blue-400">{netCashInDrawerAfterFloat.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              Διαθέσιμα για Safe Drop (εκτός Float {cashFloat}€)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Συνολικά Έξοδα Ταμείου</span>
            <p className="text-2xl font-black text-amber-400">{totalDrawerExpenses.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              {drawerExpenses.length} παραστατικά πληρωμών μετρητών
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid: Z Inputs & Cash Drawer Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Z Inputs & Platform Commissions Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-400" />
              <span>1. Καταχώρηση Δεδομένων Δελτίου Ζ & Delivery</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Ημ/νία: {selectedDate.split('-').reverse().join('/')}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-white font-bold block">Μετρητά Δελτίου Ζ (Z Cash)</span>
                <span className="text-[10px] text-slate-500">Εισπράξεις μετρητών ταμειακής</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  value={zPrintedCash}
                  onChange={(e) => setZPrintedCash(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-right"
                />
                <span className="text-slate-400 font-bold">€</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-white font-bold block">Πιστωτικές / Χρεωστικές Κάρτες (POS)</span>
                <span className="text-[10px] text-slate-500">Σύνολο πακέτου τερματικών POS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  value={posCards}
                  onChange={(e) => setPosCards(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-right"
                />
                <span className="text-slate-400 font-bold">€</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-white font-bold block">E-food Sales (Gross)</span>
                <span className="text-[10px] text-slate-500">Προμήθεια 14%: -{platformCommissions.efoodCommission.toFixed(2)} €</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  value={efoodSales}
                  onChange={(e) => setEfoodSales(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-right"
                />
                <span className="text-slate-400 font-bold">€</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-white font-bold block">Wolt Sales (Gross)</span>
                <span className="text-[10px] text-slate-500">Προμήθεια 15%: -{platformCommissions.woltCommission.toFixed(2)} €</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  value={woltSales}
                  onChange={(e) => setWoltSales(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-right"
                />
                <span className="text-slate-400 font-bold">€</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-white font-bold block">Box / Ιδιόκτητο Delivery</span>
                <span className="text-[10px] text-slate-500">Λοιπές παραγγελίες</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.5"
                  value={boxSales}
                  onChange={(e) => setBoxSales(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-right"
                />
                <span className="text-slate-400 font-bold">€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Drawer Counting, Denomination Calc & Safe Drop */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-400" />
              <span>2. Καταμέτρηση Φυσικού Ταμείου (Cash Drawer)</span>
            </h3>
            <button
              onClick={() => setShowDenomCalc(!showDenomCalc)}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1 transition"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>{showDenomCalc ? 'Κλείσιμο Καταμετρητή' : 'Μετρητής Χαρτονομισμάτων'}</span>
            </button>
          </div>

          {showDenomCalc && (
            <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/40 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400">Αναλυτική Καταμέτρηση Χαρτονομισμάτων & Κερμάτων</span>
                <span className="text-xs font-mono font-bold text-white">Σύνολο: {denomTotal.toFixed(2)} €</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['50', '20', '10', '5', '2', '1', '0.5'].map((val) => (
                  <div key={val} className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-400">{val}€ x</span>
                    <input
                      type="number"
                      min="0"
                      value={denoms[val] || 0}
                      onChange={(e) => setDenoms({ ...denoms, [val]: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-white"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleApplyDenominations}
                className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold text-xs transition"
              >
                Μεταφορά Ποσού ({denomTotal.toFixed(2)} €) στη Φυσική Μέτρηση
              </button>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-white font-bold block">Αρχική Ρευστότητα Βάρδιας (Cash Float)</span>
                <span className="text-[10px] text-slate-500">Ψιλά εκκίνησης συρταριού</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={cashFloat}
                  onChange={(e) => setCashFloat(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-right"
                />
                <span className="text-slate-400 font-bold">€</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <span className="text-white font-bold block">Φυσική Μέτρηση Συρταριού (Counted)</span>
                <span className="text-[10px] text-slate-500">Αναμενόμενα: {expectedCashInDrawer.toFixed(2)} €</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={physicalDrawerCounted}
                  onChange={(e) => setPhysicalDrawerCounted(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-900 border border-blue-500/50 text-blue-400 font-mono font-bold text-right"
                />
                <span className="text-slate-400 font-bold">€</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              cashVariance === 0 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : cashVariance > 0 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <div>
                <span className="font-extrabold block text-xs">
                  Διαφορά Ταμείου (Cash Variance):
                </span>
                <span className="text-[10px] opacity-80">
                  {cashVariance === 0 ? 'Ακριβής συμφωνία ταμείου!' : cashVariance > 0 ? 'Πλεόνασμα συρταριού' : 'Έλλειμμα συρταριού'}
                </span>
              </div>
              <span className="text-lg font-mono font-black">
                {cashVariance > 0 ? `+${cashVariance.toFixed(2)}` : cashVariance.toFixed(2)} €
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSafeDrop}
                className="w-full py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-extrabold text-xs flex items-center justify-center gap-2 transition"
              >
                <Vault className="h-4 w-4 text-amber-400" />
                <span>Safe Drop ({netCashInDrawerAfterFloat.toFixed(2)} €) στο Χρηματοκιβώτιο (Υπόλοιπο Safe: {safeBoxBalance.toFixed(2)} €)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Grid: Drawer Petty Expenses (CRUD) & Sold Products BOM Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Drawer Expenses CRUD */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white">3. Μικροέξοδα Συρταριού ({selectedDate.split('-').reverse().join('/')})</h3>
              <p className="text-[11px] text-slate-400">Πληρωμές μετρητών από το συρτάρι (πάγος, ψιλά, αναλώσιμα)</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Σύνολο: {totalDrawerExpenses.toFixed(2)} €
            </span>
          </div>

          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            <input
              type="text"
              placeholder="Αιτιολογία (π.χ. Πάγος 3 σακούλες)"
              value={expReason}
              onChange={(e) => setExpReason(e.target.value)}
              className="sm:col-span-5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              className="sm:col-span-3 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
            >
              <option value="Αναλώσιμα">Αναλώσιμα</option>
              <option value="Πρώτες Ύλες">Πρώτες Ύλες</option>
              <option value="Ρευστότητα">Ρευστότητα</option>
              <option value="Λοιπά">Λοιπά</option>
            </select>
            <input
              type="number"
              step="0.1"
              placeholder="Ποσό €"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-right"
            />
            <button
              type="submit"
              className="sm:col-span-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold flex items-center justify-center gap-1 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Προσθήκη</span>
            </button>
          </form>

          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Ώρα</th>
                  <th className="p-3">Αιτιολογία</th>
                  <th className="p-3">Κατηγορία</th>
                  <th className="p-3 text-right">Ποσό</th>
                  <th className="p-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {drawerExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      Δεν έχουν καταχωρηθεί μικροέξοδα για τις {selectedDate.split('-').reverse().join('/')}.
                    </td>
                  </tr>
                ) : (
                  drawerExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-mono text-slate-500">{exp.time}</td>
                      <td className="p-3 font-bold text-white">
                        {editingExpId === exp.id ? (
                          <input
                            type="text"
                            value={editExpReason}
                            onChange={(e) => setEditExpReason(e.target.value)}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white w-full"
                          />
                        ) : (
                          exp.reason
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{exp.category}</td>
                      <td className="p-3 font-mono font-bold text-amber-400 text-right">
                        {editingExpId === exp.id ? (
                          <input
                            type="number"
                            step="0.1"
                            value={editExpAmount}
                            onChange={(e) => setEditExpAmount(parseFloat(e.target.value) || 0)}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-400 w-20 text-right"
                          />
                        ) : (
                          `${exp.amount.toFixed(2)} €`
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {editingExpId === exp.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEditExp(exp.id)}
                              className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingExpId(null)}
                              className="p-1.5 rounded bg-slate-800 text-slate-400"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEditExp(exp)}
                              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sold Products POS Mix & Stock Deduction */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white">4. Πωληθέντα Είδη POS & Απομείωση Stock (BOM)</h3>
              <p className="text-[11px] text-slate-400">
                Σύνολο: <span className="text-white font-bold">{totalSoldItemsCount} τεμ.</span> • Αξία Ειδών: <span className="text-emerald-400 font-bold">{totalSoldRevenue.toFixed(2)} €</span> • Κόστος BOM: <span className="text-amber-400 font-bold">{totalSoldBomCost.toFixed(2)} €</span>
              </p>
            </div>
            <button
              onClick={handleTriggerBomDeduction}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition ${
                stockDeductedToday
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow'
              }`}
            >
              <PackageCheck className="h-4 w-4" />
              <span>{stockDeductedToday ? '✔ Το Stock Ενημερώθηκε' : 'Αφαίρεση Πωλήσεων από Αποθήκη'}</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs max-h-64 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px] sticky top-0">
                <tr>
                  <th className="p-2.5">Προϊόν</th>
                  <th className="p-2.5 text-right">Τεμάχια</th>
                  <th className="p-2.5 text-right">Τιμή</th>
                  <th className="p-2.5 text-right">Σύνολο €</th>
                  <th className="p-2.5 text-right">Κόστος BOM</th>
                  <th className="p-2.5 text-right">Έλεγχος</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {soldProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-bold text-white">{p.name}</td>
                    <td className="p-2.5 font-mono text-right text-emerald-400 font-bold">
                      {editingProdId === p.id ? (
                        <input
                          type="number"
                          value={editProdQty}
                          onChange={(e) => setEditProdQty(parseInt(e.target.value) || 0)}
                          className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-right text-white"
                        />
                      ) : (
                        p.qty
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-right text-slate-300">{p.price.toFixed(2)} €</td>
                    <td className="p-2.5 font-mono text-right text-white font-bold">{(p.qty * p.price).toFixed(2)} €</td>
                    <td className="p-2.5 font-mono text-right text-amber-400">{(p.qty * p.unitBomCost).toFixed(2)} €</td>
                    <td className="p-2.5 text-right">
                      {editingProdId === p.id ? (
                        <button
                          onClick={() => handleSaveProdQty(p.id)}
                          className="p-1 rounded bg-emerald-500/20 text-emerald-400"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => { setEditingProdId(p.id); setEditProdQty(p.qty); }}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Z-Report Archive History Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Archive className="h-4 w-4 text-emerald-400" />
              <span>5. Ιστορικό & Αρχείο Οριστικοποιημένων Δελτίων Ζ</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Πατήστε «Φόρτωση / Επεξεργασία» σε οποιαδήποτε ημέρα για να επαναφέρετε τα στοιχεία της στην οθόνη.
            </p>
          </div>
          <span className="text-xs text-slate-400">{(zArchive || []).length} Καταχωρημένα Δελτία</span>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3">Κωδικός Ζ</th>
                <th className="p-3">Ημερομηνία</th>
                <th className="p-3">Βάρδια / Υπεύθυνος</th>
                <th className="p-3 text-right">Συνολικός Τζίρος</th>
                <th className="p-3 text-right">Μετρητά Ζ</th>
                <th className="p-3 text-right">Κάρτες POS</th>
                <th className="p-3 text-right">Έξοδα</th>
                <th className="p-3 text-right">Έλεγχος & Επεξεργασία</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(zArchive || []).map((entry: any) => {
                const isCurrentSelected = entry.date === selectedDate;
                return (
                  <tr key={entry.id} className={`transition ${isCurrentSelected ? 'bg-emerald-500/10' : 'hover:bg-slate-900/40'}`}>
                    <td className="p-3 font-mono font-bold text-emerald-400">{entry.id}</td>
                    <td className="p-3 font-mono font-bold text-white">{entry.date}</td>
                    <td className="p-3 text-slate-400">{entry.shift || 'Ολοήμερο'} ({entry.cashier || 'Διαχειριστής'})</td>
                    <td className="p-3 font-mono font-bold text-white text-right">{Number(entry.totalTurnover || entry.turnover || 0).toFixed(2)} €</td>
                    <td className="p-3 font-mono text-slate-300 text-right">{Number(entry.cash || 0).toFixed(2)} €</td>
                    <td className="p-3 font-mono text-slate-300 text-right">{Number(entry.pos || 0).toFixed(2)} €</td>
                    <td className="p-3 font-mono text-amber-400 text-right">{Number(entry.expenses || 0).toFixed(2)} €</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleSelectDate(entry.date)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition ${
                          isCurrentSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
                        }`}
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        <span>{isCurrentSelected ? 'Σε Προβολή' : 'Φόρτωση / Επεξεργασία'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteArchiveZ(entry.id)}
                        className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition inline-flex items-center"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Επικόλλησης Κειμένου Απόδειξης Ζ */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <span>Επικόλληση Κειμένου Απόδειξης Δελτίου Ζ</span>
              </h3>
              <button onClick={() => setShowPasteModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Αντιγράψτε (`Ctrl+C`) το κείμενο μέσα από οποιοδήποτε PDF Δελτίου Ζ και επικολλήστε το (`Ctrl+V`) εδώ για άμεση ανάλυση:
            </p>
            <textarea
              rows={10}
              value={pastedReceiptText}
              onChange={(e) => setPastedReceiptText(e.target.value)}
              placeholder={'FREDDO ESPRESSO: 190 x 3,50 = 665,00\nΜΕΤΡΗΤΑ Ζ: 785,00 €\nΚΑΡΤΕΣ POS: 1.090,00 €...'}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Ακύρωση
              </button>
              <button
                onClick={() => {
                  parseZReceiptText(pastedReceiptText, 'Επικολλημένο Δελτίο Ζ');
                  setShowPasteModal(false);
                  setPastedReceiptText('');
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow"
              >
                Ανάλυση & Ενημέρωση Ταμείου
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}