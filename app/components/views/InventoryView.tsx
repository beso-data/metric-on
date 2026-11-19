// app/components/views/InventoryView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import {
  Package, Plus, Trash2, Edit3, AlertTriangle, CheckCircle2,
  Search, Filter, ShoppingCart, Send, Truck, ClipboardCheck,
  DollarSign, Layers, X, Check, ArrowUpDown, Flame, Copy, PackagePlus
} from 'lucide-react';

interface EnrichedInventoryItem {
  id: number;
  sku: string;
  item: string;
  category: 'Καφέδες & Ροφήματα' | 'Γαλακτοκομικά' | 'Συσκευασία & Αναλώσιμα' | 'Κουζίνα & Snacks' | 'Καθαριστικά';
  supplier: string;
  stock: number;
  unit: 'kg' | 'lt' | 'τεμ' | 'πακ';
  threshold: number;       // Όριο ασφαλείας (Min)
  parLevel: number;        // Ιδανικό απόθεμα (Target)
  packName: string;        // π.χ. "Κιβώτιο 12lt" ή "Σακούλα 1kg"
  unitsPerPack: number;    // Πόσες μονάδες έχει η 1 συσκευασία παραγγελίας
  packPrice: number;       // Τιμή συσκευασίας προμηθευτή (προ ΦΠΑ)
  vatRate: 13 | 24;        // Συντελεστής ΦΠΑ
  lastUpdated: string;
}

const DEFAULT_RICH_INVENTORY: EnrichedInventoryItem[] = [
  {
    id: 1,
    sku: 'TAF-ESP-01',
    item: 'Espresso Beans Taf (Specialty Blend)',
    category: 'Καφέδες & Ροφήματα',
    supplier: 'Taf Coffee',
    stock: 6.5,
    unit: 'kg',
    threshold: 8,
    parLevel: 24,
    packName: 'Συσκευασία 1kg',
    unitsPerPack: 1,
    packPrice: 22.50,
    vatRate: 13,
    lastUpdated: '18/11/2026'
  },
  {
    id: 2,
    sku: 'TAF-DEC-02',
    item: 'Espresso Decaf Beans',
    category: 'Καφέδες & Ροφήματα',
    supplier: 'Taf Coffee',
    stock: 1.2,
    unit: 'kg',
    threshold: 3,
    parLevel: 6,
    packName: 'Συσκευασία 1kg',
    unitsPerPack: 1,
    packPrice: 24.00,
    vatRate: 13,
    lastUpdated: '18/11/2026'
  },
  {
    id: 3,
    sku: 'FAR-MLK-01',
    item: 'Γάλα Φρέσκο Πλήρες 3.5% Barista',
    category: 'Γαλακτοκομικά',
    supplier: 'Φάρμα Θεσσαλίας',
    stock: 14,
    unit: 'lt',
    threshold: 24,
    parLevel: 60,
    packName: 'Κιβώτιο 12lt',
    unitsPerPack: 12,
    packPrice: 15.60,
    vatRate: 13,
    lastUpdated: '18/11/2026'
  },
  {
    id: 4,
    sku: 'FAR-OAT-02',
    item: 'Γάλα Βρώμης (Oat Barista Edition)',
    category: 'Γαλακτοκομικά',
    supplier: 'Φάρμα Θεσσαλίας',
    stock: 18,
    unit: 'lt',
    threshold: 12,
    parLevel: 36,
    packName: 'Κιβώτιο 8lt',
    unitsPerPack: 8,
    packPrice: 19.20,
    vatRate: 13,
    lastUpdated: '17/11/2026'
  },
  {
    id: 5,
    sku: 'PCK-CUP-14',
    item: 'Ποτήρια Takeaway Διπλού Τοιχώματος 14oz (Freddo)',
    category: 'Συσκευασία & Αναλώσιμα',
    supplier: 'Pack & Cup Hellas',
    stock: 320,
    unit: 'τεμ',
    threshold: 500,
    parLevel: 2000,
    packName: 'Κούτα 1.000 τεμ.',
    unitsPerPack: 1000,
    packPrice: 54.00,
    vatRate: 24,
    lastUpdated: '18/11/2026'
  },
  {
    id: 6,
    sku: 'PCK-LID-90',
    item: 'Καπάκια Ποτηριών Φ90 (Μαύρα Sip)',
    category: 'Συσκευασία & Αναλώσιμα',
    supplier: 'Pack & Cup Hellas',
    stock: 1450,
    unit: 'τεμ',
    threshold: 600,
    parLevel: 2000,
    packName: 'Κούτα 1.000 τεμ.',
    unitsPerPack: 1000,
    packPrice: 28.00,
    vatRate: 24,
    lastUpdated: '16/11/2026'
  },
  {
    id: 7,
    sku: 'PCK-STR-01',
    item: 'Καλαμάκια Χάρτινα Eco (Ατομική Συσκευασία)',
    category: 'Συσκευασία & Αναλώσιμα',
    supplier: 'Pack & Cup Hellas',
    stock: 2200,
    unit: 'τεμ',
    threshold: 1000,
    parLevel: 4000,
    packName: 'Κούτα 2.500 τεμ.',
    unitsPerPack: 2500,
    packPrice: 32.50,
    vatRate: 24,
    lastUpdated: '15/11/2026'
  },
  {
    id: 8,
    sku: 'FD-BRCH-01',
    item: 'Ψωμάκια Brioche & Ψωμί Club Sandwich',
    category: 'Κουζίνα & Snacks',
    supplier: 'Αρτοποιία Κολωνακίου',
    stock: 15,
    unit: 'πακ',
    threshold: 10,
    parLevel: 30,
    packName: 'Πακέτο 10 τεμ.',
    unitsPerPack: 1,
    packPrice: 3.80,
    vatRate: 13,
    lastUpdated: '18/11/2026'
  },
  {
    id: 9,
    sku: 'FD-CHE-02',
    item: 'Τυρί Gouda & Γαλοπούλα Καπνιστή Φέτες',
    category: 'Κουζίνα & Snacks',
    supplier: 'Τροφοδοτική Αθηνών',
    stock: 2.5,
    unit: 'kg',
    threshold: 5,
    parLevel: 12,
    packName: 'Συσκευασία 2kg',
    unitsPerPack: 2,
    packPrice: 17.80,
    vatRate: 13,
    lastUpdated: '18/11/2026'
  }
];

