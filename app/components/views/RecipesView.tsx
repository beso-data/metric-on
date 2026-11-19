// app/components/views/RecipesView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import {
  Utensils, Plus, Trash2, Edit3, X, Layers, Search,
  AlertTriangle, CheckCircle2, Sparkles, Copy, Calculator,
  TrendingUp, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';

interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: 'gr' | 'ml' | 'τεμ' | 'σετ';
  unitCost: number; // κόστος ανά μονάδα (π.χ. ανά gr ή ml ή τεμ)
}

interface FullRecipe {
  id: number;
  code: string;
  name: string;
  category: 'Καφέδες & Ροφήματα' | 'Snacks & Φαγητό' | 'Ροφήματα & Χυμοί' | 'Γλυκά & Σφολιάτες';
  sellingPrice: number;
  targetMarginPct: number; // Στόχος περιθωρίου κέρδους %
  prepTimeSec: number;
  notes?: string;
  ingredients: RecipeIngredient[];
}

const INITIAL_RECIPES: FullRecipe[] = [
  {
    id: 1,
    code: 'REC-001',
    name: 'Freddo Espresso',
    category: 'Καφέδες & Ροφήματα',
    sellingPrice: 3.50,
    targetMarginPct: 80,
    prepTimeSec: 45,
    notes: 'Διπλή δόση specialty blend, πάγος και χτύπημα αφρογάλατος/κρέμας.',
    ingredients: [
      { id: '101', name: 'Καφές Espresso (Beans)', quantity: 18, unit: 'gr', unitCost: 0.022 },
      { id: '102', name: 'Ποτήρι Takeaway 400ml', quantity: 1, unit: 'τεμ', unitCost: 0.08 },
      { id: '103', name: 'Καπάκι Διάφανο', quantity: 1, unit: 'τεμ', unitCost: 0.04 },
      { id: '104', name: 'Καλαμάκι & Χαρτοπετσέτα', quantity: 1, unit: 'σετ', unitCost: 0.03 }
    ]
  },
  {
    id: 2,
    code: 'REC-002',
    name: 'Freddo Cappuccino',
    category: 'Καφέδες & Ροφήματα',
    sellingPrice: 3.90,
    targetMarginPct: 75,
    prepTimeSec: 60,
    notes: '18gr espresso + 140ml φρέσκο γάλα για κρύο αφρόγαλα.',
    ingredients: [
      { id: '201', name: 'Καφές Espresso (Beans)', quantity: 18, unit: 'gr', unitCost: 0.022 },
      { id: '202', name: 'Γάλα Φρέσκο 3.5%', quantity: 140, unit: 'ml', unitCost: 0.003 },
      { id: '203', name: 'Ποτήρι Takeaway 400ml', quantity: 1, unit: 'τεμ', unitCost: 0.08 },
      { id: '204', name: 'Καπάκι Espresso', quantity: 1, unit: 'τεμ', unitCost: 0.04 },
      { id: '205', name: 'Καλαμάκι & Χαρτοπετσέτα', quantity: 1, unit: 'σετ', unitCost: 0.03 }
    ]
  },
  {
    id: 3,
    code: 'REC-003',
    name: 'Club Sandwich Classic',
    category: 'Snacks & Φαγητό',
    sellingPrice: 7.50,
    targetMarginPct: 58,
    prepTimeSec: 240,
    notes: 'Σερβίρεται με πατάτες τηγανητές και σως σε κουτί takeaway.',
    ingredients: [
      { id: '301', name: 'Ψωμί Τοστ (4 φέτες)', quantity: 140, unit: 'gr', unitCost: 0.004 },
      { id: '302', name: 'Ζαμπόν & Μπέικον', quantity: 90, unit: 'gr', unitCost: 0.012 },
      { id: '303', name: 'Τυρί Gouda σε φέτες', quantity: 60, unit: 'gr', unitCost: 0.010 },
      { id: '304', name: 'Ντομάτα & Μαρούλι', quantity: 80, unit: 'gr', unitCost: 0.003 },
      { id: '305', name: 'Πατάτες Τηγανητές (μερίδα)', quantity: 150, unit: 'gr', unitCost: 0.003 },
      { id: '306', name: 'Συσκευασία Takeaway Box', quantity: 1, unit: 'τεμ', unitCost: 0.35 }
    ]
  }
];

