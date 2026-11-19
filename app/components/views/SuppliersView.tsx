// app/components/views/SuppliersView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import {
  Truck, Plus, Trash2, Edit3, Send,
  AlertTriangle, Search, Sparkles,
  Copy, PackagePlus, Building2, X,
  RotateCcw, Clock, Layers, Package
} from 'lucide-react';

interface CatalogProduct {
  id: number;
  sku: string;
  name: string;
  packName: string;      // π.χ. "Σακούλα 1kg" ή "Κιβώτιο 12lt"
  unitsPerPack: number;
  unit: 'kg' | 'lt' | 'τεμ' | 'πακ';
  packPriceNet: number;  // Τιμή συσκευασίας προ ΦΠΑ
  vatRate: 13 | 24;
  currentStock: number;
  minThreshold: number;
  parLevel: number;
}

interface EnrichedSupplier {
  id: number;
  name: string;
  category: 'Καφέδες & Ροφήματα' | 'Γαλακτοκομικά' | 'Συσκευασία & Αναλώσιμα' | 'Τρόφιμα & Snacks' | 'Ποτά & Αναψυκτικά';
  contactPerson: string;
  phoneViber: string;
  email: string;
  afm: string;
  iban: string;
  paymentTerms: 'Μετρητά' | 'Πίστωση 15 Ημέρες' | 'Πίστωση 30 Ημέρες' | 'Πίστωση 60 Ημέρες';
  deliveryDays: string;
  minOrderAmount: number; // Ελάχιστη παραγγελία (MOQ)
  openBalance: number;    // Ανοιχτό υπόλοιπο προς προμηθευτή
  catalog: CatalogProduct[];
}

interface PurchaseOrderRecord {
  id: string;
  date: string;
  supplierId: number;
  supplierName: string;
  itemsSummary: string;
  lineItems: { productId: number; name: string; packs: number; packName: string; packPriceNet: number; vatRate: number }[];
  totalNet: number;
  totalVat: number;
  totalGross: number;
  channel: 'Viber' | 'WhatsApp' | 'Email';
  status: 'Sent' | 'Received' | 'Cancelled';
}

const INITIAL_ENRICHED_SUPPLIERS: EnrichedSupplier[] = [
  {
    id: 1,
    name: 'Taf Coffee',
    category: 'Καφέδες & Ροφήματα',
    contactPerson: 'Γιώργος Παπαδάκης',
    phoneViber: '306912345678',
    email: 'orders@tafcoffee.gr',
    afm: '094321876',
    iban: 'GR1601101250000000012345678',
    paymentTerms: 'Μετρητά',
    deliveryDays: 'Δευτέρα - Τετάρτη - Παρασκευή',
    minOrderAmount: 80.00,
    openBalance: 450.00,
    catalog: [
      {
        id: 101,
        sku: 'TAF-ESP-01',
        name: 'Espresso Beans Taf (Specialty Blend)',
        packName: 'Συσκευασία 1kg',
        unitsPerPack: 1,
        unit: 'kg',
        packPriceNet: 22.50,
        vatRate: 13,
        currentStock: 6.5,
        minThreshold: 8,
        parLevel: 20
      },
      {
        id: 102,
        sku: 'TAF-DEC-02',
        name: 'Espresso Decaf Beans (Water Process)',
        packName: 'Συσκευασία 1kg',
        unitsPerPack: 1,
        unit: 'kg',
        packPriceNet: 24.00,
        vatRate: 13,
        currentStock: 1.2,
        minThreshold: 3,
        parLevel: 6
      },
      {
        id: 103,
        sku: 'TAF-FLT-03',
        name: 'Καφές Φίλτρου Single Origin Ethiopia',
        packName: 'Συσκευασία 500g',
        unitsPerPack: 0.5,
        unit: 'kg',
        packPriceNet: 14.50,
        vatRate: 13,
        currentStock: 3.0,
        minThreshold: 2,
        parLevel: 5
      },
      {
        id: 104,
        sku: 'TAF-CHC-04',
        name: 'Σοκολάτα Ρόφημα Belgian 42% Cocoa',
        packName: 'Δοχείο 2kg',
        unitsPerPack: 2,
        unit: 'kg',
        packPriceNet: 18.00,
        vatRate: 13,
        currentStock: 2.0,
        minThreshold: 4,
        parLevel: 8
      }
    ]
  },
  {
    id: 2,
    name: 'Kudu Coffee Roasters',
    category: 'Καφέδες & Ροφήματα',
    contactPerson: 'Νίκος Αλεξίου',
    phoneViber: '306987654321',
    email: 'b2b@kuducoffee.gr',
    afm: '800541298',
    iban: 'GR4401401050000000098765432',
    paymentTerms: 'Πίστωση 30 Ημέρες',
    deliveryDays: 'Τρίτη - Πέμπτη',
    minOrderAmount: 60.00,
    openBalance: 210.00,
    catalog: [
      {
        id: 201,
        sku: 'KUD-COL-01',
        name: 'Colombia Guest Microlot Espresso',
        packName: 'Συσκευασία 1kg',
        unitsPerPack: 1,
        unit: 'kg',
        packPriceNet: 25.00,
        vatRate: 13,
        currentStock: 2.0,
        minThreshold: 4,
        parLevel: 10
      },
      {
        id: 202,
        sku: 'KUD-TEA-02',
        name: 'Πράσινο Τσάι Matcha Ceremonial',
        packName: 'Κουτί 500g',
        unitsPerPack: 0.5,
        unit: 'kg',
        packPriceNet: 29.00,
        vatRate: 13,
        currentStock: 1.5,
        minThreshold: 1,
        parLevel: 3
      },
      {
        id: 203,
        sku: 'KUD-SYR-03',
        name: 'Σιρόπι Καραμέλα & Βανίλια Madagascar',
        packName: 'Φιάλη 750ml',
        unitsPerPack: 1,
        unit: 'τεμ',
        packPriceNet: 8.50,
        vatRate: 24,
        currentStock: 2,
        minThreshold: 4,
        parLevel: 8
      }
    ]
  },
  {
    id: 3,
    name: 'Φάρμα Θεσσαλίας (Γαλακτοκομικά)',
    category: 'Γαλακτοκομικά',
    contactPerson: 'Κώστας Μωραΐτης',
    phoneViber: '306974455667',
    email: 'orders@farma-thess.gr',
    afm: '099112233',
    iban: 'GR8201720100000000055443322',
    paymentTerms: 'Πίστωση 15 Ημέρες',
    deliveryDays: 'Καθημερινά (06:30 - 08:30)',
    minOrderAmount: 45.00,
    openBalance: 340.00,
    catalog: [
      {
        id: 301,
        sku: 'FAR-MLK-01',
        name: 'Γάλα Φρέσκο Πλήρες 3.5% Barista',
        packName: 'Κιβώτιο 12lt',
        unitsPerPack: 12,
        unit: 'lt',
        packPriceNet: 15.60,
        vatRate: 13,
        currentStock: 14,
        minThreshold: 24,
        parLevel: 60
      },
      {
        id: 302,
        sku: 'FAR-LGT-02',
        name: 'Γάλα Φρέσκο Ελαφρύ 1.5%',
        packName: 'Κιβώτιο 12lt',
        unitsPerPack: 12,
        unit: 'lt',
        packPriceNet: 14.40,
        vatRate: 13,
        currentStock: 8,
        minThreshold: 12,
        parLevel: 24
      },
      {
        id: 303,
        sku: 'FAR-OAT-03',
        name: 'Φυτικό Ρόφημα Βρώμης (Oat Barista)',
        packName: 'Κιβώτιο 8lt',
        unitsPerPack: 8,
        unit: 'lt',
        packPriceNet: 19.20,
        vatRate: 13,
        currentStock: 16,
        minThreshold: 12,
        parLevel: 32
      }
    ]
  },
  {
    id: 4,
    name: 'Pack & Cup Hellas (Συσκευασία)',
    category: 'Συσκευασία & Αναλώσιμα',
    contactPerson: 'Ελένη Σταματίου',
    phoneViber: '306933221100',
    email: 'sales@packandcup.gr',
    afm: '801445599',
    iban: 'GR2102600120000000077889900',
    paymentTerms: 'Πίστωση 30 Ημέρες',
    deliveryDays: 'Δευτέρα - Πέμπτη',
    minOrderAmount: 100.00,
    openBalance: 0.00,
    catalog: [
      {
        id: 401,
        sku: 'PCK-CUP-14',
        name: 'Ποτήρια Takeaway Διπλού Τοιχώματος 14oz',
        packName: 'Κούτα 1.000 τεμ.',
        unitsPerPack: 1000,
        unit: 'τεμ',
        packPriceNet: 54.00,
        vatRate: 24,
        currentStock: 320,
        minThreshold: 500,
        parLevel: 2000
      },
      {
        id: 402,
        sku: 'PCK-LID-90',
        name: 'Καπάκια Ποτηριών Φ90 Μαύρα Sip',
        packName: 'Κούτα 1.000 τεμ.',
        unitsPerPack: 1000,
        unit: 'τεμ',
        packPriceNet: 28.00,
        vatRate: 24,
        currentStock: 1450,
        minThreshold: 600,
        parLevel: 2000
      },
      {
        id: 403,
        sku: 'PCK-STR-03',
        name: 'Καλαμάκια Χάρτινα Eco Μαύρα',
        packName: 'Κούτα 2.500 τεμ.',
        unitsPerPack: 2500,
        unit: 'τεμ',
        packPriceNet: 32.50,
        vatRate: 24,
        currentStock: 900,
        minThreshold: 1000,
        parLevel: 3500
      },
      {
        id: 404,
        sku: 'PCK-BOX-04',
        name: 'Κουτιά Kraft Club Sandwich & Burger',
        packName: 'Πακέτο 250 τεμ.',
        unitsPerPack: 250,
        unit: 'τεμ',
        packPriceNet: 36.00,
        vatRate: 24,
        currentStock: 110,
        minThreshold: 150,
        parLevel: 500
      }
    ]
  }
];

