'use client';

import React, { useState, useRef } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import { formatEUR, parseSafeFloat } from '@/app/lib/types';
import { Camera, FileSpreadsheet } from 'lucide-react';

export default function SalesZView() {
  const {
    totalTurnover, netCashInDrawerAfterFloat, platformCommissions, ownerNetPocketToday,
    cashFloat, setCashFloat, physicalDrawerCounted, setPhysicalDrawerCounted,
    zPrintedCash, setZPrintedCash, posCards, setPosCards, efoodSales, setEfoodSales,
    woltSales, setWoltSales, boxSales, setBoxSales, drawerExpenses, setDrawerExpenses,
    totalDrawerExpenses, soldProducts, setSoldProducts, zArchive, setZArchive,
    totalDeliveryGross, handleDeductSoldProductsFromStock, notify
  } = useMetric();

  const [newExpReason, setNewExpReason] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const zScannerRef = useRef<HTMLInputElement | null>(null);

  const handleScanZReport = () => {
    setZPrintedCash(785.00);
    setPosCards(1090.00);
    setEfoodSales(260.00);
    setWoltSales(230.00);
    setPhysicalDrawerCounted(+(cashFloat + 785.00 - totalDrawerExpenses).toFixed(2));
    notify('✔ Το Δελτίο Ζ σκαναρίστηκε επιτυχώς!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400"><Camera className="h-6 w-6" /></div>
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-400">Βημα 1 • Φορολογικο Ζ</span>
              <h2 className="text-base font-extrabold text-white">Σκανάρισμα Δελτίου Ζ Ημέρας</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <input ref={zScannerRef} type="file" className="hidden" onChange={handleScanZReport} />
            <button onClick={() => zScannerRef.current?.click()} className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs">Αρχείο PDF</button>
            <button onClick={handleScanZReport} className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs">Test Scan Ζ</button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400"><FileSpreadsheet className="h-6 w-6" /></div>
            <div>
              <span className="text-[10px] font-bold uppercase text-cyan-400">Βημα 2 • Αναφορα PC POS</span>
              <h2 className="text-base font-extrabold text-white">Σάρωση Πωλήσεων Προϊόντων</h2>
            </div>
          </div>
          <button onClick={() => notify('✔ Φορτώθηκαν οι αναλυτικές πωλήσεις!')} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs">
            Φόρτωση Πωλήσεων
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Συνολικός Τζίρος Ημέρας</p>
          <p className="text-3xl font-black text-white mt-1.5">{formatEUR(totalTurnover)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">Καθαρά Μετρητά Συρταριού (Χωρίς Πάγιο)</p>
          <p className="text-3xl font-black text-emerald-400 mt-1.5">{formatEUR(netCashInDrawerAfterFloat)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/30">
          <p className="text-[11px] font-bold text-blue-400 uppercase">Καθαρά Τράπεζας (POS + Delivery)</p>
          <p className="text-3xl font-black text-blue-400 mt-1.5">{formatEUR(platformCommissions.netBankPayout)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-950/35 border-2 border-emerald-500/50">
          <p className="text-[11px] font-extrabold text-emerald-300 uppercase">💰 ΤΙ ΕΜΕΙΝΕ ΚΑΘΑΡΟ ΣΤΟΝ ΕΡΓΟΔΟΤΗ</p>
          <p className="text-3xl font-black text-white mt-1.5">{formatEUR(ownerNetPocketToday.pureProfitAfterBom)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">1. Επιμερισμός Εισπράξεων Ζ, POS & Delivery</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-slate-400 block mb-1">Πάγιο / Float (€)</label>
              <input type="number" value={cashFloat} onChange={(e) => setCashFloat(parseSafeFloat(e.target.value))} className="w-full bg-slate-900 border rounded px-2 py-1.5 font-bold text-white" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40">
              <label className="text-emerald-400 font-bold block mb-1">Μετρητά Συρταριού (€)</label>
              <input type="number" value={physicalDrawerCounted} onChange={(e) => setPhysicalDrawerCounted(parseSafeFloat(e.target.value))} className="w-full bg-slate-900 border rounded px-2 py-1.5 font-bold text-white" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-slate-400 block mb-1">Μετρητά Ζ (€)</label>
              <input type="number" value={zPrintedCash} onChange={(e) => setZPrintedCash(parseSafeFloat(e.target.value))} className="w-full bg-slate-900 border rounded px-2 py-1.5 font-bold text-white" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-blue-400 font-bold block mb-1">POS (€)</label>
              <input type="number" value={posCards} onChange={(e) => setPosCards(parseSafeFloat(e.target.value))} className="w-full bg-slate-900 rounded px-2 py-1 text-white font-bold" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-rose-400 font-bold block mb-1">efood (€)</label>
              <input type="number" value={efoodSales} onChange={(e) => setEfoodSales(parseSafeFloat(e.target.value))} className="w-full bg-slate-900 rounded px-2 py-1 text-white font-bold" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-cyan-400 font-bold block mb-1">Wolt (€)</label>
              <input type="number" value={woltSales} onChange={(e) => setWoltSales(parseSafeFloat(e.target.value))} className="w-full bg-slate-900 rounded px-2 py-1 text-white font-bold" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-amber-400 font-bold block mb-1">Box (€)</label>
              <input type="number" value={boxSales} onChange={(e) => setBoxSales(parseSafeFloat(e.target.value))} className="w-full bg-slate-900 rounded px-2 py-1 text-white font-bold" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white">2. Έξοδα Ταμείου</h3>
              <strong className="text-rose-400">-{formatEUR(totalDrawerExpenses)}</strong>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const amt = parseSafeFloat(newExpAmount); if (newExpReason && amt > 0) { setDrawerExpenses([{ id: Date.now(), reason: newExpReason, category: 'Έξοδο', amount: amt, time: '14:00' }, ...drawerExpenses]); setNewExpReason(''); setNewExpAmount(''); } }} className="flex gap-2 text-xs">
              <input type="text" placeholder="Αιτιολογία (π.χ. Πάγος)" value={newExpReason} onChange={(e) => setNewExpReason(e.target.value)} className="flex-1 bg-slate-950 border rounded-lg px-3 py-2 text-white" />
              <input type="number" placeholder="€" value={newExpAmount} onChange={(e) => setNewExpAmount(e.target.value)} className="w-20 bg-slate-950 border rounded-lg px-2 py-2 text-white" />
              <button type="submit" className="px-3 bg-rose-500 text-slate-950 font-extrabold rounded-lg">+</button>
            </form>
            <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
              {drawerExpenses.map((exp) => (
                <div key={exp.id} className="flex justify-between bg-slate-950 p-2 rounded-lg">
                  <span>{exp.reason}</span>
                  <strong className="text-rose-400">-{formatEUR(exp.amount)}</strong>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setZArchive([{ id: `Z-${211 + zArchive.length}`, date: new Date().toLocaleDateString('el-GR'), totalZ: totalTurnover, cashNet: netCashInDrawerAfterFloat, pos: posCards, delivery: totalDeliveryGross, expenses: totalDrawerExpenses, netLeftToOwner: ownerNetPocketToday.pureProfitAfterBom }, ...zArchive]);
              notify('✔ Το Κλείσιμο Ημέρας αποθηκεύτηκε!');
            }}
            className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
          >
            Οριστικό Κλείσιμο Ταμείου Ημέρας
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">3. Αναλυτικές Πωλήσεις Προϊόντων & Κόστος BOM</h3>
          <button onClick={handleDeductSoldProductsFromStock} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs">
            Αυτόματη Αφαίρεση από Αποθήκη
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2">Προϊόν</th><th className="pb-2 text-center">Ποσότητα</th><th className="pb-2 text-right">Τιμή</th><th className="pb-2 text-right">Σύνολο</th><th className="pb-2 text-right">Κόστος BOM</th><th className="pb-2 text-right">Κέρδος</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {soldProducts.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 font-bold text-white">{p.name}</td>
                  <td className="py-2.5 text-center"><input type="number" value={p.qty} onChange={(e) => setSoldProducts(soldProducts.map(x => x.id === p.id ? { ...x, qty: Math.max(0, parseInt(e.target.value) || 0) } : x))} className="w-16 bg-slate-950 border border-slate-700 text-center font-bold text-cyan-400 rounded" /></td>
                  <td className="py-2.5 text-right">{formatEUR(p.price)}</td>
                  <td className="py-2.5 text-right font-bold text-white">{formatEUR(p.qty * p.price)}</td>
                  <td className="py-2.5 text-right text-rose-400">-{formatEUR(p.qty * p.unitBomCost)}</td>
                  <td className="py-2.5 text-right font-extrabold text-emerald-400">+{formatEUR((p.qty * p.price) - (p.qty * p.unitBomCost))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}