const INGREDIENT_PRESETS: { label: string; name: string; quantity: number; unit: RecipeIngredient['unit']; unitCost: number }[] = [
  { label: 'Espresso Beans (18gr)', name: 'Καφές Espresso (Beans)', quantity: 18, unit: 'gr', unitCost: 0.022 },
  { label: 'Γάλα Φρέσκο (140ml)', name: 'Γάλα Φρέσκο 3.5%', quantity: 140, unit: 'ml', unitCost: 0.003 },
  { label: 'Γάλα Βρώμης (150ml)', name: 'Γάλα Βρώμης Barista', quantity: 150, unit: 'ml', unitCost: 0.0024 },
  { label: 'Ποτήρι 400ml (1 τεμ)', name: 'Ποτήρι Takeaway 400ml', quantity: 1, unit: 'τεμ', unitCost: 0.08 },
  { label: 'Καπάκι (1 τεμ)', name: 'Καπάκι Διάφανο', quantity: 1, unit: 'τεμ', unitCost: 0.04 },
  { label: 'Σετ Καλαμάκι/Χαρτοπετσέτα', name: 'Καλαμάκι & Χαρτοπετσέτα', quantity: 1, unit: 'σετ', unitCost: 0.03 }
];

export default function RecipesView() {
  const { notify, setOwnerTab } = useMetric();

  const [recipes, setRecipes] = useState<FullRecipe[]>(INITIAL_RECIPES);

  // Φίλτρα & Αναζήτηση
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [marginFilter, setMarginFilter] = useState<'ALL' | 'LOW_MARGIN' | 'HIGH_MARGIN'>('ALL');
  const [channelView, setChannelView] = useState<'STORE' | 'DELIVERY_15'>('STORE');

  // Πολλαπλασιαστής δοκιμαστικής παραγωγής (Batch Simulation) ανά συνταγή: { [recipeId]: batchQty }
  const [batchMultiplier, setBatchMultiplier] = useState<{ [recipeId: number]: number }>({});

  // Modal Δημιουργίας / Επεξεργασίας Συνταγής
  const [showModal, setShowModal] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<number | null>(null);
  const [formCode, setFormCode] = useState('REC-004');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<FullRecipe['category']>('Καφέδες & Ροφήματα');
  const [formSellingPrice, setFormSellingPrice] = useState<number>(3.80);
  const [formTargetMargin, setFormTargetMargin] = useState<number>(75);
  const [formPrepTime, setFormPrepTime] = useState<number>(60);
  const [formNotes, setFormNotes] = useState('');
  const [formIngredients, setFormIngredients] = useState<RecipeIngredient[]>([
    { id: '1', name: 'Καφές Espresso (Beans)', quantity: 18, unit: 'gr', unitCost: 0.022 }
  ]);

  // Βοηθητικός υπολογισμός οικονομικών μιας συνταγής
  const computeRecipeEconomics = (recipe: FullRecipe) => {
    const bomCost = +recipe.ingredients.reduce((acc, ing) => acc + (ing.quantity * ing.unitCost), 0).toFixed(2);
    // Αν επιλεγεί κανάλι Delivery (15% προμήθεια πλατφόρμας), η καθαρή είσπραξη μειώνεται κατά 15%
    const effectivePrice = channelView === 'DELIVERY_15'
      ? +(recipe.sellingPrice * 0.85).toFixed(2)
      : recipe.sellingPrice;
    const grossProfit = +(effectivePrice - bomCost).toFixed(2);
    const marginPct = effectivePrice > 0 ? +((grossProfit / effectivePrice) * 100).toFixed(1) : 0;
    const isBelowTarget = marginPct < recipe.targetMarginPct;

    // Προτεινόμενη τιμή με βάση τον στόχο margin % και το κανάλι
    const denom = 1 - (recipe.targetMarginPct / 100);
    const rawSuggested = denom > 0 ? bomCost / denom : recipe.sellingPrice;
    const suggestedPrice = channelView === 'DELIVERY_15'
      ? +(rawSuggested / 0.85).toFixed(2)
      : +rawSuggested.toFixed(2);

    return { bomCost, effectivePrice, grossProfit, marginPct, isBelowTarget, suggestedPrice };
  };

  // Συνολικά KPIs καταλόγου συνταγών
  const catalogKpis = useMemo(() => {
    if (recipes.length === 0) {
      return { totalCount: 0, avgMargin: 0, avgBomCost: 0, belowTargetCount: 0 };
    }
    let marginSum = 0;
    let bomSum = 0;
    let belowCount = 0;

    recipes.forEach((r) => {
      const econ = computeRecipeEconomics(r);
      marginSum += econ.marginPct;
      bomSum += econ.bomCost;
      if (econ.isBelowTarget) belowCount++;
    });

    return {
      totalCount: recipes.length,
      avgMargin: +(marginSum / recipes.length).toFixed(1),
      avgBomCost: +(bomSum / recipes.length).toFixed(2),
      belowTargetCount: belowCount
    };
  }, [recipes, channelView]);

  // Φιλτραρισμένες Συνταγές
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q));
      const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const econ = computeRecipeEconomics(r);
      const matchesMargin =
        marginFilter === 'ALL' ||
        (marginFilter === 'LOW_MARGIN' && econ.isBelowTarget) ||
        (marginFilter === 'HIGH_MARGIN' && !econ.isBelowTarget);
      return matchesSearch && matchesCat && matchesMargin;
    });
  }, [recipes, searchQuery, selectedCategory, marginFilter, channelView]);

  // Άνοιγμα Modal για Νέα Συνταγή
  const handleOpenCreateModal = () => {
    setEditingRecipeId(null);
    setFormCode(`REC-00${recipes.length + 1}`);
    setFormName('');
    setFormCategory('Καφέδες & Ροφήματα');
    setFormSellingPrice(3.80);
    setFormTargetMargin(75);
    setFormPrepTime(60);
    setFormNotes('');
    setFormIngredients([
      { id: Date.now().toString(), name: 'Καφές Espresso (Beans)', quantity: 18, unit: 'gr', unitCost: 0.022 }
    ]);
    setShowModal(true);
  };

  // Άνοιγμα Modal για Επεξεργασία Υπάρχουσας Συνταγής
  const handleOpenEditModal = (recipe: FullRecipe) => {
    setEditingRecipeId(recipe.id);
    setFormCode(recipe.code);
    setFormName(recipe.name);
    setFormCategory(recipe.category);
    setFormSellingPrice(recipe.sellingPrice);
    setFormTargetMargin(recipe.targetMarginPct);
    setFormPrepTime(recipe.prepTimeSec);
    setFormNotes(recipe.notes || '');
    setFormIngredients(recipe.ingredients.map((i) => ({ ...i })));
    setShowModal(true);
  };

  // Αντιγραφή / Κλωνοποίηση Συνταγής (π.χ. Freddo Espresso -> Freddo Espresso Double)
  const handleDuplicateRecipe = (recipe: FullRecipe) => {
    const cloned: FullRecipe = {
      ...recipe,
      id: Date.now(),
      code: `REC-00${recipes.length + 1}`,
      name: `${recipe.name} (Αντίγραφο)`,
      ingredients: recipe.ingredients.map((ing, idx) => ({
        ...ing,
        id: `${Date.now()}-${idx}`
      }))
    };
    setRecipes([cloned, ...recipes]);
    notify(`📋 Δημιουργήθηκε αντίγραφο της συνταγής "${recipe.name}" για γρήγορη προσαρμογή!`);
  };

  // Γρήγορη αύξηση τιμής καταλόγου (+0.20€) απευθείας από την κάρτα
  const handleQuickPriceBump = (id: number, delta: number) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, sellingPrice: Math.max(0.1, +(r.sellingPrice + delta).toFixed(2)) }
          : r
      )
    );
    notify(`💶 Η τιμή καταλόγου ενημερώθηκε (${delta > 0 ? `+${delta.toFixed(2)}€` : `${delta.toFixed(2)}€`}).`);
  };

  // Εφαρμογή προτεινόμενης τιμής στόχου margin
  const handleApplySuggestedPrice = (id: number, suggestedPrice: number) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, sellingPrice: suggestedPrice } : r))
    );
    notify(`🎯 Εφαρμόστηκε η προτεινόμενη τιμή ${suggestedPrice.toFixed(2)} € βάσει στόχου περιθωρίου!`);
  };

  // Διαχείριση γραμμών υλικών μέσα στο Modal
  const handleAddIngredientRow = (preset?: typeof INGREDIENT_PRESETS[0]) => {
    if (preset) {
      setFormIngredients((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          name: preset.name,
          quantity: preset.quantity,
          unit: preset.unit,
          unitCost: preset.unitCost
        }
      ]);
      return;
    }
    setFormIngredients((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        name: '',
        quantity: 1,
        unit: 'gr',
        unitCost: 0.01
      }
    ]);
  };

  const handleUpdateIngredientRow = (id: string, field: keyof RecipeIngredient, value: any) => {
    setFormIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const handleRemoveIngredientRow = (id: string) => {
    setFormIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  // Αποθήκευση (Νέα ή Επεξεργασία)
  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      notify('⚠️ Συμπληρώστε την ονομασία του προϊόντος / συνταγής.');
      return;
    }

    const validIngredients = formIngredients
      .filter((ing) => ing.name.trim() !== '')
      .map((ing) => ({
        ...ing,
        name: ing.name.trim(),
        quantity: Math.max(0, Number(ing.quantity) || 0),
        unitCost: Math.max(0, Number(ing.unitCost) || 0)
      }));

    const payload: FullRecipe = {
      id: editingRecipeId ?? Date.now(),
      code: formCode.trim() || 'REC-NEW',
      name: formName.trim(),
      category: formCategory,
      sellingPrice: Math.max(0, Number(formSellingPrice) || 0),
      targetMarginPct: Math.min(95, Math.max(5, Number(formTargetMargin) || 70)),
      prepTimeSec: Math.max(5, Number(formPrepTime) || 60),
      notes: formNotes.trim(),
      ingredients: validIngredients
    };

    if (editingRecipeId !== null) {
      setRecipes((prev) => prev.map((r) => (r.id === editingRecipeId ? payload : r)));
      notify(`✔ Η συνταγή "${payload.name}" ενημερώθηκε επιτυχώς!`);
    } else {
      setRecipes((prev) => [payload, ...prev]);
      notify(`✔ Η νέα συνταγή "${payload.name}" αποθηκεύτηκε στο BOM!`);
    }

    setShowModal(false);
    setEditingRecipeId(null);
  };

  const handleDeleteRecipe = (id: number, name: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    notify(`🗑️ Η συνταγή "${name}" διαγράφηκε από το σύστημα BOM.`);
  };

  const modalPreviewCost = formIngredients.reduce(
    (acc, ing) => acc + ((Number(ing.quantity) || 0) * (Number(ing.unitCost) || 0)),
    0
  );
  const modalPreviewProfit = (Number(formSellingPrice) || 0) - modalPreviewCost;
  const modalPreviewMargin =
    (Number(formSellingPrice) || 0) > 0
      ? ((modalPreviewProfit / (Number(formSellingPrice) || 1)) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Header, KPIs & Interactive Filters */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Utensils className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">
                Ακριβής Κοστολόγηση Συνταγών & BOM (Bill of Materials)
              </h2>
              {catalogKpis.belowTargetCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {catalogKpis.belowTargetCount} κάτω από στόχο Margin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ανάλωση ανά γραμμάριο/ml/τεμάχιο, έλεγχος Prime Cost, προσομοίωση προμηθειών delivery και πλήρης επεξεργασία συνταγών.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Channel Toggle: Κατάστημα vs Delivery 15% */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1 text-xs">
              <button
                type="button"
                onClick={() => setChannelView('STORE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  channelView === 'STORE'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Κατάστημα (0% Προμήθεια)
              </button>
              <button
                type="button"
                onClick={() => setChannelView('DELIVERY_15')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  channelView === 'DELIVERY_15'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Delivery (-15% Προμήθεια)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOwnerTab('inventory')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              <span>Τιμές Α’ Υλών (Αποθήκη)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition"
            >
              <Plus className="h-4 w-4" />
              <span>+ Νέα Συνταγή & BOM</span>
            </button>
          </div>
        </div>

        {/* 4 Summary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Κοστολογημένες Συνταγές</span>
            <p className="text-2xl font-black text-white">{catalogKpis.totalCount} Προϊόντα</p>
            <span className="text-[10px] text-emerald-400 block">Ενεργές συνταγές με ανάλυση BOM</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">
              Μέσο Περιθώριο Κέρδους ({channelView === 'STORE' ? 'Κατάστημα' : 'Delivery -15%'})
            </span>
            <p className="text-2xl font-black text-emerald-400">{catalogKpis.avgMargin}%</p>
            <span className="text-[10px] text-slate-500 block">Μικτό περιθώριο επί τιμής διάθεσης</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Μέσο Κόστος Υλικών (BOM)</span>
            <p className="text-2xl font-black text-amber-400">{catalogKpis.avgBomCost.toFixed(2)} €</p>
            <span className="text-[10px] text-slate-500 block">Πρώτες ύλες & υλικά συσκευασίας</span>
          </div>

          <div
            onClick={() => setMarginFilter(marginFilter === 'LOW_MARGIN' ? 'ALL' : 'LOW_MARGIN')}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 block">Εκτός Στόχου Margin</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">{catalogKpis.belowTargetCount} Συνταγές</p>
            <span className="text-[10px] text-slate-400 block">Κλικ για φιλτράρισμα όσων θέλουν ρύθμιση</span>
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
              placeholder="Αναζήτηση συνταγής, κωδικού ή υλικού BOM..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:outline-none"
            >
              <option value="ALL">Όλες οι Κατηγορίες ({recipes.length})</option>
              <option value="Καφέδες & Ροφήματα">Καφέδες & Ροφήματα</option>
              <option value="Snacks & Φαγητό">Snacks & Φαγητό</option>
              <option value="Ροφήματα & Χυμοί">Ροφήματα & Χυμοί</option>
              <option value="Γλυκά & Σφολιάτες">Γλυκά & Σφολιάτες</option>
            </select>
          </div>

          <div className="md:col-span-3 flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setMarginFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                marginFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Όλες
            </button>
            <button
              type="button"
              onClick={() => setMarginFilter('HIGH_MARGIN')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                marginFilter === 'HIGH_MARGIN' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              Εντός Στόχου
            </button>
            <button
              type="button"
              onClick={() => setMarginFilter('LOW_MARGIN')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition ${
                marginFilter === 'LOW_MARGIN' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              Χαμηλό Margin
            </button>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <p className="text-sm font-bold text-white">Δεν βρέθηκαν συνταγές με αυτά τα φίλτρα.</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setMarginFilter('ALL'); }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400"
          >
            Επαναφορά Φίλτρων
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecipes.map((recipe) => {
            const { bomCost, effectivePrice, grossProfit, marginPct, isBelowTarget, suggestedPrice } =
              computeRecipeEconomics(recipe);
            const batchQty = batchMultiplier[recipe.id] || 1;
            const totalBatchBomCost = +(bomCost * batchQty).toFixed(2);
            const totalBatchRevenue = +(effectivePrice * batchQty).toFixed(2);

            return (
              <div
                key={recipe.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-4">
                  {/* Recipe Top Info & Quick Controls */}
                  <div className="flex flex-wrap justify-between items-start gap-3 border-b border-slate-900 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {recipe.code}
                        </span>
                        <h3 className="text-base font-black text-white">{recipe.name}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {recipe.category}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Στόχος Margin: {recipe.targetMarginPct}% • Εκτέλεση: ~{recipe.prepTimeSec}s
                        </span>
                      </div>
                    </div>

                    {/* Price & Quick Bump Controls */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickPriceBump(recipe.id, -0.20)}
                          title="Μείωση τιμής -0.20€"
                          className="h-6 w-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xl font-mono font-black text-emerald-400 min-w-[72px] text-center">
                          {recipe.sellingPrice.toFixed(2)} €
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickPriceBump(recipe.id, 0.20)}
                          title="Αύξηση τιμής +0.20€"
                          className="h-6 w-6 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        {channelView === 'DELIVERY_15'
                          ? `Καθαρά μετά το 15% delivery: ${effectivePrice.toFixed(2)} €`
                          : 'Τιμή Καταλόγου'}
                      </span>
                    </div>
                  </div>

                  {/* Financial Metrics Box */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Κόστος BOM (Prime):</span>
                      <span className="text-amber-400 font-mono font-bold text-sm">{bomCost.toFixed(2)} €</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Μικτό Κέρδος:</span>
                      <span className={`font-mono font-bold text-sm ${grossProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {grossProfit.toFixed(2)} €
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Margin %:</span>
                      <span className={`font-mono font-extrabold text-sm ${isBelowTarget ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {marginPct}%
                      </span>
                    </div>
                  </div>

                  {/* Target Margin Alert & Suggestion */}
                  {isBelowTarget && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          Κάτω από το στόχο ({recipe.targetMarginPct}%). Προτεινόμενη τιμή: <strong className="font-mono">{suggestedPrice.toFixed(2)} €</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplySuggestedPrice(recipe.id, suggestedPrice)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] transition"
                      >
                        Εφαρμογή {suggestedPrice.toFixed(2)} €
                      </button>
                    </div>
                  )}

                  {/* Batch / Production Simulation Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800/70 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-slate-400 font-bold">Προσομοίωση Παραγωγής:</span>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={batchQty}
                        onChange={(e) =>
                          setBatchMultiplier({
                            ...batchMultiplier,
                            [recipe.id]: Math.max(1, parseInt(e.target.value) || 1)
                          })
                        }
                        className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-white font-mono font-bold text-center"
                      />
                      <span className="text-slate-400">τεμ.</span>
                    </div>
                    <div className="font-mono text-slate-300">
                      Υλικά: <span className="text-amber-400 font-bold">{totalBatchBomCost.toFixed(2)} €</span> • Είσπραξη:{' '}
                      <span className="text-emerald-400 font-bold">{totalBatchRevenue.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Ingredients Breakdown Table */}
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                      <span>
                        Ανάλυση Συστατικών & Υλικών Συσκευασίας {batchQty > 1 ? `(για ${batchQty} τεμ.)` : '(ανά 1 τεμ.)'}:
                      </span>
                    </span>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[10px]">
                          <tr>
                            <th className="p-2.5">Υλικό / Πρώτη Ύλη</th>
                            <th className="p-2.5 text-right">Ποσότητα</th>
                            <th className="p-2.5 text-right">Κόστος Μονάδας</th>
                            <th className="p-2.5 text-right">Σύνολο</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {recipe.ingredients.map((ing) => {
                            const scaledQty = +(ing.quantity * batchQty).toFixed(1);
                            const lineTotal = +(scaledQty * ing.unitCost).toFixed(2);
                            return (
                              <tr key={ing.id} className="hover:bg-slate-950/30">
                                <td className="p-2.5 text-white font-sans">{ing.name}</td>
                                <td className="p-2.5 text-right text-slate-300">
                                  {scaledQty} {ing.unit}
                                </td>
                                <td className="p-2.5 text-right text-slate-500">{ing.unitCost.toFixed(3)} €</td>
                                <td className="p-2.5 text-right text-emerald-400 font-bold">{lineTotal.toFixed(2)} €</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer Actions: Edit, Clone, Delete */}
                <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-900 text-xs">
                  <span className="text-[10px] text-slate-500 truncate max-w-[220px]" title={recipe.notes}>
                    {recipe.notes || 'Συνδεδεμένο με live αφαίρεση stock αποθήκης'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(recipe)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold flex items-center gap-1 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Επεξεργασία</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateRecipe(recipe)}
                      title="Αντιγραφή Συνταγής"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                      title="Διαγραφή Συνταγής"
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 font-bold flex items-center gap-1 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Διαγραφή</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Δημιουργία ή Επεξεργασία Συνταγής & BOM */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveRecipe}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-3xl space-y-5 shadow-2xl my-8 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-emerald-400" />
                  <span>
                    {editingRecipeId !== null
                      ? `Επεξεργασία Συνταγής BOM: ${formName}`
                      : 'Δημιουργία Νέας Συνταγής & Ανάλυσης BOM'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ρυθμίστε τιμή καταλόγου, στόχο περιθωρίου κέρδους και αναλυτικά υλικά με μονάδες μέτρησης.
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

            {/* Basic Recipe Info */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="sm:col-span-3">
                <label className="text-slate-400 block mb-1 font-bold">Κωδικός:</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="text-slate-400 block mb-1 font-bold">Όνομα Προϊόντος / Συνταγής *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="π.χ. Freddo Espresso Double"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-slate-400 block mb-1 font-bold">Κατηγορία:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as FullRecipe['category'])}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="Καφέδες & Ροφήματα">Καφέδες & Ροφήματα</option>
                  <option value="Snacks & Φαγητό">Snacks & Φαγητό</option>
                  <option value="Ροφήματα & Χυμοί">Ροφήματα & Χυμοί</option>
                  <option value="Γλυκά & Σφολιάτες">Γλυκά & Σφολιάτες</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="text-emerald-400 block mb-1 font-bold">Τιμή Καταλόγου (€) *</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={formSellingPrice}
                  onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-blue-400 block mb-1 font-bold">Στόχος Margin (%):</label>
                <input
                  type="number"
                  min="1"
                  max="95"
                  value={formTargetMargin}
                  onChange={(e) => setFormTargetMargin(parseFloat(e.target.value) || 70)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-blue-300 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-slate-400 block mb-1 font-bold">Χρόνος Παρασκευής (δευτ.):</label>
                <input
                  type="number"
                  min="5"
                  value={formPrepTime}
                  onChange={(e) => setFormPrepTime(parseInt(e.target.value) || 60)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="text-slate-400 block mb-1">Σημειώσεις Παρασκευής / Σερβιρίσματος:</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Προαιρετική σημείωση για τον barista ή την κουζίνα..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            {/* Live Economics Preview Strip inside Modal */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Υπολογιζόμενο Κόστος BOM</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{modalPreviewCost.toFixed(2)} €</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Μικτό Κέρδος / Τεμάχιο</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{modalPreviewProfit.toFixed(2)} €</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Περιθώριο Κέρδους (Margin)</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">{modalPreviewMargin}%</span>
              </div>
            </div>

            {/* Dynamic Ingredients & Presets */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-300">
                  Συστατικά & Υλικά Συσκευασίας ({formIngredients.length} γραμμές):
                </span>
                <button
                  type="button"
                  onClick={() => handleAddIngredientRow()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-extrabold text-xs flex items-center gap-1 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Κενή Γραμμή Υλικού</span>
                </button>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                <span className="text-[10px] text-slate-500 self-center mr-1">Γρήγορη προσθήκη:</span>
                {INGREDIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddIngredientRow(preset)}
                    className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 transition"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {formIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs"
                  >
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleUpdateIngredientRow(ing.id, 'name', e.target.value)}
                        placeholder="Όνομα υλικού"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        step="0.5"
                        value={ing.quantity}
                        onChange={(e) =>
                          handleUpdateIngredientRow(ing.id, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        placeholder="Ποσότητα"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-right"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={ing.unit}
                        onChange={(e) => handleUpdateIngredientRow(ing.id, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      >
                        <option value="gr">gr</option>
                        <option value="ml">ml</option>
                        <option value="τεμ">τεμ</option>
                        <option value="σετ">σετ</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        step="0.001"
                        value={ing.unitCost}
                        onChange={(e) =>
                          handleUpdateIngredientRow(ing.id, 'unitCost', parseFloat(e.target.value) || 0)
                        }
                        placeholder="Κόστος/μονάδα"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono text-right"
                      />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(ing.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5 mx-auto" />
                      </button>
                    </div>
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
                {editingRecipeId !== null ? 'Αποθήκευση Αλλαγών BOM' : 'Αποθήκευση Συνταγής & BOM'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}