export default function SuppliersView() {
  const { employerConfig, invoices, setInvoices, notify } = useMetric();

  // State Προμηθευτών & Καταλόγων
  const [suppliers, setSuppliers] = useState<EnrichedSupplier[]>(INITIAL_ENRICHED_SUPPLIERS);

  // State Καλαθιού Παραγγελίας: { [productId]: packsQty }
  const [orderQuantities, setOrderQuantities] = useState<{ [productId: number]: number }>({
    101: 4,
    102: 2,
    301: 3
  });

  // State Αναζήτησης & Φίλτρων
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // State Ιστορικού Παραγγελιών (Purchase Orders)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRecord[]>([
    {
      id: 'PO-8841',
      date: '17/11/2026 10:15',
      supplierId: 3,
      supplierName: 'Φάρμα Θεσσαλίας (Γαλακτοκομικά)',
      itemsSummary: '4x Κιβώτιο 12lt Γάλα Πλήρες, 2x Κιβώτιο 8lt Βρώμης',
      lineItems: [
        { productId: 301, name: 'Γάλα Φρέσκο Πλήρες 3.5% Barista', packs: 4, packName: 'Κιβώτιο 12lt', packPriceNet: 15.60, vatRate: 13 },
        { productId: 303, name: 'Φυτικό Ρόφημα Βρώμης (Oat Barista)', packs: 2, packName: 'Κιβώτιο 8lt', packPriceNet: 19.20, vatRate: 13 }
      ],
      totalNet: 100.80,
      totalVat: 13.10,
      totalGross: 113.90,
      channel: 'Viber',
      status: 'Sent'
    },
    {
      id: 'PO-8839',
      date: '15/11/2026 14:30',
      supplierId: 1,
      supplierName: 'Taf Coffee',
      itemsSummary: '10x Συσκευασία 1kg Espresso Beans Taf',
      lineItems: [
        { productId: 101, name: 'Espresso Beans Taf (Specialty Blend)', packs: 10, packName: 'Συσκευασία 1kg', packPriceNet: 22.50, vatRate: 13 }
      ],
      totalNet: 225.00,
      totalVat: 29.25,
      totalGross: 254.25,
      channel: 'Viber',
      status: 'Received'
    }
  ]);

  // Modal Προσθήκης / Επεξεργασίας Προμηθευτή ΚΑΙ των Προϊόντων του
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<EnrichedSupplier | null>(null);
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState<EnrichedSupplier['category']>('Καφέδες & Ροφήματα');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('3069');
  const [supEmail, setSupEmail] = useState('');
  const [supAfm, setSupAfm] = useState('');
  const [supIban, setSupIban] = useState('GR');
  const [supTerms, setSupTerms] = useState<EnrichedSupplier['paymentTerms']>('Μετρητά');
  const [supDeliveryDays, setSupDeliveryDays] = useState('Δευτέρα - Τετάρτη - Παρασκευή');
  const [supMinOrder, setSupMinOrder] = useState<number>(50);
  // Ενσωματωμένη λίστα προϊόντων μέσα στο Modal του Προμηθευτή
  const [supDraftCatalog, setSupDraftCatalog] = useState<CatalogProduct[]>([]);

  // Modal Μεμονωμένης Προσθήκης / Επεξεργασίας Είδους στον Κατάλογο Προμηθευτή
  const [catalogModalSupplierId, setCatalogModalSupplierId] = useState<number | null>(null);
  const [editingCatalogProduct, setEditingCatalogProduct] = useState<CatalogProduct | null>(null);
  const [prodSku, setProdSku] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodPackName, setProdPackName] = useState('Συσκευασία 1kg');
  const [prodUnitsPerPack, setProdUnitsPerPack] = useState<number>(1);
  const [prodUnit, setProdUnit] = useState<CatalogProduct['unit']>('kg');
  const [prodPackPrice, setProdPackPrice] = useState<number>(20);
  const [prodVat, setProdVat] = useState<13 | 24>(13);
  const [prodStock, setProdStock] = useState<number>(5);
  const [prodMinThreshold, setProdMinThreshold] = useState<number>(5);
  const [prodParLevel, setProdParLevel] = useState<number>(15);

  // Modal Προεπισκόπησης & Αποστολής Παραγγελίας (Viber / WhatsApp / Email)
  const [activeOrderDispatch, setActiveOrderDispatch] = useState<{
    supplier: EnrichedSupplier;
    lines: { prod: CatalogProduct; packs: number; lineNet: number; lineVat: number; lineGross: number }[];
    totalNet: number;
    totalVat: number;
    totalGross: number;
    deliveryDate: string;
    notes: string;
    messageText: string;
  } | null>(null);

  // Υπολογισμός Καλαθιού ανά Προμηθευτή
  const getSupplierCartSummary = (sup: EnrichedSupplier) => {
    const lines: { prod: CatalogProduct; packs: number; lineNet: number; lineVat: number; lineGross: number }[] = [];
    let totalNet = 0;
    let totalVat = 0;
    let totalGross = 0;
    let lowStockItemsCount = 0;

    sup.catalog.forEach((prod) => {
      if (prod.currentStock <= prod.minThreshold) {
        lowStockItemsCount++;
      }
      const packs = orderQuantities[prod.id] || 0;
      if (packs > 0) {
        const lineNet = +(packs * prod.packPriceNet).toFixed(2);
        const lineVat = +(lineNet * (prod.vatRate / 100)).toFixed(2);
        const lineGross = +(lineNet + lineVat).toFixed(2);
        lines.push({ prod, packs, lineNet, lineVat, lineGross });
        totalNet = +(totalNet + lineNet).toFixed(2);
        totalVat = +(totalVat + lineVat).toFixed(2);
        totalGross = +(totalGross + lineGross).toFixed(2);
      }
    });

    return { lines, totalNet, totalVat, totalGross, lowStockItemsCount };
  };

  // Συνολικοί Δείκτες (KPIs) Κορυφής
  const globalKpis = useMemo(() => {
    let activeCartsCount = 0;
    let totalDraftNet = 0;
    let totalDraftGross = 0;
    let totalOpenBalance = 0;
    let totalCatalogSkus = 0;

    suppliers.forEach((s) => {
      totalOpenBalance += s.openBalance;
      totalCatalogSkus += s.catalog.length;
      const summary = getSupplierCartSummary(s);
      if (summary.lines.length > 0) {
        activeCartsCount++;
        totalDraftNet += summary.totalNet;
        totalDraftGross += summary.totalGross;
      }
    });

    const pendingDeliveriesCount = purchaseOrders.filter((po) => po.status === 'Sent').length;

    return {
      activeCartsCount,
      totalDraftNet: +totalDraftNet.toFixed(2),
      totalDraftGross: +totalDraftGross.toFixed(2),
      totalOpenBalance: +totalOpenBalance.toFixed(2),
      totalCatalogSkus,
      pendingDeliveriesCount
    };
  }, [suppliers, orderQuantities, purchaseOrders]);

  // Φιλτραρισμένοι Προμηθευτές
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.phoneViber.includes(q) ||
        s.catalog.some((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [suppliers, categoryFilter, searchQuery]);

  // Αυξομείωση Ποσότητας Παραγγελίας (- / +)
  const handleAdjustOrderQty = (productId: number, delta: number) => {
    setOrderQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // 1-Κλικ Αυτόματη Συμπλήρωση Ελλείψεων για συγκεκριμένο Προμηθευτή (ή όλους)
  const handleAutoFillLowStockForSupplier = (sup: EnrichedSupplier) => {
    let addedCount = 0;
    const updated = { ...orderQuantities };

    sup.catalog.forEach((prod) => {
      if (prod.currentStock <= prod.minThreshold) {
        const missingUnits = Math.max(1, prod.parLevel - prod.currentStock);
        const recommendedPacks = Math.max(1, Math.ceil(missingUnits / (prod.unitsPerPack || 1)));
        updated[prod.id] = recommendedPacks;
        addedCount++;
      }
    });

    setOrderQuantities(updated);
    if (addedCount > 0) {
      notify(`✨ Συμπληρώθηκαν αυτόματα ${addedCount} είδη σε έλλειψη για τον προμηθευτή "${sup.name}"!`);
    } else {
      notify(`ℹ Όλα τα είδη του "${sup.name}" είναι πάνω από το όριο ασφαλείας.`);
    }
  };

  const handleAutoFillAllSuppliers = () => {
    const updated = { ...orderQuantities };
    let totalFilled = 0;
    suppliers.forEach((sup) => {
      sup.catalog.forEach((prod) => {
        if (prod.currentStock <= prod.minThreshold) {
          const missingUnits = Math.max(1, prod.parLevel - prod.currentStock);
          updated[prod.id] = Math.max(1, Math.ceil(missingUnits / (prod.unitsPerPack || 1)));
          totalFilled++;
        }
      });
    });
    setOrderQuantities(updated);
    notify(`✨ Έτοιμες οι παραγγελίες! Συμπληρώθηκαν αυτόματα ${totalFilled} κωδικοί σε έλλειψη σε όλους τους προμηθευτές.`);
  };

  const handleClearSupplierCart = (sup: EnrichedSupplier) => {
    const updated = { ...orderQuantities };
    sup.catalog.forEach((p) => {
      delete updated[p.id];
    });
    setOrderQuantities(updated);
    notify(`🧹 Καθαρίστηκε το καλάθι του προμηθευτή "${sup.name}".`);
  };

  // Δημιουργία Κειμένου Παραγγελίας & Άνοιγμα Modal Αποστολής
  const handlePrepareOrderDispatch = (sup: EnrichedSupplier) => {
    const summary = getSupplierCartSummary(sup);
    if (summary.lines.length === 0) {
      notify('⚠️ Επιλέξτε τουλάχιστον 1 προϊόν (+) από τον κατάλογο του προμηθευτή για να στείλετε παραγγελία!');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDeliveryDate = tomorrow.toISOString().split('T')[0];

    const linesFormatted = summary.lines
      .map(
        (l, idx) =>
          `${idx + 1}. ${l.packs}x ${l.prod.packName} — ${l.prod.name} (${l.prod.packPriceNet.toFixed(2)}€ + ΦΠΑ ${l.prod.vatRate}%) = ${l.lineNet.toFixed(2)}€`
      )
      .join('\n');

    const msg = [
      `📦 ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ ΤΡΟΦΟΔΟΣΙΑΣ`,
      `Κατάστημα: ${employerConfig?.storeName || 'blysscafe Athens'}`,
      `Επωνυμία: ${employerConfig?.legalTitle || 'ΒΗΣΣΑΡΙΩΝ ΖΑΡΑ & ΣΙΑ Ε.Ε.'} (ΑΦΜ: ${employerConfig?.afm || '801948271'})`,
      `Προς: ${sup.name} (Υπεύθ.: ${sup.contactPerson})`,
      `Επιθυμητή Παράδοση: ${defaultDeliveryDate.split('-').reverse().join('/')} (08:00 - 11:00)`,
      `----------------------------------------`,
      linesFormatted,
      `----------------------------------------`,
      `• Καθαρή Αξία: ${summary.totalNet.toFixed(2)} €`,
      `• ΦΠΑ: ${summary.totalVat.toFixed(2)} €`,
      `• ΤΕΛΙΚΟ ΣΥΝΟΛΟ (Με ΦΠΑ): ${summary.totalGross.toFixed(2)} €`,
      `• Τρόπος Εξόφλησης: ${sup.paymentTerms}`,
      `• Διεύθυνση: ${employerConfig?.addressStreet || 'Πατριάρχου Ιωακείμ 42, Κολωνάκι'}`
    ].join('\n');

    setActiveOrderDispatch({
      supplier: sup,
      lines: summary.lines,
      totalNet: summary.totalNet,
      totalVat: summary.totalVat,
      totalGross: summary.totalGross,
      deliveryDate: defaultDeliveryDate,
      notes: 'Παράδοση στην είσοδο τροφοδοσίας έως τις 11:00 π.μ.',
      messageText: msg
    });
  };

  // Οριστική Αποστολή Παραγγελίας (Viber / WhatsApp / Email) & Καταγραφή στο Ιστορικό
  const handleExecuteOrderSend = (channel: 'Viber' | 'WhatsApp' | 'Email') => {
    if (!activeOrderDispatch) return;
    const { supplier, lines, totalNet, totalVat, totalGross, messageText } = activeOrderDispatch;

    const encodedText = encodeURIComponent(messageText);
    const cleanPhone = supplier.phoneViber.replace(/[^0-9]/g, '');

    if (channel === 'Viber') {
      window.open(`viber://forward?text=${encodedText}`, '_blank');
    } else if (channel === 'WhatsApp') {
      window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
    } else if (channel === 'Email') {
      const subject = encodeURIComponent(`Νέα Παραγγελία - ${employerConfig?.storeName || 'blysscafe Athens'}`);
      window.open(`mailto:${supplier.email}?subject=${subject}&body=${encodedText}`, '_blank');
    }

    const newPo: PurchaseOrderRecord = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      supplierId: supplier.id,
      supplierName: supplier.name,
      itemsSummary: lines.map((l) => `${l.packs}x ${l.prod.name}`).join(', '),
      lineItems: lines.map((l) => ({
        productId: l.prod.id,
        name: l.prod.name,
        packs: l.packs,
        packName: l.prod.packName,
        packPriceNet: l.prod.packPriceNet,
        vatRate: l.prod.vatRate
      })),
      totalNet,
      totalVat,
      totalGross,
      channel,
      status: 'Sent'
    };

    setPurchaseOrders([newPo, ...purchaseOrders]);
    handleClearSupplierCart(supplier);
    setActiveOrderDispatch(null);
    notify(`🚀 Η παραγγελία ${newPo.id} στάλθηκε μέσω ${channel} στον "${supplier.name}" και καταχωρήθηκε στις Ενεργές Παραγγελίες!`);
  };

  // Παραλαβή Παραγγελίας από το Ιστορικό (+Στοκ στον Κατάλογο & Αυτόματη Δημιουργία Τιμολογίου στα Οικονομικά)
  const handleReceivePurchaseOrder = (po: PurchaseOrderRecord) => {
    if (po.status === 'Received') return;

    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id !== po.supplierId) return sup;
        const updatedCatalog = sup.catalog.map((prod) => {
          const foundLine = po.lineItems.find((li) => li.productId === prod.id);
          if (foundLine) {
            const addedUnits = +(foundLine.packs * prod.unitsPerPack).toFixed(2);
            return { ...prod, currentStock: +(prod.currentStock + addedUnits).toFixed(2) };
          }
          return prod;
        });
        return {
          ...sup,
          openBalance: sup.paymentTerms === 'Μετρητά' ? sup.openBalance : +(sup.openBalance + po.totalGross).toFixed(2),
          catalog: updatedCatalog
        };
      })
    );

    setPurchaseOrders((prev) =>
      prev.map((item) => (item.id === po.id ? { ...item, status: 'Received' } : item))
    );

    if (setInvoices) {
      const newInvoice = {
        id: `ΤΔΑ-${po.id.replace('PO-', '')}`,
        supplier: po.supplierName,
        date: new Date().toLocaleDateString('el-GR'),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        amount: po.totalGross,
        vat: po.totalVat,
        status: 'Pending' as const,
        paymentMethod: 'Τράπεζα'
      };
      setInvoices([newInvoice, ...(invoices || [])]);
    }

    notify(`🚚 Η παραγγελία ${po.id} παραλήφθηκε! Το στοκ αυξήθηκε και εκδόθηκε αυτόματα τιμολόγιο (${po.totalGross.toFixed(2)} €) στα Οικονομικά!`);
  };

  // Επανάληψη Παλιάς Παραγγελίας με 1 Κλικ
  const handleReorderFromHistory = (po: PurchaseOrderRecord) => {
    const updated = { ...orderQuantities };
    po.lineItems.forEach((li) => {
      updated[li.productId] = li.packs;
    });
    setOrderQuantities(updated);
    notify(`🔄 Φορτώθηκαν ξανά στο καλάθι οι ποσότητες της παραγγελίας ${po.id} (${po.supplierName})!`);
  };

  // CRUD Προμηθευτή & Ενσωματωμένου Τιμοκαταλόγου Προϊόντων
  const handleOpenNewSupplierModal = () => {
    setEditingSupplier(null);
    setSupName('');
    setSupCategory('Καφέδες & Ροφήματα');
    setSupContact('');
    setSupPhone('3069');
    setSupEmail('');
    setSupAfm('');
    setSupIban('GR');
    setSupTerms('Πίστωση 30 Ημέρες');
    setSupDeliveryDays('Δευτέρα - Τετάρτη - Παρασκευή');
    setSupMinOrder(60);
    // Ξεκινάμε με 1 έτοιμη γραμμή προϊόντος για άμεση καταχώρηση
    setSupDraftCatalog([
      {
        id: Date.now(),
        sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        packName: 'Συσκευασία 1kg',
        unitsPerPack: 1,
        unit: 'kg',
        packPriceNet: 18.0,
        vatRate: 13,
        currentStock: 5,
        minThreshold: 5,
        parLevel: 15
      }
    ]);
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplierModal = (sup: EnrichedSupplier) => {
    setEditingSupplier(sup);
    setSupName(sup.name);
    setSupCategory(sup.category);
    setSupContact(sup.contactPerson);
    setSupPhone(sup.phoneViber);
    setSupEmail(sup.email);
    setSupAfm(sup.afm);
    setSupIban(sup.iban);
    setSupTerms(sup.paymentTerms);
    setSupDeliveryDays(sup.deliveryDays);
    setSupMinOrder(sup.minOrderAmount);
    // Φορτώνουμε όλα τα υπάρχοντα προϊόντα του προμηθευτή για επεξεργασία / προσθήκη / αφαίρεση
    setSupDraftCatalog(sup.catalog.map((p) => ({ ...p })));
    setShowSupplierModal(true);
  };

  // Προσθήκη νέας γραμμής προϊόντος μέσα στο Modal του Προμηθευτή
  const handleAddDraftProductRow = () => {
    setSupDraftCatalog((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        packName: 'Κιβώτιο / Συσκευασία',
        unitsPerPack: 1,
        unit: 'kg',
        packPriceNet: 15.0,
        vatRate: 13,
        currentStock: 5,
        minThreshold: 5,
        parLevel: 15
      }
    ]);
  };

  // Ενημέρωση πεδίου προϊόντος μέσα στο Modal του Προμηθευτή
  const handleUpdateDraftProductRow = (id: number, field: keyof CatalogProduct, value: any) => {
    setSupDraftCatalog((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, [field]: value } : prod))
    );
  };

  // Διαγραφή γραμμής προϊόντος μέσα από το Modal του Προμηθευτή
  const handleRemoveDraftProductRow = (id: number) => {
    setSupDraftCatalog((prev) => prev.filter((prod) => prod.id !== id));
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) {
      notify('⚠️ Συμπληρώστε την επωνυμία του προμηθευτή.');
      return;
    }

    // Φιλτράρουμε τυχόν κενές γραμμές προϊόντων (όσες δεν έχουν όνομα)
    const validCatalog = supDraftCatalog
      .filter((p) => p.name.trim() !== '')
      .map((p) => ({
        ...p,
        name: p.name.trim(),
        sku: p.sku.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
        packName: p.packName.trim() || 'Συσκευασία',
        packPriceNet: Math.max(0, Number(p.packPriceNet) || 0),
        unitsPerPack: Math.max(0.01, Number(p.unitsPerPack) || 1),
        currentStock: Math.max(0, Number(p.currentStock) || 0),
        minThreshold: Math.max(0, Number(p.minThreshold) || 0),
        parLevel: Math.max(1, Number(p.parLevel) || 10)
      }));

    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id
            ? {
                ...s,
                name: supName.trim(),
                category: supCategory,
                contactPerson: supContact.trim() || 'Υπεύθυνος Πωλήσεων',
                phoneViber: supPhone.trim(),
                email: supEmail.trim(),
                afm: supAfm.trim(),
                iban: supIban.trim(),
                paymentTerms: supTerms,
                deliveryDays: supDeliveryDays,
                minOrderAmount: Number(supMinOrder) || 0,
                catalog: validCatalog
              }
            : s
        )
      );
      notify(`✔ Ο προμηθευτής "${supName}" και ο τιμοκατάλογός του (${validCatalog.length} προϊόντα) ενημερώθηκαν!`);
    } else {
      const newSup: EnrichedSupplier = {
        id: Date.now(),
        name: supName.trim(),
        category: supCategory,
        contactPerson: supContact.trim() || 'Υπεύθυνος Πωλήσεων',
        phoneViber: supPhone.trim() || '306900000000',
        email: supEmail.trim() || 'orders@supplier.gr',
        afm: supAfm.trim() || '099000000',
        iban: supIban.trim() || 'GR0000000000000000000000',
        paymentTerms: supTerms,
        deliveryDays: supDeliveryDays,
        minOrderAmount: Number(supMinOrder) || 50,
        openBalance: 0,
        catalog: validCatalog
      };
      setSuppliers([newSup, ...suppliers]);
      notify(`✔ Ο νέος προμηθευτής "${newSup.name}" καταχωρήθηκε μαζί με ${validCatalog.length} προϊόντα στον τιμοκατάλογό του!`);
    }
    setShowSupplierModal(false);
  };

  const handleDeleteSupplier = (id: number, name: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    notify(`🗑️ Ο προμηθευτής "${name}" διαγράφηκε.`);
  };

  // CRUD Μεμονωμένου Είδους Καταλόγου Προμηθευτή (από το κουμπί + Προσθήκη Είδους της κάρτας)
  const handleOpenAddCatalogProduct = (supplierId: number) => {
    setCatalogModalSupplierId(supplierId);
    setEditingCatalogProduct(null);
    setProdSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setProdName('');
    setProdPackName('Κιβώτιο / Συσκευασία');
    setProdUnitsPerPack(1);
    setProdUnit('kg');
    setProdPackPrice(15.0);
    setProdVat(13);
    setProdStock(5);
    setProdMinThreshold(5);
    setProdParLevel(15);
  };

  const handleOpenEditCatalogProduct = (supplierId: number, prod: CatalogProduct) => {
    setCatalogModalSupplierId(supplierId);
    setEditingCatalogProduct(prod);
    setProdSku(prod.sku);
    setProdName(prod.name);
    setProdPackName(prod.packName);
    setProdUnitsPerPack(prod.unitsPerPack);
    setProdUnit(prod.unit);
    setProdPackPrice(prod.packPriceNet);
    setProdVat(prod.vatRate);
    setProdStock(prod.currentStock);
    setProdMinThreshold(prod.minThreshold);
    setProdParLevel(prod.parLevel);
  };

  const handleSaveCatalogProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogModalSupplierId || !prodName.trim()) return;

    const payload: CatalogProduct = {
      id: editingCatalogProduct ? editingCatalogProduct.id : Date.now(),
      sku: prodSku.trim() || 'SKU-01',
      name: prodName.trim(),
      packName: prodPackName.trim() || 'Συσκευασία',
      unitsPerPack: Math.max(0.01, Number(prodUnitsPerPack)),
      unit: prodUnit,
      packPriceNet: Math.max(0, Number(prodPackPrice)),
      vatRate: prodVat,
      currentStock: Number(prodStock),
      minThreshold: Number(prodMinThreshold),
      parLevel: Number(prodParLevel)
    };

    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id !== catalogModalSupplierId) return sup;
        const exists = sup.catalog.some((c) => c.id === payload.id);
        return {
          ...sup,
          catalog: exists
            ? sup.catalog.map((c) => (c.id === payload.id ? payload : c))
            : [...sup.catalog, payload]
        };
      })
    );

    setCatalogModalSupplierId(null);
    setEditingCatalogProduct(null);
    notify(`✔ Ο τιμοκατάλογος ενημερώθηκε με το είδος "${payload.name}"!`);
  };

  const handleDeleteCatalogProduct = (supplierId: number, prodId: number, prodNameStr: string) => {
    setSuppliers((prev) =>
      prev.map((sup) =>
        sup.id === supplierId
          ? { ...sup, catalog: sup.catalog.filter((c) => c.id !== prodId) }
          : sup
      )
    );
    notify(`🗑️ Το είδος "${prodNameStr}" αφαιρέθηκε από τον τιμοκατάλογο.`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Header & Global Order Controls */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Truck className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">
                Προμηθευτές, Τιμοκατάλογοι B2B & Κέντρο Παραγγελιών Viber
              </h2>
              {globalKpis.activeCartsCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {globalKpis.activeCartsCount} Ενεργά Καλάθια ({globalKpis.totalDraftGross.toFixed(2)} €)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Επιλέξτε ποσότητες (- / +) απευθείας πάνω στον κατάλογο κάθε προμηθευτή ή πατήστε «Επεξεργασία» για να προσθέσετε/αφαιρέσετε προϊόντα.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoFillAllSuppliers}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-extrabold text-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>1-Κλικ Γέμισμα Όλων των Ελλείψεων</span>
            </button>

            <button
              onClick={handleOpenNewSupplierModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition"
            >
              <Plus className="h-4 w-4" />
              <span>+ Νέος Προμηθευτής & Προϊόντα</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Supplier & Ordering KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Συνεργαζόμενοι Προμηθευτές</span>
            <p className="text-2xl font-black text-white">{suppliers.length} Εταιρείες</p>
            <span className="text-[10px] text-emerald-400 block">
              {globalKpis.totalCatalogSkus} συμβεβλημένοι κωδικοί τιμοκαταλόγου
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Τρέχον Καλάθι Προς Αποστολή</span>
            <p className="text-2xl font-black text-purple-400">{globalKpis.totalDraftNet.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              Με ΦΠΑ: {globalKpis.totalDraftGross.toFixed(2)} € ({globalKpis.activeCartsCount} προμηθευτές)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Αναμενόμενες Παραλαβές (Σε εξέλιξη)</span>
            <p className="text-2xl font-black text-blue-400">{globalKpis.pendingDeliveriesCount} Παραγγελίες</p>
            <span className="text-[10px] text-slate-500 block">
              Έτοιμες για παραλαβή & αυτόματη ενημέρωση στοκ
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Ανοιχτό Υπόλοιπο Πιστώσεων</span>
            <p className="text-2xl font-black text-amber-400">{globalKpis.totalOpenBalance.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              Συνολικές οφειλές σε προμηθευτές με πίστωση
            </span>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Αναζήτηση προμηθευτή, υπευθύνου, τηλεφώνου ή προϊόντος..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-7 flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {['ALL', 'Καφέδες & Ροφήματα', 'Γαλακτοκομικά', 'Συσκευασία & Αναλώσιμα'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                  categoryFilter === cat
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? `Όλοι (${suppliers.length})` : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suppliers Cards with Embedded Interactive Catalogs & 1-Click Ordering */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredSuppliers.map((sup) => {
          const cart = getSupplierCartSummary(sup);
          const moqProgress = Math.min(100, Math.round((cart.totalNet / (sup.minOrderAmount || 1)) * 100));
          const isMoqReached = cart.totalNet >= sup.minOrderAmount;

          return (
            <div
              key={sup.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition"
            >
              <div className="space-y-4">
                {/* Supplier Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">{sup.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                          sup.paymentTerms === 'Μετρητά'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {sup.paymentTerms}
                      </span>
                      {cart.lowStockItemsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {cart.lowStockItemsCount} Ελλείψεις
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Υπεύθυνος: <span className="text-slate-200 font-bold">{sup.contactPerson}</span> • Τηλ/Viber:{' '}
                      <span className="text-emerald-400 font-mono font-bold">+{sup.phoneViber}</span>
                    </p>
                  </div>

                  {/* Edit / Delete Supplier Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAutoFillLowStockForSupplier(sup)}
                      title="Αυτόματο γέμισμα ειδών που τελειώνουν"
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold flex items-center gap-1 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Γέμισμα Ελλείψεων</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditSupplierModal(sup)}
                      title="Επεξεργασία Προμηθευτή & Προσθήκη/Αφαίρεση Προϊόντων"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Επεξεργασία / Προϊόντα</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                      title="Διαγραφή Προμηθευτή"
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata Strip: Delivery Days, AFM, IBAN, Open Balance */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ημέρες Παράδοσης:</span>
                    <span className="text-slate-200 font-bold">{sup.deliveryDays}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ΑΦΜ & IBAN:</span>
                    <span className="text-slate-300 font-mono">
                      {sup.afm} • {sup.iban.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 sm:text-right">
                    <span className="text-slate-500 block text-[10px]">Ανοιχτό Υπόλοιπο:</span>
                    <span className={`font-mono font-extrabold ${sup.openBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {sup.openBalance.toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Supplier Catalog Table with Interactive Order Stepper (- / +) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Τιμοκατάλογος & Επιλογή Ποσότητας Παραγγελίας ({sup.catalog.length} είδη)</span>
                    </span>
                    <button
                      onClick={() => handleOpenAddCatalogProduct(sup.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold flex items-center gap-1 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Γρήγορη Προσθήκη Είδους</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    {sup.catalog.length === 0 ? (
                      <div className="p-6 text-center space-y-2">
                        <p className="text-xs text-slate-400">Δεν έχουν καταχωρηθεί προϊόντα σε αυτόν τον προμηθευτή.</p>
                        <button
                          onClick={() => handleOpenAddCatalogProduct(sup.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs inline-flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Προσθήκη Πρώτου Προϊόντος</span>
                        </button>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[10px]">
                          <tr>
                            <th className="p-2.5">Είδος / Συσκευασία</th>
                            <th className="p-2.5 text-center">Στοκ</th>
                            <th className="p-2.5 text-right">Τιμή Συσκ.</th>
                            <th className="p-2.5 text-center">Ποσότητα Παραγγελίας</th>
                            <th className="p-2.5 text-right">Σύνολο</th>
                            <th className="p-2.5 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {sup.catalog.map((prod) => {
                            const qty = orderQuantities[prod.id] || 0;
                            const isLow = prod.currentStock <= prod.minThreshold;
                            const lineNet = +(qty * prod.packPriceNet).toFixed(2);

                            return (
                              <tr
                                key={prod.id}
                                className={`transition ${
                                  qty > 0
                                    ? 'bg-purple-500/10'
                                    : isLow
                                      ? 'bg-amber-500/5'
                                      : 'hover:bg-slate-900/40'
                                }`}
                              >
                                <td className="p-2.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white">{prod.name}</span>
                                    {isLow && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Έλλειψη
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block">
                                    {prod.packName} • ΦΠΑ {prod.vatRate}% ({prod.sku})
                                  </span>
                                </td>

                                <td className="p-2.5 text-center font-mono">
                                  <span className={`font-bold ${isLow ? 'text-amber-400' : 'text-slate-300'}`}>
                                    {prod.currentStock} {prod.unit}
                                  </span>
                                  <span className="text-[9px] text-slate-500 block">Όριο: {prod.minThreshold}</span>
                                </td>

                                <td className="p-2.5 text-right font-mono">
                                  <span className="text-white font-bold">{prod.packPriceNet.toFixed(2)} €</span>
                                </td>

                                {/* Interactive - / + Order Stepper */}
                                <td className="p-2.5 text-center">
                                  <div className="inline-flex items-center gap-1 bg-slate-900 px-1.5 py-1 rounded-lg border border-slate-800">
                                    <button
                                      type="button"
                                      onClick={() => handleAdjustOrderQty(prod.id, -1)}
                                      className="h-5 w-5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={qty}
                                      onChange={(e) =>
                                        setOrderQuantities({
                                          ...orderQuantities,
                                          [prod.id]: Math.max(0, parseInt(e.target.value) || 0)
                                        })
                                      }
                                      className={`w-10 bg-transparent text-center font-mono font-black focus:outline-none ${
                                        qty > 0 ? 'text-purple-300' : 'text-slate-500'
                                      }`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAdjustOrderQty(prod.id, 1)}
                                      className="h-5 w-5 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 font-mono font-bold flex items-center justify-center transition"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>

                                <td className="p-2.5 text-right font-mono font-bold">
                                  <span className={qty > 0 ? 'text-emerald-400' : 'text-slate-600'}>
                                    {lineNet.toFixed(2)} €
                                  </span>
                                </td>

                                <td className="p-2.5 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => handleOpenEditCatalogProduct(sup.id, prod)}
                                    title="Επεξεργασία Τιμής / Είδους"
                                    className="p-1 text-slate-400 hover:text-white"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCatalogProduct(sup.id, prod.id, prod.name)}
                                    title="Αφαίρεση Είδους από τον Προμηθευτή"
                                    className="p-1 text-red-400/80 hover:text-red-400 ml-1"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: MOQ Bar, Totals & 1-Click Send Order Buttons */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="space-y-1 flex-1 min-w-[180px]">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">
                        Ελάχιστη Παραγγελία (MOQ: {sup.minOrderAmount.toFixed(2)} €)
                      </span>
                      <span className={isMoqReached ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {isMoqReached ? '✔ Καλύφθηκε' : `Υπολείπονται ${(sup.minOrderAmount - cart.totalNet).toFixed(2)} €`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all ${isMoqReached ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${moqProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right font-mono pl-3">
                    <span className="text-[10px] text-slate-400 block">
                      Καθαρά: {cart.totalNet.toFixed(2)} € + ΦΠΑ: {cart.totalVat.toFixed(2)} €
                    </span>
                    <span className="text-base font-black text-emerald-400">
                      Σύνολο: {cart.totalGross.toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handlePrepareOrderDispatch(sup)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      Αποστολή Παραγγελίας Viber / WhatsApp ({cart.lines.length} είδη)
                    </span>
                  </button>

                  {cart.lines.length > 0 && (
                    <button
                      onClick={() => handleClearSupplierCart(sup)}
                      title="Μηδενισμός Καλαθιού"
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
                    >
                      Καθαρισμός
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 2: Purchase Orders History & 1-Click Delivery Receipt (+Stock & +Invoice) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>Ιστορικό & Ενεργές Παραγγελίες Προμηθευτών (Purchase Orders)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Μόλις παραλάβετε τα εμπορεύματα, πατήστε «Παραλαβή (+Στοκ & Τιμολόγιο)» για να ενημερωθεί αυτόματα η αποθήκη και τα οικονομικά.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{purchaseOrders.length} Παραγγελίες</span>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3.5">Κωδικός PO</th>
                <th className="p-3.5">Ημερομηνία</th>
                <th className="p-3.5">Προμηθευτής</th>
                <th className="p-3.5">Περιγραφή Ειδών</th>
                <th className="p-3.5 text-right">Καθαρή Αξία</th>
                <th className="p-3.5 text-right">Σύνολο (Με ΦΠΑ)</th>
                <th className="p-3.5 text-center">Κατάσταση</th>
                <th className="p-3.5 text-right">Έλεγχος & Παραλαβή</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3.5 font-mono font-bold text-purple-400">{po.id}</td>
                  <td className="p-3.5 text-slate-400 font-mono">{po.date}</td>
                  <td className="p-3.5 font-bold text-white">{po.supplierName}</td>
                  <td className="p-3.5 text-slate-300 max-w-xs truncate" title={po.itemsSummary}>
                    {po.itemsSummary}
                  </td>
                  <td className="p-3.5 font-mono text-right text-slate-300">{po.totalNet.toFixed(2)} €</td>
                  <td className="p-3.5 font-mono font-bold text-right text-emerald-400">{po.totalGross.toFixed(2)} €</td>
                  <td className="p-3.5 text-center">
                    {po.status === 'Sent' ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Σε Αναμονή Παράδοσης ({po.channel})
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ✔ Παραλήφθηκε & Τιμολογήθηκε
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {po.status === 'Sent' && (
                      <button
                        onClick={() => handleReceivePurchaseOrder(po)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] inline-flex items-center gap-1 shadow transition"
                      >
                        <PackagePlus className="h-3.5 w-3.5" />
                        <span>Παραλαβή (+Στοκ & Τιμολόγιο)</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleReorderFromHistory(po)}
                      title="Επανάληψη αυτής της παραγγελίας"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] inline-flex items-center gap-1 border border-slate-700 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-blue-400" />
                      <span>Επανάληψη</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Προεπισκόπηση & Αποστολή Παραγγελίας (Viber / WhatsApp / Email) */}
      {activeOrderDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-purple-400" />
                  <span>Επιβεβαίωση & Αποστολή Παραγγελίας: {activeOrderDispatch.supplier.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Παραλήπτης: {activeOrderDispatch.supplier.contactPerson} (+{activeOrderDispatch.supplier.phoneViber})
                </p>
              </div>
              <button
                onClick={() => setActiveOrderDispatch(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-bold block">
                Έτοιμο Μήνυμα Παραγγελίας (Μπορείτε να προσθέσετε σχόλιο πριν την αποστολή):
              </label>
              <textarea
                rows={11}
                value={activeOrderDispatch.messageText}
                onChange={(e) =>
                  setActiveOrderDispatch({ ...activeOrderDispatch, messageText: e.target.value })
                }
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeOrderDispatch.messageText);
                  notify('📋 Η παραγγελία αντιγράφηκε στο πρόχειρο!');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Αντιγραφή</span>
              </button>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExecuteOrderSend('Email')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-extrabold"
                >
                  Email
                </button>
                <button
                  onClick={() => handleExecuteOrderSend('WhatsApp')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleExecuteOrderSend('Viber')}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/20"
                >
                  Αποστολή με Viber
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Προσθήκη / Επεξεργασία Προμηθευτή ΚΑΙ Μαζική Διαχείριση των Προϊόντων του */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveSupplier}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-4xl space-y-5 shadow-2xl my-8 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  <span>
                    {editingSupplier
                      ? `Επεξεργασία Προμηθευτή & Προϊόντων: ${editingSupplier.name}`
                      : 'Καταχώρηση Νέου Προμηθευτή & Τιμοκαταλόγου Προϊόντων'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Συμπληρώστε τα στοιχεία της εταιρείας και προσθέστε ή αφαιρέστε προϊόντα από τον τιμοκατάλογό της.
                </p>
              </div>
              <button type="button" onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ενότητα Α: Στοιχεία Εταιρείας Προμηθευτή */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Επωνυμία Προμηθευτή *</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="π.χ. Taf Coffee"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Κατηγορία:</label>
                <select
                  value={supCategory}
                  onChange={(e) => setSupCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="Καφέδες & Ροφήματα">Καφέδες & Ροφήματα</option>
                  <option value="Γαλακτοκομικά">Γαλακτοκομικά</option>
                  <option value="Συσκευασία & Αναλώσιμα">Συσκευασία & Αναλώσιμα</option>
                  <option value="Τρόφιμα & Snacks">Τρόφιμα & Snacks</option>
                  <option value="Ποτά & Αναψυκτικά">Ποτά & Αναψυκτικά</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Υπεύθυνος Επικοινωνίας:</label>
                <input
                  type="text"
                  value={supContact}
                  onChange={(e) => setSupContact(e.target.value)}
                  placeholder="π.χ. Γιώργος Παπαδάκης"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Τηλέφωνο Viber / WhatsApp:</label>
                <input
                  type="text"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  placeholder="3069xxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Παραγγελιών:</label>
                <input
                  type="email"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">ΑΦΜ Προμηθευτή:</label>
                <input
                  type="text"
                  value={supAfm}
                  onChange={(e) => setSupAfm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Όροι Πληρωμής:</label>
                <select
                  value={supTerms}
                  onChange={(e) => setSupTerms(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold"
                >
                  <option value="Μετρητά">Μετρητά</option>
                  <option value="Πίστωση 15 Ημέρες">Πίστωση 15 Ημέρες</option>
                  <option value="Πίστωση 30 Ημέρες">Πίστωση 30 Ημέρες</option>
                  <option value="Πίστωση 60 Ημέρες">Πίστωση 60 Ημέρες</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ελάχιστη Παραγγελία MOQ (€):</label>
                <input
                  type="number"
                  value={supMinOrder}
                  onChange={(e) => setSupMinOrder(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ημέρες Διανομής:</label>
                <input
                  type="text"
                  value={supDeliveryDays}
                  onChange={(e) => setSupDeliveryDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-slate-400 block mb-1">IBAN Τραπεζικού Λογαριασμού:</label>
                <input
                  type="text"
                  value={supIban}
                  onChange={(e) => setSupIban(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            {/* Ενότητα Β: Διαχείριση Προϊόντων & Τιμοκαταλόγου του Προμηθευτή */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-emerald-400" />
                    <span>Προϊόντα & Τιμοκατάλογος Προμηθευτή ({supDraftCatalog.length} είδη)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Καταχωρήστε εδώ όλα τα προϊόντα που προμηθεύεστε από τη συγκεκριμένη εταιρεία ή διαγράψτε όσα δεν χρειάζεστε.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDraftProductRow}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-extrabold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Προσθήκη Γραμμής Προϊόντος</span>
                </button>
              </div>

              {supDraftCatalog.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <p>Δεν υπάρχουν προϊόντα στη λίστα. Πατήστε «+ Προσθήκη Γραμμής Προϊόντος» για να προσθέσετε είδη.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {supDraftCatalog.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Κωδικός SKU</label>
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleUpdateDraftProductRow(item.id, 'sku', e.target.value)}
                          placeholder="SKU-01"
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                          {index + 1}. Ονομασία Προϊόντος *
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateDraftProductRow(item.id, 'name', e.target.value)}
                          placeholder="π.χ. Espresso Beans 1kg"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Συσκευασία</label>
                        <input
                          type="text"
                          value={item.packName}
                          onChange={(e) => handleUpdateDraftProductRow(item.id, 'packName', e.target.value)}
                          placeholder="π.χ. Κιβώτιο 12lt"
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] text-emerald-400 block mb-0.5 font-bold">Τιμή (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.packPriceNet}
                          onChange={(e) =>
                            handleUpdateDraftProductRow(item.id, 'packPriceNet', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-right"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] text-slate-400 block mb-0.5">ΦΠΑ</label>
                        <select
                          value={item.vatRate}
                          onChange={(e) =>
                            handleUpdateDraftProductRow(item.id, 'vatRate', Number(e.target.value) as 13 | 24)
                          }
                          className="w-full px-1.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                        >
                          <option value={13}>13%</option>
                          <option value={24}>24%</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Στοκ</label>
                        <input
                          type="number"
                          step="0.5"
                          value={item.currentStock}
                          onChange={(e) =>
                            handleUpdateDraftProductRow(item.id, 'currentStock', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-right"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] text-amber-400 block mb-0.5">Όριο Min</label>
                        <input
                          type="number"
                          step="0.5"
                          value={item.minThreshold}
                          onChange={(e) =>
                            handleUpdateDraftProductRow(item.id, 'minThreshold', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-300 font-mono text-right"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftProductRow(item.id)}
                          title="Αφαίρεση Προϊόντος"
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/10"
              >
                {editingSupplier
                  ? 'Αποθήκευση Προμηθευτή & Τιμοκαταλόγου'
                  : 'Καταχώρηση Προμηθευτή & Προϊόντων'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Γρήγορη Προσθήκη / Επεξεργασία Μεμονωμένου Είδους στον Τιμοκατάλογο */}
      {catalogModalSupplierId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCatalogProduct}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">
                {editingCatalogProduct ? `Επεξεργασία Είδους: ${editingCatalogProduct.name}` : 'Προσθήκη Είδους στον Τιμοκατάλογο'}
              </h3>
              <button
                type="button"
                onClick={() => setCatalogModalSupplierId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Κωδικός SKU:</label>
                <input
                  type="text"
                  value={prodSku}
                  onChange={(e) => setProdSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Συντελεστής ΦΠΑ:</label>
                <select
                  value={prodVat}
                  onChange={(e) => setProdVat(Number(e.target.value) as 13 | 24)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value={13}>ΦΠΑ 13% (Τρόφιμα / Καφές)</option>
                  <option value={24}>ΦΠΑ 24% (Αναλώσιμα / Συσκευασία)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1 font-bold">Ονομασία Προϊόντος *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="π.χ. Espresso Beans 1kg"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Συσκευασία Παραγγελίας:</label>
                <input
                  type="text"
                  value={prodPackName}
                  onChange={(e) => setProdPackName(e.target.value)}
                  placeholder="π.χ. Κιβώτιο 12lt"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Τιμή Συσκευασίας προ ΦΠΑ (€):</label>
                <input
                  type="number"
                  step="0.01"
                  value={prodPackPrice}
                  onChange={(e) => setProdPackPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Τρέχον Απόθεμα:</label>
                <input
                  type="number"
                  step="0.5"
                  value={prodStock}
                  onChange={(e) => setProdStock(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Όριο Έλλειψης (Min):</label>
                <input
                  type="number"
                  step="0.5"
                  value={prodMinThreshold}
                  onChange={(e) => setProdMinThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCatalogModalSupplierId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow"
              >
                Αποθήκευση στον Τιμοκατάλογο
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}