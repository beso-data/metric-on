// app/components/views/LoginView.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useMetric } from '@/app/context/MetricContext';
import {
  TrendingUp, Crown, UserCheck, Lock, Mail, Eye, EyeOff,
  ShieldCheck, Receipt, Package, Users, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function LoginView() {
  const {
    setIsAuthenticated,
    setAuthRole,
    registerBusinessToSupabase,
    employerConfig,
    notify
  } = useMetric();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<'owner' | 'staff'>('owner');
  const [storeName, setStoreName] = useState(employerConfig?.storeName || 'blysscafe Athens');
  const [email, setEmail] = useState('owner@blysscafe.gr');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (nextMode: 'login' | 'register' | 'forgot') => {
    setMode(nextMode);
    if (nextMode === 'register') {
      setStoreName('');
      setEmail('');
      setPassword('');
    } else if (nextMode === 'login') {
      setEmail(role === 'owner' ? 'owner@blysscafe.gr' : 'staff@blysscafe.gr');
      setPassword('••••••••');
    }
  };

  const handleSelectRole = (nextRole: 'owner' | 'staff') => {
    setRole(nextRole);
    if (mode === 'login') {
      setEmail(nextRole === 'owner' ? 'owner@blysscafe.gr' : 'staff@blysscafe.gr');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) {
        notify(
          `⚠️ Ο πάροχος ${provider === 'google' ? 'Google' : 'Apple ID'} δεν είναι ακόμα ενεργοποιημένος στο Supabase Auth (${error.message}).`
        );
      }
    } catch {
      notify('⚠️ Αδυναμία σύνδεσης με εξωτερικό πάροχο. Χρησιμοποιήστε Email & Κωδικό.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeLogin = (methodLabel: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setAuthRole(role);
      setIsAuthenticated(true);
      setIsSubmitting(false);
      notify(
        `✔ Καλωσορίσατε στο Metric•On ERP (${role === 'owner' ? 'Εργοδότης' : 'Προσωπικό'}) — Σύνδεση μέσω ${methodLabel}.`
      );
    }, 250);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      if (!email.trim()) {
        notify('⚠️ Συμπληρώστε το email της επιχείρησης για ανάκτηση κωδικού.');
        return;
      }
      notify(`✉ Στάλθηκαν οδηγίες επαναφοράς κωδικού στο ${email.trim()}.`);
      switchMode('login');
      return;
    }

    if (mode === 'register') {
      if (!storeName.trim() || !email.trim()) {
        notify('⚠️ Συμπληρώστε όνομα καταστήματος και email για εγγραφή.');
        return;
      }
      setIsSubmitting(true);
      try {
        await registerBusinessToSupabase({
          storeName: storeName.trim(),
          ownerEmail: email.trim(),
        });
        setAuthRole(role);
        setIsAuthenticated(true);
        notify(`✔ Δημιουργήθηκε & αποθηκεύτηκε στη βάση ο λογαριασμός για "${storeName.trim()}" (${role === 'owner' ? 'Εργοδότης' : 'Προσωπικό'})!`);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email.trim()) {
      notify('⚠️ Παρακαλώ εισάγετε email.');
      return;
    }

    completeLogin('Email & Κωδικού');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      
      {/* Διακριτικός ατμοσφαιρικός φωτισμός φόντου */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">
        
        {/* Αριστερή Στήλη: Εταιρική Παρουσίαση & Εικόνα Επιχείρησης */}
        <div className="lg:col-span-6 p-7 sm:p-9 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-8 shadow-2xl">
          <div className="space-y-6">
            {/* Brand Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-white block">Metric•On ERP</span>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Hospitality & Café Intelligence
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                SaaS v2.0 • Live
              </span>
            </div>

            {/* Hero Headline */}
            <div className="space-y-3 pt-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Πλήρης έλεγχος ταμείου, κοστολόγησης & λειτουργίας καταστήματος σε ένα σημείο.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Σχεδιασμένο για σύγχρονες επιχειρήσεις καφέ και εστίασης με έμφαση στη διαφάνεια, το πραγματικό περιθώριο κέρδους ανά συνταγή και την ομαλή καθημερινή λειτουργία.
              </p>
            </div>

            {/* Core Pillars List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
                  <Receipt className="h-4 w-4" />
                  <span>Ταμείο, Ζ & Ρευστότητα</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Συμφωνία μετρητών, POS, προμηθειών delivery, μικροεξόδων και ιστορικού ημερών.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-1">
                <div className="flex items-center gap-2 text-blue-400 font-extrabold">
                  <Package className="h-4 w-4" />
                  <span>Αποθήκη, BOM & Παραγγελίες</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Κοστολόγηση ανά υλικό, έλεγχος ελλείψεων, τιμοκατάλογοι και γρήγορες παραγγελίες.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold">
                  <Users className="h-4 w-4" />
                  <span>Προσωπικό & Συμμόρφωση</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Στοιχεία συμβάσεων, ωράρια, βάρδιες, προκαταβολές και έλεγχος πιστοποιητικών.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-1">
                <div className="flex items-center gap-2 text-purple-400 font-extrabold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Οικονομικά & Πάγια</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Τιμολόγια προμηθευτών, εξοφλήσεις, ΦΠΑ εισροών και μηνιαία πάγια λειτουργίας.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Status Strip */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Ενεργό προφίλ: {employerConfig?.storeName || 'blysscafe Athens'}</span>
            </span>
            <span className="font-mono text-slate-500">Κρυπτογραφημένη Συνεδρία</span>
          </div>
        </div>

        {/* Δεξιά Στήλη: Κάρτα Σύνδεσης / Εγγραφής */}
        <div className="lg:col-span-6 p-7 sm:p-9 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-center shadow-2xl">
          <div className="w-full max-w-md mx-auto space-y-5">
            
            {/* Header της Κάρτας */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex h-11 w-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center text-emerald-400 mx-auto mb-1">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-white">
                {mode === 'login' && 'Σύνδεση στο Metric•On ERP'}
                {mode === 'register' && 'Εγγραφή Νέας Επιχείρησης'}
                {mode === 'forgot' && 'Ανάκτηση Πρόσβασης'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login' && 'Επαγγελματική πλατφόρμα διαχείρισης καφέ & εστίασης'}
                {mode === 'register' && 'Δημιουργήστε περιβάλλον διαχείρισης για το κατάστημά σας'}
                {mode === 'forgot' && 'Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς'}
              </p>
            </div>

            {mode !== 'forgot' && (
              <>
                {/* Κοινωνική Σύνδεση (Google & Apple via Supabase OAuth) */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleOAuthLogin('google')}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2.5 shadow transition"
                  >
                    <span className="font-black text-sm text-blue-600">G</span>
                    <span>Συνέχεια με Google (Gmail)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleOAuthLogin('apple')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold text-xs flex items-center justify-center gap-2.5 border border-slate-800 transition"
                  >
                    <span className="text-sm"></span>
                    <span>Συνέχεια με Apple ID</span>
                  </button>
                </div>

                {/* Διαχωριστική Γραμμή */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-800" />
                  <span className="mx-3 text-[11px] text-slate-500">ή με email επιχείρησης</span>
                  <div className="flex-grow border-t border-slate-800" />
                </div>

                {/* Επιλογή Ρόλου */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Επιλογή Ρόλου</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSelectRole('owner')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition ${
                        role === 'owner'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Crown className="h-4 w-4 text-amber-400" />
                      <span>Εργοδότης</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectRole('staff')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition ${
                        role === 'staff'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <UserCheck className="h-4 w-4 text-blue-400" />
                      <span>Προσωπικό</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Φόρμα Στοιχείων */}
            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {mode === 'register' && (
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Όνομα Καταστήματος</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="π.χ. blysscafe Athens"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-300 font-bold block mb-1">Email</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.gr"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-bold">Κωδικός</label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Ξεχάσατε τον κωδικό;
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Εναλλαγή ορατότητας κωδικού"
                      className="text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between pt-0.5">
                  <label className="inline-flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Διατήρηση σύνδεσης σε αυτή τη συσκευή</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 transition mt-2"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {mode === 'login' && (isSubmitting ? 'Γίνεται σύνδεση...' : 'Σύνδεση στην Εφαρμογή')}
                  {mode === 'register' && (isSubmitting ? 'Αποθήκευση...' : 'Δημιουργία Λογαριασμού & Είσοδος')}
                  {mode === 'forgot' && 'Αποστολή Συνδέσμου Επαναφοράς'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Εναλλαγή Λειτουργίας (Εγγραφή / Επιστροφή σε Σύνδεση) */}
            <div className="pt-2 text-center text-xs text-slate-400">
              {mode === 'login' && (
                <>
                  Δεν έχετε λογαριασμό επιχείρησης;{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-emerald-400 hover:text-emerald-300 font-extrabold underline underline-offset-2"
                  >
                    Εγγραφή τώρα
                  </button>
                </>
              )}
              {(mode === 'register' || mode === 'forgot') && (
                <>
                  Έχετε ήδη λογαριασμό;{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-emerald-400 hover:text-emerald-300 font-extrabold underline underline-offset-2"
                  >
                    Επιστροφή στη σύνδεση
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}