export default function InventoryView() {
  const { employerConfig, notify } = useMetric();

  // Κύριο State Αποθήκης & Τιμοκαταλόγου
  const [items, setItems] = useState<EnrichedInventoryItem[]>(DEFAULT_RICH_INVENTORY);

  // Φίλτρα & Αναζήτηση
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'CRITICAL' | 'OK'>('ALL');

  // Λειτουργία Φυσικής Απογραφής (Stocktake Mode)
  const [isStocktakeMode, setIsStocktakeMode] = useState(false);
  const [physicalCounts, setPhysicalCounts] = useState<{ [id: number]: number }>({});

  // Προσαρμοσμένες ποσότητες παραγγελίας ανά είδος (σε συσκευασίες)
  const [customOrderPacks, setCustomOrderPacks] = useState<{ [id: number]: number }>({});

  // Modal Προσθήκης / Επεξεργασίας Υλικού
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EnrichedInventoryItem | null>(null);

  // Form states για Νέο / Επεξεργασία Υλικού
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<EnrichedInventoryItem['category']>('Καφέδες & Ροφήματα');
  const [formSupplier, setFormSupplier] = useState('Taf Coffee');
  const [formStock, setFormStock] = useState<number>(10);
  const [formUnit, setFormUnit] = useState<EnrichedInventoryItem['unit']>('kg');
  const [formThreshold, setFormThreshold] = useState<number>(5);
  const [formParLevel, setFormParLevel] = useState<number>(20);
  const [formPackName, setFormPackName] = useState('Συσκευασία 1kg');
  const [formUnitsPerPack, setFormUnitsPerPack] = useState<number>(1);
  const [formPackPrice, setFormPackPrice] = useState<number>(22.50);
  const [formVatRate, setFormVatRate] = useState<13 | 24>(13);

  // Modal Προεπισκόπησης Παραγγελίας Viber / WhatsApp
  const [orderPreviewModal, setOrderPreviewModal] = useState<{
    supplier: string;
    totalNet: number;
    totalGross: number;
    messageText: string;
    orderItems: { itemId: number; name: string; packs: number; unitsAdded: number }[];
  } | null>(null);

  // Κατηγοριοποίηση Κατάστασης Αποθέματος
  const getStockStatus = (item: EnrichedInventoryItem): 'CRITICAL' | 'LOW' | 'OK' => {
    if (item.stock <= item.threshold * 0.5 || item.stock === 0) return 'CRITICAL';
    if (item.stock <= item.threshold) return 'LOW';
    return 'OK';
  };

  // Λίστα μοναδικών προμηθευτών
  const suppliersList = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.supplier)));
  }, [items]);

  // Συνολικοί Δείκτες Αποθήκης (KPIs)
  const kpis = useMemo(() => {
    let totalInventoryValueNet = 0;
    let totalInventoryValueGross = 0;
    let lowCount = 0;
    let criticalCount = 0;
    let estimatedRestockCostNet = 0;

    items.forEach((i) => {
      const unitCostNet = i.unitsPerPack > 0 ? i.packPrice / i.unitsPerPack : i.packPrice;
      const itemValNet = i.stock * unitCostNet;
      totalInventoryValueNet += itemValNet;
      totalInventoryValueGross += itemValNet * (1 + i.vatRate / 100);

      const st = getStockStatus(i);
      if (st === 'CRITICAL') criticalCount++;
      if (st === 'LOW' || st === 'CRITICAL') {
        lowCount++;
        const missingUnits = Math.max(0, i.parLevel - i.stock);
        const packsNeeded = Math.max(1, Math.ceil(missingUnits / (i.unitsPerPack || 1)));
        const activePacks = customOrderPacks[i.id] !== undefined ? customOrderPacks[i.id] : packsNeeded;
        estimatedRestockCostNet += activePacks * i.packPrice;
      }
    });

    return {
      totalInventoryValueNet: +totalInventoryValueNet.toFixed(2),
      totalInventoryValueGross: +totalInventoryValueGross.toFixed(2),
      lowCount,
      criticalCount,
      estimatedRestockCostNet: +estimatedRestockCostNet.toFixed(2)
    };
  }, [items, customOrderPacks]);

  // Φιλτραρισμένα Είδη Πίνακα
  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      const matchesSearch =
        i.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || i.category === selectedCategory;
      const matchesSup = selectedSupplier === 'ALL' || i.supplier === selectedSupplier;
      const st = getStockStatus(i);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'LOW' && (st === 'LOW' || st === 'CRITICAL')) ||
        (statusFilter === 'CRITICAL' && st === 'CRITICAL') ||
        (statusFilter === 'OK' && st === 'OK');

      return matchesSearch && matchesCat && matchesSup && matchesStatus;
    });
  }, [items, searchQuery, selectedCategory, selectedSupplier, statusFilter]);

  // Αυτόματη Δημιουργία Καλαθιών Παραγγελίας ανά Προμηθευτή (για όσα είδη είναι σε έλλειψη)
  const supplierOrderCarts = useMemo(() => {
    const grouped: {
      [supplier: string]: {
        supplier: string;
        lines: {
          inv: EnrichedInventoryItem;
          status: 'CRITICAL' | 'LOW';
          recommendedPacks: number;
          packsToOrder: number;
          lineNetCost: number;
          lineGrossCost: number;
        }[];
        totalNet: number;
        totalGross: number;
      };
    } = {};

    items.forEach((inv) => {
      const st = getStockStatus(inv);
      const hasCustomOverride = customOrderPacks[inv.id] !== undefined && customOrderPacks[inv.id] > 0;
      if (st === 'LOW' || st === 'CRITICAL' || hasCustomOverride) {
        const missingUnits = Math.max(0, inv.parLevel - inv.stock);
        const recPacks = Math.max(1, Math.ceil(missingUnits / (inv.unitsPerPack || 1)));
        const packsToOrder = customOrderPacks[inv.id] !== undefined ? customOrderPacks[inv.id] : recPacks;

        if (packsToOrder <= 0) return;

        const lineNet = +(packsToOrder * inv.packPrice).toFixed(2);
        const lineGross = +(lineNet * (1 + inv.vatRate / 100)).toFixed(2);

        if (!grouped[inv.supplier]) {
          grouped[inv.supplier] = {
            supplier: inv.supplier,
            lines: [],
            totalNet: 0,
            totalGross: 0
          };
        }

        grouped[inv.supplier].lines.push({
          inv,
          status: st === 'CRITICAL' ? 'CRITICAL' : 'LOW',
          recommendedPacks: recPacks,
          packsToOrder,
          lineNetCost: lineNet,
          lineGrossCost: lineGross
        });
        grouped[inv.supplier].totalNet = +(grouped[inv.supplier].totalNet + lineNet).toFixed(2);
        grouped[inv.supplier].totalGross = +(grouped[inv.supplier].totalGross + lineGross).toFixed(2);
      }
    });

    return Object.values(grouped);
  }, [items, customOrderPacks]);

  // Άμεση αυξομείωση στοκ (+ / -)
  const handleQuickAdjustStock = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nextStock = Math.max(0, +(i.stock + delta).toFixed(2));
          return { ...i, stock: nextStock, lastUpdated: new Date().toLocaleDateString('el-GR') };
        }
        return i;
      })
    );
    notify(`✔ Το απόθεμα ενημερώθηκε (${delta > 0 ? `+${delta}` : delta}).`);
  };

  // Καταγραφή Φθοράς / Απώλειας (Waste)
  const handleRecordWaste = (inv: EnrichedInventoryItem) => {
    const step = inv.unit === 'τεμ' ? 10 : 1;
    if (inv.stock <= 0) {
      notify('⚠️ Το απόθεμα είναι ήδη μηδενικό.');
      return;
    }
    const unitCost = inv.unitsPerPack > 0 ? inv.packPrice / inv.unitsPerPack : inv.packPrice;
    const lostValue = +(step * unitCost).toFixed(2);
    setItems((prev) =>
      prev.map((i) =>
        i.id === inv.id
          ? { ...i, stock: Math.max(0, +(i.stock - step).toFixed(2)), lastUpdated: new Date().toLocaleDateString('el-GR') }
          : i
      )
    );
    notify(`🔥 Καταγράφηκε φθορά -${step} ${inv.unit} στο "${inv.item}" (Κόστος απώλειας: ${lostValue.toFixed(2)} €).`);
  };

  // Άνοιγμα Modal για Νέο Υλικό
  const handleOpenNewModal = () => {
    setEditingItem(null);
    setFormSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory('Καφέδες & Ροφήματα');
    setFormSupplier('Taf Coffee');
    setFormStock(10);
    setFormUnit('kg');
    setFormThreshold(5);
    setFormParLevel(20);
    setFormPackName('Συσκευασία 1kg');
    setFormUnitsPerPack(1);
    setFormPackPrice(20.0);
    setFormVatRate(13);
    setShowItemModal(true);
  };

  // Άνοιγμα Modal για Επεξεργασία Υπάρχοντος Υλικού
  const handleOpenEditModal = (item: EnrichedInventoryItem) => {
    setEditingItem(item);
    setFormSku(item.sku);
    setFormName(item.item);
    setFormCategory(item.category);
    setFormSupplier(item.supplier);
    setFormStock(item.stock);
    setFormUnit(item.unit);
    setFormThreshold(item.threshold);
    setFormParLevel(item.parLevel);
    setFormPackName(item.packName);
    setFormUnitsPerPack(item.unitsPerPack);
    setFormPackPrice(item.packPrice);
    setFormVatRate(item.vatRate);
    setShowItemModal(true);
  };

  // Αποθήκευση Υλικού (Create / Update)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      notify('⚠️ Συμπληρώστε την ονομασία του υλικού.');
      return;
    }

    const payload: EnrichedInventoryItem = {
      id: editingItem ? editingItem.id : Date.now(),
      sku: formSku.trim() || 'SKU-000',
      item: formName.trim(),
      category: formCategory,
      supplier: formSupplier.trim() || 'Γενικός Προμηθευτής',
      stock: Number(formStock),
      unit: formUnit,
      threshold: Number(formThreshold),
      parLevel: Number(formParLevel),
      packName: formPackName.trim() || 'Συσκευασία',
      unitsPerPack: Math.max(0.01, Number(formUnitsPerPack)),
      packPrice: Math.max(0, Number(formPackPrice)),
      vatRate: formVatRate,
      lastUpdated: new Date().toLocaleDateString('el-GR')
    };

    if (editingItem) {
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? payload : i)));
      notify(`✔ Το είδος "${payload.item}" ενημερώθηκε επιτυχώς!`);
    } else {
      setItems((prev) => [payload, ...prev]);
      notify(`✔ Το νέο είδος "${payload.item}" προστέθηκε στην αποθήκη & στον τιμοκατάλογο!`);
    }

    setShowItemModal(false);
  };

  // Διαγραφή Υλικού
  const handleDeleteItem = (id: number, name: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    notify(`🗑️ Το είδος "${name}" διαγράφηκε από την αποθήκη.`);
  };

  // Έναρξη / Οριστικοποίηση Φυσικής Απογραφής
  const handleToggleStocktake = () => {
    if (!isStocktakeMode) {
      const initialMap: { [id: number]: number } = {};
      items.forEach((i) => {
        initialMap[i.id] = i.stock;
      });
      setPhysicalCounts(initialMap);
      setIsStocktakeMode(true);
      notify('📋 Ενεργοποιήθηκε η Λειτουργία Φυσικής Απογραφής! Πληκτρολογήστε τις πραγματικές ποσότητες ραφιού.');
    } else {
      // Αποθήκευση νέων ποσοτήτων απογραφής
      setItems((prev) =>
        prev.map((i) => ({
          ...i,
          stock: physicalCounts[i.id] !== undefined ? physicalCounts[i.id] : i.stock,
          lastUpdated: new Date().toLocaleDateString('el-GR')
        }))
      );
      setIsStocktakeMode(false);
      notify('✔ Η Φυσική Απογραφή οριστικοποιήθηκε και τα αποθέματα συγχρονίστηκαν!');
    }
  };

  // Δημιουργία Μηνύματος Παραγγελίας Viber / WhatsApp για Προμηθευτή
  const handleOpenSupplierOrderModal = (cart: typeof supplierOrderCarts[0]) => {
    const linesText = cart.lines
      .map(
        (l) =>
          `• ${l.packsToOrder}x ${l.inv.packName} - ${l.inv.item} (${l.inv.packPrice.toFixed(2)}€/συσκ.)`
      )
      .join('\n');

    const msg = [
      `Καλησπέρα σας από ${employerConfig?.storeName || 'blysscafe Athens'} (${employerConfig?.legalTitle || 'ΑΦΜ: ' + employerConfig?.afm}).`,
      `Θα θέλαμε να καταχωρήσουμε τη παρακάτω παραγγελία τροφοδοσίας:`,
      `----------------------------------------`,
      linesText,
      `----------------------------------------`,
      `Εκτιμώμενη Καθαρή Αξία: ${cart.totalNet.toFixed(2)} € (Με ΦΠΑ: ${cart.totalGross.toFixed(2)} €)`,
      `Διεύθυνση Παράδοσης: ${employerConfig?.addressStreet || 'Κολωνάκι, Αθήνα'}`
    ].join('\n');

    setOrderPreviewModal({
      supplier: cart.supplier,
      totalNet: cart.totalNet,
      totalGross: cart.totalGross,
      messageText: msg,
      orderItems: cart.lines.map((l) => ({
        itemId: l.inv.id,
        name: l.inv.item,
        packs: l.packsToOrder,
        unitsAdded: +(l.packsToOrder * l.inv.unitsPerPack).toFixed(2)
      }))
    });
  };

  // Παραλαβή Παραγγελίας Προμηθευτή (Αυτόματη Προσθήκη Ποσοτήτων στο Στοκ!)
  const handleReceiveSupplierOrder = (cart: typeof supplierOrderCarts[0]) => {
    setItems((prev) =>
      prev.map((item) => {
        const line = cart.lines.find((l) => l.inv.id === item.id);
        if (line) {
          const addedUnits = +(line.packsToOrder * item.unitsPerPack).toFixed(2);
          return {
            ...item,
            stock: +(item.stock + addedUnits).toFixed(2),
            lastUpdated: new Date().toLocaleDateString('el-GR')
          };
        }
        return item;
      })
    );

    // Καθαρισμός custom ποσοτήτων για αυτόν τον προμηθευτή
    const nextCustom = { ...customOrderPacks };
    cart.lines.forEach((l) => {
      delete nextCustom[l.inv.id];
    });
    setCustomOrderPacks(nextCustom);

    notify(`🚚 Η παραγγελία από "${cart.supplier}" παραλήφθηκε! Τα αποθέματα αυξήθηκαν αυτόματα στην αποθήκη.`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Header & Primary Actions */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Package className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">
                Αποθήκη, Τιμοκατάλογος Α’ Υλών & Έξυπνες Παραγγελίες
              </h2>
              {kpis.criticalCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
                  {kpis.criticalCount} Κρίσιμες Ελλείψεις!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Πλήρης έλεγχος αποθεμάτων, αντιστοίχιση τιμής συσκευασίας προμηθευτή με κόστος μονάδας (kg/lt/τεμ) και αυτόματη παραγγελιοληψία.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleStocktake}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 border transition ${
                isStocktakeMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <ClipboardCheck className="h-4 w-4" />
              <span>{isStocktakeMode ? '✔ Οριστικοποίηση Απογραφής' : 'Φυσική Απογραφή Ραφιού'}</span>
            </button>

            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition"
            >
              <Plus className="h-4 w-4" />
              <span>+ Νέο Υλικό / Είδος Αποθήκης</span>
            </button>
          </div>
        </div>

        {/* 4 Financial & Inventory KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Συνολική Αξία Αποθήκης (Δεσμευμένο Κεφάλαιο)</span>
            <p className="text-2xl font-black text-emerald-400">{kpis.totalInventoryValueNet.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              Με ΦΠΑ: {kpis.totalInventoryValueGross.toFixed(2)} € ({items.length} ενεργοί κωδικοί SKU)
            </span>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'LOW' ? 'ALL' : 'LOW')}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 block">Είδη σε Έλλειψη / Κάτω από Όριο</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">
              {kpis.lowCount} Είδη
            </p>
            <span className="text-[10px] text-red-400 font-bold block">
              Εκ των οποίων {kpis.criticalCount} σε κρίσιμη έλλειψη (Κλικ για φίλτρο)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Εκτιμώμενο Κόστος Αναπλήρωσης (Par Level)</span>
            <p className="text-2xl font-black text-blue-400">{kpis.estimatedRestockCostNet.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">
              Για πλήρη κάλυψη όλων των ελλείψεων ({supplierOrderCarts.length} προμηθευτές)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Ενεργοί Προμηθευτές Τροφοδοσίας</span>
            <p className="text-2xl font-black text-white">{suppliersList.length} Εταιρείες</p>
            <span className="text-[10px] text-purple-400 block">
              Συνδεδεμένοι με αυτόματο καλάθι Viber / WhatsApp
            </span>
          </div>
        </div>

        {/* Search & Interactive Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs pt-1">
          <div className="md:col-span-4 relative">
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Αναζήτηση υλικού, κωδικού SKU ή προμηθευτή..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:outline-none"
            >
              <option value="ALL">Όλες οι Κατηγορίες ({items.length})</option>
              <option value="Καφέδες & Ροφήματα">Καφέδες & Ροφήματα</option>
              <option value="Γαλακτοκομικά">Γαλακτοκομικά</option>
              <option value="Συσκευασία & Αναλώσιμα">Συσκευασία & Αναλώσιμα</option>
              <option value="Κουζίνα & Snacks">Κουζίνα & Snacks</option>
              <option value="Καθαριστικά">Καθαριστικά</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:outline-none"
            >
              <option value="ALL">Όλοι οι Προμηθευτές</option>
              {suppliersList.map((sup) => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Όλα ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('LOW')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                statusFilter === 'LOW' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              Ελλείψεις ({kpis.lowCount})
            </button>
            <button
              onClick={() => setStatusFilter('CRITICAL')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                statusFilter === 'CRITICAL' ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-500/10'
              }`}
            >
              Κρίσιμα ({kpis.criticalCount})
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory & Price Catalog Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>1. Αναλυτικός Πίνακας Αποθεμάτων & Τιμοκατάλογος Α’ Υλών</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Χρησιμοποιήστε τα κουμπιά - / + για άμεση διόρθωση, το εικονίδιο φλόγας για δήλωση φθοράς ή το μολύβι για αλλαγή τιμών.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Εμφανίζονται {filteredItems.length} από {items.length} είδη
          </span>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3.5">Κωδικός / Προϊόν</th>
                <th className="p-3.5">Κατηγορία & Προμηθευτής</th>
                <th className="p-3.5 text-center">Τρέχον Απόθεμα</th>
                <th className="p-3.5 text-center">Όριο / Στόχος</th>
                <th className="p-3.5 text-right">Τιμή Συσκευασίας</th>
                <th className="p-3.5 text-right">Κόστος Μονάδας</th>
                <th className="p-3.5 text-right">Αξία Στοκ (€)</th>
                <th className="p-3.5 text-center">Κατάσταση</th>
                <th className="p-3.5 text-right">Έλεγχος & Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((inv) => {
                const status = getStockStatus(inv);
                const unitCostNet = inv.unitsPerPack > 0 ? inv.packPrice / inv.unitsPerPack : inv.packPrice;
                const stockValueNet = +(inv.stock * unitCostNet).toFixed(2);
                const step = inv.unit === 'τεμ' ? 50 : 1;
                const fillPct = Math.min(100, Math.round((inv.stock / (inv.parLevel || 1)) * 100));

                return (
                  <tr
                    key={inv.id}
                    className={`transition ${
                      status === 'CRITICAL'
                        ? 'bg-red-500/5 hover:bg-red-500/10'
                        : status === 'LOW'
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : 'hover:bg-slate-900/40'
                    }`}
                  >
                    {/* SKU & Name */}
                    <td className="p-3.5">
                      <span className="font-mono text-[10px] text-slate-500 block">{inv.sku}</span>
                      <span className="font-extrabold text-white text-xs block">{inv.item}</span>
                      <span className="text-[10px] text-slate-500">Ενημ: {inv.lastUpdated}</span>
                    </td>

                    {/* Category & Supplier */}
                    <td className="p-3.5">
                      <span className="text-[11px] font-bold text-emerald-400 block">{inv.supplier}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block mt-0.5">
                        {inv.category}
                      </span>
                    </td>

                    {/* Current Stock & Quick +/- or Stocktake Input */}
                    <td className="p-3.5 text-center">
                      {isStocktakeMode ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              value={physicalCounts[inv.id] ?? inv.stock}
                              onChange={(e) =>
                                setPhysicalCounts({
                                  ...physicalCounts,
                                  [inv.id]: parseFloat(e.target.value) || 0
                                })
                              }
                              className="w-20 px-2 py-1 rounded bg-slate-900 border border-amber-500 text-amber-300 font-mono font-bold text-center"
                            />
                            <span className="text-[11px] text-slate-400">{inv.unit}</span>
                          </div>
                          {physicalCounts[inv.id] !== undefined && physicalCounts[inv.id] !== inv.stock && (
                            <span className={`text-[10px] font-mono font-bold ${
                              physicalCounts[inv.id] - inv.stock >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              Διαφορά: {(physicalCounts[inv.id] - inv.stock).toFixed(1)} {inv.unit}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickAdjustStock(inv.id, -step)}
                              title={`Αφαίρεση ${step} ${inv.unit}`}
                              className="h-6 w-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono font-bold flex items-center justify-center transition"
                            >
                              -
                            </button>
                            <span
                              className={`font-mono font-black text-sm min-w-[68px] text-center ${
                                status === 'CRITICAL'
                                  ? 'text-red-400'
                                  : status === 'LOW'
                                    ? 'text-amber-400'
                                    : 'text-emerald-400'
                              }`}
                            >
                              {inv.stock} {inv.unit}
                            </span>
                            <button
                              onClick={() => handleQuickAdjustStock(inv.id, step)}
                              title={`Προσθήκη ${step} ${inv.unit}`}
                              className="h-6 w-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono font-bold flex items-center justify-center transition"
                            >
                              +
                            </button>
                          </div>
                          {/* Progress Bar vs Par Level */}
                          <div className="w-24 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                status === 'CRITICAL'
                                  ? 'bg-red-500'
                                  : status === 'LOW'
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-500'
                              }`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Threshold & Target Par Level */}
                    <td className="p-3.5 text-center font-mono">
                      <span className="text-slate-300 block">Όριο: {inv.threshold} {inv.unit}</span>
                      <span className="text-[10px] text-slate-500 block">Στόχος: {inv.parLevel} {inv.unit}</span>
                    </td>

                    {/* Supplier Pack Price */}
                    <td className="p-3.5 text-right font-mono">
                      <span className="text-white font-bold block">{inv.packPrice.toFixed(2)} €</span>
                      <span className="text-[10px] text-slate-400 block">
                        {inv.packName} (ΦΠΑ {inv.vatRate}%)
                      </span>
                    </td>

                    {/* Exact Unit Cost (Net) */}
                    <td className="p-3.5 text-right font-mono">
                      <span className="text-blue-400 font-bold block">
                        {unitCostNet < 0.1 ? unitCostNet.toFixed(3) : unitCostNet.toFixed(2)} € / {inv.unit}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Με ΦΠΑ: {(unitCostNet * (1 + inv.vatRate / 100)).toFixed(2)} €
                      </span>
                    </td>

                    {/* Tied Capital / Stock Value */}
                    <td className="p-3.5 text-right font-mono">
                      <span className="text-emerald-400 font-extrabold text-sm">{stockValueNet.toFixed(2)} €</span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5 text-center">
                      {status === 'CRITICAL' && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-red-500/15 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Κρίσιμη Έλλειψη</span>
                        </span>
                      )}
                      {status === 'LOW' && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Προς Παραγγελία</span>
                        </span>
                      )}
                      {status === 'OK' && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Επαρκές</span>
                        </span>
                      )}
                    </td>

                    {/* Action Controls */}
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleRecordWaste(inv)}
                        title="Δήλωση Φθοράς / Απώλειας (Waste)"
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/25 transition"
                      >
                        <Flame className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(inv)}
                        title="Επεξεργασία Τιμής & Στοιχείων"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(inv.id, inv.item)}
                        title="Διαγραφή Είδους"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 transition"
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

      {/* Section 2: Smart Supplier Restock Carts (Αυτόματες Προτάσεις Παραγγελίας ανά Προμηθευτή) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-400" />
              <span>2. Έξυπνο Καλάθι Παραγγελιών Αναπλήρωσης (Ανά Προμηθευτή)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Το σύστημα εντοπίζει αυτόματα όσα είδη έπεσαν κάτω από το όριο ασφαλείας και υπολογίζει πόσες συσκευασίες χρειάζεστε για να φτάσετε στο Par Level.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs">
            Σύνολο Αναπλήρωσης: {kpis.estimatedRestockCostNet.toFixed(2)} € (προ ΦΠΑ)
          </span>
        </div>

        {supplierOrderCarts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Όλα τα αποθέματα βρίσκονται πάνω από τα όρια ασφαλείας!</p>
            <p className="text-xs text-slate-400">Δεν απαιτείται επείγουσα παραγγελία προς κάποιον προμηθευτή αυτή τη στιγμή.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {supplierOrderCarts.map((cart) => (
              <div
                key={cart.supplier}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                        Αυτόματη Πρόταση Παραγγελίας
                      </span>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Truck className="h-4 w-4 text-emerald-400" />
                        <span>{cart.supplier}</span>
                      </h4>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-base font-black text-emerald-400 block">{cart.totalNet.toFixed(2)} €</span>
                      <span className="text-[10px] text-slate-500 block">Με ΦΠΑ: {cart.totalGross.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Order Lines inside Supplier Card */}
                  <div className="space-y-2">
                    {cart.lines.map((line) => (
                      <div
                        key={line.inv.id}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{line.inv.item}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                line.status === 'CRITICAL'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              Υπόλοιπο: {line.inv.stock} {line.inv.unit}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {line.inv.packName} × {line.inv.packPrice.toFixed(2)} €
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400">Συσκ:</span>
                            <input
                              type="number"
                              min="0"
                              value={line.packsToOrder}
                              onChange={(e) =>
                                setCustomOrderPacks({
                                  ...customOrderPacks,
                                  [line.inv.id]: Math.max(0, parseInt(e.target.value) || 0)
                                })
                              }
                              className="w-12 bg-transparent text-white font-mono font-bold text-right focus:outline-none"
                            />
                          </div>
                          <span className="font-mono font-bold text-emerald-400 min-w-[65px] text-right">
                            {line.lineNetCost.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supplier Order Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-900">
                  <button
                    onClick={() => handleOpenSupplierOrderModal(cart)}
                    className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Αποστολή Viber / WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleReceiveSupplierOrder(cart)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <PackagePlus className="h-4 w-4 text-emerald-400" />
                    <span>Παραλαβή Παραγγελίας (+Στοκ)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Προσθήκη / Επεξεργασία Είδους Αποθήκης & Τιμοκαταλόγου */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveItem}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl space-y-5 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-400" />
                <span>
                  {editingItem ? `Επεξεργασία Είδους: ${editingItem.item}` : 'Καταχώρηση Νέου Υλικού & Τιμοκαταλόγου'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Κωδικός SKU:</label>
                <input
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1 font-bold">Ονομασία Προϊόντος / Α’ Ύλης *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="π.χ. Espresso Beans Taf 1kg"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Κατηγορία:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Καφέδες & Ροφήματα">Καφέδες & Ροφήματα</option>
                  <option value="Γαλακτοκομικά">Γαλακτοκομικά</option>
                  <option value="Συσκευασία & Αναλώσιμα">Συσκευασία & Αναλώσιμα</option>
                  <option value="Κουζίνα & Snacks">Κουζίνα & Snacks</option>
                  <option value="Καθαριστικά">Καθαριστικά</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1 font-bold">Προμηθευτής:</label>
                <input
                  type="text"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  placeholder="π.χ. Taf Coffee"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold"
                />
              </div>
            </div>

            {/* Stock Quantities Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-extrabold text-slate-300 block">
                Αποθέματα & Όρια Ασφαλείας (Alerts)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Τρέχον Στοκ:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formStock}
                    onChange={(e) => setFormStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Μονάδα Μέτρησης:</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="kg">Κιλά (kg)</option>
                    <option value="lt">Λίτρα (lt)</option>
                    <option value="τεμ">Τεμάχια (τεμ)</option>
                    <option value="πακ">Πακέτα (πακ)</option>
                  </select>
                </div>
                <div>
                  <label className="text-amber-400 block mb-1 font-bold">Όριο Έλλειψης (Min):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-emerald-400 block mb-1 font-bold">Στόχος (Par Level):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formParLevel}
                    onChange={(e) => setFormParLevel(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Packaging Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-300">
                  Τιμοκατάλογος Προμηθευτή & Αυτόματος Υπολογισμός Μονάδας
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  Κόστος Μονάδας: {(formUnitsPerPack > 0 ? formPackPrice / formUnitsPerPack : formPackPrice).toFixed(3)} € / {formUnit}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Περιγραφή Συσκευασίας Παραγγελίας:</label>
                  <input
                    type="text"
                    value={formPackName}
                    onChange={(e) => setFormPackName(e.target.value)}
                    placeholder="π.χ. Κιβώτιο 12lt ή Κούτα 1000 τεμ."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Μονάδες / Συσκευασία:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formUnitsPerPack}
                    onChange={(e) => setFormUnitsPerPack(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Τιμή Συσκευασίας (€):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPackPrice}
                    onChange={(e) => setFormPackPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/50 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow"
              >
                {editingItem ? 'Αποθήκευση Αλλαγών' : 'Καταχώρηση στην Αποθήκη'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Προεπισκόπηση & Αποστολή Παραγγελίας Προμηθευτή (Viber / WhatsApp) */}
      {orderPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-purple-400" />
                <span>Αποστολή Παραγγελίας: {orderPreviewModal.supplier}</span>
              </h3>
              <button
                onClick={() => setOrderPreviewModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-400 block font-bold">
                Μήνυμα Παραγγελίας (Μπορείτε να το επεξεργαστείτε πριν την αποστολή):
              </label>
              <textarea
                rows={8}
                value={orderPreviewModal.messageText}
                onChange={(e) =>
                  setOrderPreviewModal({ ...orderPreviewModal, messageText: e.target.value })
                }
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(orderPreviewModal.messageText);
                  notify('📋 Το κείμενο της παραγγελίας αντιγράφηκε στο πρόχειρο!');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Αντιγραφή Κειμένου</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(orderPreviewModal.messageText);
                    window.open(`https://wa.me/?text=${encoded}`, '_blank');
                    notify(`📲 Άνοιξε το WhatsApp για αποστολή στον προμηθευτή "${orderPreviewModal.supplier}"!`);
                    setOrderPreviewModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(orderPreviewModal.messageText);
                    window.open(`viber://forward?text=${encoded}`, '_blank');
                    notify(`💜 Η παραγγελία στάλθηκε μέσω Viber στον προμηθευτή "${orderPreviewModal.supplier}"!`);
                    setOrderPreviewModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow"
                >
                  Αποστολή με Viber
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}