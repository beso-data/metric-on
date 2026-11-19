'use client';

import React, { useState } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import { formatEUR, parseSafeFloat, weekDays, getScheduleStats, calculateGreekPayroll, RecipeItem } from '@/app/lib/types';
import { Truck, ChefHat, Trash2, FileText, Building2, Calendar, Sun, Sunset, Sparkles, ShieldCheck, HelpCircle, MapPin, Smartphone } from 'lucide-react';

export function InventoryView() {
  const { supplierAutoCarts, handleSendSupplierOrderFromEmployer } = useMetric();
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-4">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Truck className="h-5 w-5 text-purple-400" />
        <span>Αυτόματα Καλάθια Παραγγελιών στους Προμηθευτές (Viber / WhatsApp)</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supplierAutoCarts.map((cart) => (
          <div key={cart.supplier} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <strong className="text-white text-sm">{cart.supplier} (+{cart.phone})</strong>
              <strong className="text-emerald-400">{formatEUR(cart.totalCost)}</strong>
            </div>
            {cart.items.map((c: any) => (
              <div key={c.inv.id} className="flex justify-between text-xs">
                <span className="text-amber-300">{c.packsToOrder}x {c.inv.packName} ({c.inv.item})</span>
                <span>{formatEUR(c.lineCost)}</span>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => handleSendSupplierOrderFromEmployer(cart, 'viber')} className="py-2 rounded-xl bg-purple-600 text-white font-extrabold text-xs">Αποστολή σε Viber</button>
              <button onClick={() => handleSendSupplierOrderFromEmployer(cart, 'whatsapp')} className="py-2 rounded-xl bg-emerald-600 text-slate-950 font-extrabold text-xs">WhatsApp</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecipesView() {
  const { recipes, setRecipes, computedRecipes, notify } = useMetric();
  const [newRecipeForm, setNewRecipeForm] = useState({ name: '', category: 'Καφές', price: '3.50', extraCost: '0.12', details: '', primaryInvId: '1', primaryQty: '0.018' });

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeForm.name.trim()) return;
    const links = [{ invId: parseInt(newRecipeForm.primaryInvId) || 1, qtyPerUnit: parseSafeFloat(newRecipeForm.primaryQty) || 0.018, label: 'Κύρια Α’ Ύλη' }];
    const created: RecipeItem = {
      id: Date.now(), name: newRecipeForm.name.trim(), category: newRecipeForm.category,
      price: parseSafeFloat(newRecipeForm.price) || 3.5, extraCost: parseSafeFloat(newRecipeForm.extraCost) || 0,
      details: newRecipeForm.details.trim() || 'Συνταγή BOM', bomLinks: links,
    };
    setRecipes([created, ...recipes]);
    setNewRecipeForm({ ...newRecipeForm, name: '', details: '' });
    notify('Η συνταγή δημιουργήθηκε!');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-emerald-400" /><span>Δημιουργία Νέας Συνταγής (BOM)</span>
        </h2>
        <form onSubmit={handleAddRecipe} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input type="text" required placeholder="Όνομα Προϊόντος Μενού *" value={newRecipeForm.name} onChange={(e) => setNewRecipeForm({ ...newRecipeForm, name: e.target.value })} className="bg-slate-900 border rounded-xl px-3 py-2 text-white font-bold" />
            <select value={newRecipeForm.category} onChange={(e) => setNewRecipeForm({ ...newRecipeForm, category: e.target.value })} className="bg-slate-900 border rounded-xl px-3 py-2 text-white font-semibold">
              <option value="Καφές">Καφές</option><option value="Ρόφημα">Ρόφημα</option><option value="Φαγητό">Φαγητό</option><option value="Σνακ">Σνακ</option>
            </select>
            <input type="number" step="0.1" placeholder="Τιμή Πώλησης (€)" value={newRecipeForm.price} onChange={(e) => setNewRecipeForm({ ...newRecipeForm, price: e.target.value })} className="bg-slate-900 border border-emerald-500 rounded-xl px-3 py-2 text-emerald-300 font-extrabold" />
            <button type="submit" className="bg-emerald-500 text-slate-950 font-extrabold rounded-xl py-2 px-3">+ Προσθήκη Συνταγής</button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {computedRecipes.map((r) => (
          <div key={r.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <input type="text" value={r.name} onChange={(e) => setRecipes(recipes.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))} className="font-extrabold text-white text-sm bg-transparent focus:outline-none w-full" />
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">{r.margin}% Margin</span>
                <button onClick={() => setRecipes(recipes.filter(x => x.id !== r.id))} className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
              <textarea rows={2} value={r.details} onChange={(e) => setRecipes(recipes.map(x => x.id === r.id ? { ...x, details: e.target.value } : x))} className="w-full text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-2.5" />
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between text-xs">
              <span>Κόστος: <strong className="text-rose-400">{formatEUR(r.cost, 3)}</strong></span>
              <span>Τιμή: <strong className="text-white">{formatEUR(r.price)}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinanceView() {
  const { financeMetrics, monthlyBreakEvenTarget, invoices, setInvoices, fixedCosts, setFixedCosts, suppliersList, notify } = useMetric();
  const [newInvoiceForm, setNewInvoiceForm] = useState({ id: '', supplier: 'Taf / Kudu', amount: '' });
  const [newFixedCostForm, setNewFixedCostForm] = useState({ title: '', amount: '' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30">
          <p className="text-[11px] font-bold text-amber-400 uppercase">Προς Πληρωμή</p>
          <p className="text-3xl font-black text-amber-400 mt-1.5">{formatEUR(financeMetrics.totalUnpaidObligations)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">Ήδη Εξοφλημένα</p>
          <p className="text-3xl font-black text-emerald-400 mt-1.5">{formatEUR(financeMetrics.totalPaidMonth)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-bold text-cyan-400 uppercase">ΦΠΑ Εισροών</p>
          <p className="text-3xl font-black text-cyan-400 mt-1.5">{formatEUR(financeMetrics.totalInputVat)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Break-Even Στόχος</p>
          <p className="text-3xl font-black text-white mt-1.5">{formatEUR(monthlyBreakEvenTarget)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Τιμολόγια Προμηθευτών</h3>
          <form onSubmit={(e) => { e.preventDefault(); const amt = parseSafeFloat(newInvoiceForm.amount); if (amt <= 0) return; setInvoices([{ id: newInvoiceForm.id || `ΤΔΑ-${Math.floor(1000 + Math.random() * 900)}`, supplier: newInvoiceForm.supplier, date: new Date().toLocaleDateString('el-GR'), dueDate: '30/11/2026', amount: amt, vat: +(amt * 0.13).toFixed(2), status: 'Pending', paymentMethod: 'Τράπεζα' }, ...invoices]); setNewInvoiceForm({ ...newInvoiceForm, id: '', amount: '' }); notify('Καταχωρήθηκε!'); }} className="grid grid-cols-4 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <input type="text" placeholder="Αρ. ΤΔΑ" value={newInvoiceForm.id} onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, id: e.target.value })} className="bg-slate-900 rounded px-2 py-1 text-white" />
            <select value={newInvoiceForm.supplier} onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, supplier: e.target.value })} className="bg-slate-900 rounded px-2 py-1 text-white">
              {suppliersList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <input type="number" step="0.5" placeholder="Ποσό (€)" value={newInvoiceForm.amount} onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })} className="bg-slate-900 rounded px-2 py-1 text-white font-bold" />
            <button type="submit" className="bg-emerald-600 text-slate-950 font-extrabold rounded py-1">+ Τιμολόγιο</button>
          </form>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <span><strong>{inv.supplier}</strong> ({inv.id})</span>
                <div className="flex items-center gap-2">
                  <strong className="text-white">{formatEUR(inv.amount)}</strong>
                  <button onClick={() => setInvoices(invoices.map(i => i.id === inv.id ? { ...i, status: i.status === 'Paid' ? 'Pending' : 'Paid' } : i))} className={`px-3 py-1 rounded font-bold ${inv.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500 text-slate-950'}`}>
                    {inv.status === 'Paid' ? '✔ Εξοφλημένο' : 'Πληρωμή'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Μηνιαία Πάγια</h3>
          <form onSubmit={(e) => { e.preventDefault(); const amt = parseSafeFloat(newFixedCostForm.amount); if (!newFixedCostForm.title.trim() || amt <= 0) return; setFixedCosts([{ id: Date.now(), title: newFixedCostForm.title, category: 'Πάγια', dueDate: '01/12/2026', amount: amt, status: 'Pending', paymentMethod: 'Τράπεζα' }, ...fixedCosts]); setNewFixedCostForm({ title: '', amount: '' }); notify('Προστέθηκε!'); }} className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <input type="text" placeholder="Περιγραφή" value={newFixedCostForm.title} onChange={(e) => setNewFixedCostForm({ ...newFixedCostForm, title: e.target.value })} className="bg-slate-900 rounded px-2 py-1 text-white" />
            <input type="number" step="1" placeholder="Ποσό (€)" value={newFixedCostForm.amount} onChange={(e) => setNewFixedCostForm({ ...newFixedCostForm, amount: e.target.value })} className="bg-slate-900 rounded px-2 py-1 text-white font-bold" />
            <button type="submit" className="bg-cyan-500 text-slate-950 font-extrabold rounded py-1">+ Πάγιο</button>
          </form>
          <div className="space-y-2">
            {fixedCosts.map((fc) => (
              <div key={fc.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <span><strong>{fc.title}</strong></span>
                <div className="flex items-center gap-2">
                  <strong className="text-white">{formatEUR(fc.amount)}</strong>
                  <button onClick={() => setFixedCosts(fixedCosts.map(f => f.id === fc.id ? { ...f, status: f.status === 'Paid' ? 'Pending' : 'Paid' } : f))} className={`px-3 py-1 rounded font-bold ${fc.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500 text-slate-950'}`}>
                    {fc.status === 'Paid' ? '✔ Εξοφλημένο' : 'Πληρωμή'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PayrollView() {
  const { storePayrollTotals, staffMembers, setStaffMembers, notify } = useMetric();
  const [reqMorningStaffCount, setReqMorningStaffCount] = useState(3);
  const [reqAfternoonStaffCount, setReqAfternoonStaffCount] = useState(2);

  const handleGenerateAutoWeeklySchedule = () => {
    const assignedDaysCount: { [staffId: number]: number } = {};
    staffMembers.forEach((s) => { assignedDaysCount[s.id] = 0; });
    const newSchedules: { [staffId: number]: { [day: string]: string } } = {};
    staffMembers.forEach((s) => {
      newSchedules[s.id] = { Δευ: 'ΡΕΠΟ', Τρι: 'ΡΕΠΟ', Τετ: 'ΡΕΠΟ', Πεμ: 'ΡΕΠΟ', Παρ: 'ΡΕΠΟ', Σαβ: 'ΡΕΠΟ', Κυρ: 'ΡΕΠΟ' };
    });

    weekDays.forEach((day, dayIndex) => {
      const morningCandidates = [...staffMembers].filter((s) => s.shiftPreference === 'morning_only' || s.shiftPreference === 'flexible');
      let morningFilled = 0;
      for (const candidate of morningCandidates) {
        if (morningFilled >= reqMorningStaffCount) break;
        if (assignedDaysCount[candidate.id] < 5) {
          newSchedules[candidate.id][day] = '07:00-15:00';
          assignedDaysCount[candidate.id] += 1;
          morningFilled += 1;
        }
      }
      const afternoonCandidates = [...staffMembers].filter((s) => s.shiftPreference === 'afternoon_only' || s.shiftPreference === 'flexible');
      let afternoonFilled = 0;
      for (const candidate of afternoonCandidates) {
        if (afternoonFilled >= reqAfternoonStaffCount) break;
        if (assignedDaysCount[candidate.id] < 5) {
          newSchedules[candidate.id][day] = '15:00-23:00';
          assignedDaysCount[candidate.id] += 1;
          afternoonFilled += 1;
        }
      }
    });

    setStaffMembers((prev) => prev.map((s) => ({ ...s, schedule: newSchedules[s.id] || s.schedule })));
    notify('✨ Δημιουργήθηκε αυτόματο πρόγραμμα βαρδιών!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Ώρες Προγράμματος</p>
          <p className="text-2xl font-extrabold text-cyan-400 mt-1">{storePayrollTotals.totalWeeklyHours}h / εβδ.</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] text-slate-400 uppercase font-semibold">Καθαρά Πληρωτέα</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{formatEUR(storePayrollTotals.totalRemainingPayable)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30">
          <p className="text-[11px] text-amber-300 uppercase font-semibold">Πρόβλεψη Δώρων</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{formatEUR(storePayrollTotals.totalBonusesProvision)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
          <p className="text-[11px] text-emerald-300 uppercase font-bold">ΠΡΑΓΜΑΤΙΚΟ ΚΟΣΤΟΣ</p>
          <p className="text-2xl font-black text-white mt-1">{formatEUR(storePayrollTotals.trueMonthlyCost)}</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" /><span>Αυτόματο Πρόγραμμα Προσωπικού</span>
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-300 flex items-center gap-1"><Sun className="h-3.5 w-3.5" /> Πρωί:</span>
            <input type="number" value={reqMorningStaffCount} onChange={(e) => setReqMorningStaffCount(parseInt(e.target.value) || 1)} className="w-12 bg-slate-950 border rounded py-1 text-center font-bold" />
            <span className="text-cyan-300 flex items-center gap-1"><Sunset className="h-3.5 w-3.5" /> Απόγευμα:</span>
            <input type="number" value={reqAfternoonStaffCount} onChange={(e) => setReqAfternoonStaffCount(parseInt(e.target.value) || 1)} className="w-12 bg-slate-950 border rounded py-1 text-center font-bold" />
            <button onClick={handleGenerateAutoWeeklySchedule} className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /><span>✨ Αυτόματο Πρόγραμμα</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 pr-3">Εργαζόμενος</th>
                {weekDays.map((d) => <th key={d} className="py-2 px-2 text-center">{d}</th>)}
                <th className="py-2 pl-2 text-right">Ώρες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffMembers.map((staff) => {
                const stats = getScheduleStats(staff.schedule);
                return (
                  <tr key={staff.id}>
                    <td className="py-2.5 pr-3"><p className="font-bold text-white">{staff.name}</p></td>
                    {weekDays.map((day) => {
                      const val = staff.schedule?.[day] || 'ΡΕΠΟ';
                      const isOff = val.toUpperCase().includes('ΡΕΠΟ');
                      return (
                        <td key={day} className="py-2 px-1">
                          <input type="text" value={val} onChange={(e) => setStaffMembers(staffMembers.map(s => s.id === staff.id ? { ...s, schedule: { ...s.schedule, [day]: e.target.value } } : s))} className={`w-24 text-center rounded-lg px-1.5 py-1.5 font-semibold text-[11px] border ${isOff ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`} />
                        </td>
                      );
                    })}
                    <td className="py-2.5 pl-2 text-right font-extrabold text-emerald-400">{stats.weeklyWorkedHours}h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SettingsSupportView({ mode }: { mode: 'settings' | 'support' }) {
  const { employerConfig, setEmployerConfig, notify } = useMetric();
  const [supportTicket, setSupportTicket] = useState({ name: '', email: '', subject: '', message: '' });

  if (mode === 'support') {
    return (
      <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <HelpCircle className="h-6 w-6 text-cyan-400" />
          <div>
            <h2 className="text-lg font-extrabold text-white">Κέντρο Υποστήριξης & GDPR</h2>
            <p className="text-xs text-slate-400">Συχνές ερωτήσεις και φόρμα τεχνικής υποστήριξης</p>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); notify('✔ Το αίτημα υποστήριξης καταχωρήθηκε!'); setSupportTicket({ name: '', email: '', subject: '', message: '' }); }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <input type="text" required placeholder="Ονοματεπώνυμο *" value={supportTicket.name} onChange={(e) => setSupportTicket({ ...supportTicket, name: e.target.value })} className="bg-slate-950 border rounded-xl px-3 py-2 text-white" />
          <input type="email" required placeholder="Email *" value={supportTicket.email} onChange={(e) => setSupportTicket({ ...supportTicket, email: e.target.value })} className="bg-slate-950 border rounded-xl px-3 py-2 text-white" />
          <input type="text" required placeholder="Θέμα *" value={supportTicket.subject} onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })} className="sm:col-span-2 bg-slate-950 border rounded-xl px-3 py-2 text-white" />
          <textarea rows={4} required placeholder="Μήνυμα..." value={supportTicket.message} onChange={(e) => setSupportTicket({ ...supportTicket, message: e.target.value })} className="sm:col-span-2 bg-slate-950 border rounded-xl p-3 text-white" />
          <button type="submit" className="sm:col-span-2 py-3 rounded-xl bg-cyan-500 text-slate-950 font-extrabold">Αποστολή Αιτήματος</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-base font-bold text-white flex items-center gap-2"><Building2 className="h-5 w-5 text-emerald-400" /><span>1. Νομικά & Φορολογικά Στοιχεία</span></h3>
          <input type="text" value={employerConfig.storeName} onChange={(e) => setEmployerConfig({ ...employerConfig, storeName: e.target.value })} className="w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-bold" placeholder="Διακριτικός Τίτλος" />
          <input type="text" value={employerConfig.legalTitle} onChange={(e) => setEmployerConfig({ ...employerConfig, legalTitle: e.target.value })} className="w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-bold" placeholder="Πλήρης Επωνυμία" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={employerConfig.afm} onChange={(e) => setEmployerConfig({ ...employerConfig, afm: e.target.value })} className="w-full bg-slate-950 border border-emerald-500 rounded-xl px-3 py-2 text-emerald-300 font-bold" placeholder="ΑΦΜ" />
            <input type="text" value={employerConfig.doy} onChange={(e) => setEmployerConfig({ ...employerConfig, doy: e.target.value })} className="w-full bg-slate-950 border rounded-xl px-3 py-2 text-white" placeholder="ΔΟΥ" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-base font-bold text-white flex items-center gap-2"><MapPin className="h-5 w-5 text-cyan-400" /><span>2. Διεύθυνση & Viber Εργοδότη</span></h3>
          <input type="text" value={employerConfig.addressStreet} onChange={(e) => setEmployerConfig({ ...employerConfig, addressStreet: e.target.value })} className="w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-bold" placeholder="Οδός & Αριθμός" />
          <input type="tel" value={employerConfig.senderViberPhone} onChange={(e) => setEmployerConfig({ ...employerConfig, senderViberPhone: e.target.value })} className="w-full bg-slate-950 border border-purple-500 rounded-xl px-3 py-2 text-purple-300 font-extrabold" placeholder="Κινητό Viber (3069...)" />
          <input type="text" value={employerConfig.primaryBankIban} onChange={(e) => setEmployerConfig({ ...employerConfig, primaryBankIban: e.target.value })} className="w-full bg-slate-950 border rounded-xl px-3 py-2 text-cyan-300 font-mono" placeholder="IBAN" />
        </div>
      </div>
      <button onClick={() => notify('✔ Όλες οι ρυθμίσεις αποθηκεύτηκαν!')} className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2">
        <ShieldCheck className="h-4 w-4" /><span>Αποθήκευση Εταιρικού Προφίλ</span>
      </button>
    </div>
  );
}