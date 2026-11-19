// app/lib/types.ts

export type ActiveTabId = 'dashboard' | 'sales' | 'inventory' | 'suppliers' | 'recipes' | 'invoices' | 'payroll' | 'settings' | 'support';

export interface Branch {
  id: string;
  name: string;
  area: string;
}

export interface Supplier {
  id: number;
  name: string;
  afm: string;
  contactPerson: string;
  phone: string;
  email: string;
  deliveryDays: string;
  moq: number;
  paymentTerms: string;
}

export interface InventoryItem {
  id: number;
  item: string;
  supplier: string;
  stock: number;
  unit: string;
  threshold: number;
  packName: string;
  unitsPerPack: number;
  packPrice: number;
  cost: number;
  prevCost: number;
  doseRatio: number;
  doseLabel: string;
  invoiceAliases: string[];
}

export interface RecipeItem {
  id: number;
  name: string;
  category: string;
  price: number;
  extraCost: number;
  details: string;
  bomLinks: { invId: number; qtyPerUnit: number; label: string }[];
}

export interface InvoiceFile {
  id: string;
  supplier: string;
  date: string;
  dueDate: string;
  amount: number;
  vat: number;
  status: 'Paid' | 'Pending';
  paymentMethod: string;
}

export interface FixedCostItem {
  id: number;
  title: string;
  category: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending';
  paymentMethod: string;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  afm: string;
  amka: string;
  phone: string;
  email: string;
  iban: string;
  hireDate: string;
  healthCertExpiry: string;
  contractType: string;
  shiftPreference: 'morning_only' | 'afternoon_only' | 'flexible';
  maxDaysPerWeek: number;
  salaryMode: 'hourly' | 'monthly';
  agreedBaseAmount: number;
  weeklyHours: number;
  salaryAdvance: number;
  tipWeight: number;
  efficiency: string;
  schedule: { [day: string]: string };
}

export interface ArchiveEntry {
  id: string;
  date: string;
  totalZ: number;
  cashNet: number;
  pos: number;
  delivery: number;
  expenses: number;
  netLeftToOwner: number;
}

export interface DrawerExpense {
  id: number;
  reason: string;
  category: string;
  amount: number;
  time: string;
}

export interface SoldProduct {
  id: number;
  name: string;
  qty: number;
  price: number;
  unitBomCost: number;
  isCoffee: boolean;
}

export const weekDays = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'];

export function parseSafeFloat(val: any): number {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatEUR(val: number, decimals: number = 2): string {
  return `${val.toFixed(decimals)} €`;
}

export function getScheduleStats(schedule: any) {
  let weeklyWorkedHours = 40;
  if (schedule) {
    Object.values(schedule).forEach((val: any) => {
      if (val && typeof val === 'string' && !val.toUpperCase().includes('ΡΕΠΟ')) {
        weeklyWorkedHours += 8;
      }
    });
  }
  return { weeklyWorkedHours };
}

export function calculateGreekPayroll(staff: StaffMember) {
  return { netPay: staff.agreedBaseAmount * 120 };
}

export const initialBranches: Branch[] = [
  { id: 'blyss-1', name: 'blysscafe - Κολωνάκι', area: 'Κολωνάκι, Αθήνα' }
];

export const initialSuppliers: Supplier[] = [
  { id: 1, name: 'Taf Coffee', afm: '099888777', contactPerson: 'Γιώργος', phone: '306912345678', email: 'orders@taf.gr', deliveryDays: 'Δευ - Τετ - Παρ', moq: 50, paymentTerms: 'Μετρητά' },
  { id: 2, name: 'Kudu Coffee Roasters', afm: '888777666', contactPerson: 'Νίκος', phone: '306987654321', email: 'sales@kudu.gr', deliveryDays: 'Τρι - Πεμ', moq: 60, paymentTerms: '30 ημέρες' }
];

export const initialInventory: InventoryItem[] = [
  { id: 1, item: 'Espresso Beans Taf', supplier: 'Taf Coffee', stock: 24, unit: 'kg', threshold: 5, packName: 'Σακούλα 1kg', unitsPerPack: 1, packPrice: 22.50, cost: 22.50, prevCost: 22.50, doseRatio: 1, doseLabel: '18g', invoiceAliases: ['TAF ESPRESSO'] },
  { id: 2, item: 'Milk Fresh 3.5%', supplier: 'Φάρμα', stock: 36, unit: 'lt', threshold: 10, packName: 'Κιβώτιο 6lt', unitsPerPack: 6, packPrice: 9.60, cost: 1.60, prevCost: 1.60, doseRatio: 1, doseLabel: '200ml', invoiceAliases: ['ΓΑΛΑ ΦΡΕΣΚΟ'] }
];

export const initialRecipes: RecipeItem[] = [
  { id: 1, name: 'Espresso Single', category: 'Καφές', price: 2.20, extraCost: 0.12, details: '18g καφές, μονό shot', bomLinks: [] },
  { id: 2, name: 'Freddo Espresso', category: 'Καφές', price: 3.50, extraCost: 0.15, details: '18g καφές, πάγος', bomLinks: [] }
];

export const initialInvoices: InvoiceFile[] = [
  { id: 'ΤΔΑ-9821', supplier: 'Taf Coffee', date: '15/11/2026', dueDate: '30/11/2026', amount: 450.00, vat: 58.50, status: 'Pending', paymentMethod: 'Τράπεζα' }
];

export const initialFixedCosts: FixedCostItem[] = [
  { id: 1, title: 'Ενοίκιο Καταστήματος', category: 'Πάγια', dueDate: '01/12/2026', amount: 2500.00, status: 'Pending', paymentMethod: 'Τράπεζα' }
];

export const initialStaff: StaffMember[] = [
  { id: 1, name: 'Γιώργος Αλεξίου', role: 'Cashier / Barista', afm: '123456789', amka: '01019500000', phone: '6045678123', email: 'giorgos@blysscafe.gr', iban: 'GR123', hireDate: '2026-01-15', healthCertExpiry: '2029-01-15', contractType: 'Part-time', shiftPreference: 'flexible', maxDaysPerWeek: 5, salaryMode: 'hourly', agreedBaseAmount: 6.5, weeklyHours: 40, salaryAdvance: 0, tipWeight: 1, efficiency: 'High', schedule: { Δευ: '07:00-15:00', Τρι: 'ΡΕΠΟ' } }
];

export const initialArchive: ArchiveEntry[] = [
  { id: 'Z-210', date: '14/11/2026', totalZ: 1858.60, cashNet: 785.00, pos: 1090.00, delivery: 490.00, expenses: 25.00, netLeftToOwner: 1342.50 }
];

export const initialHourlySales = [
  { time: '07:00', sales: 120 },
  { time: '09:00', sales: 340 },
  { time: '11:00', sales: 290 },
  { time: '13:00', sales: 210 },
  { time: '15:00', sales: 150 },
  { time: '17:00', sales: 180 },
  { time: '19:00', sales: 90 },
];