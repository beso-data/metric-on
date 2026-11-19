// app/components/views/SupportView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useMetric } from '@/app/context/MetricContext';
import {
  HelpCircle, Search, ChevronDown, ChevronUp, ArrowUpRight,
  Send, CheckCircle2, ShieldCheck, BookOpen, MessageSquare
} from 'lucide-react';

interface FaqEntry {
  id: string;
  category: 'Ταμείο & Ζ' | 'Αποθήκη & Παραγγελίες' | 'Προσωπικό & Portal' | 'Οικονομικά & Ρυθμίσεις';
  question: string;
  answer: string;
  targetTab?: 'sales' | 'inventory' | 'suppliers' | 'recipes' | 'invoices' | 'payroll' | 'settings';
  targetLabel?: string;
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'faq-1',
    category: 'Ταμείο & Ζ',
    question: 'Πώς λειτουργεί η ανάγνωση αρχείων Ζ (PDF / CSV / TXT) και η επιλογή ημερομηνίας;',
    answer:
      'Στο «Ταμείο & Κλείσιμο Ζ» μπορείτε να επιλέξετε οποιαδήποτε ημερομηνία από το ημερολόγιο ή τα βελάκια για να δείτε ή να τροποποιήσετε τα στοιχεία της ημέρας. Με την «Εισαγωγή Αρχείου Ζ» (ή «Επικόλληση Κειμένου Ζ») το σύστημα εξάγει τα ποσά και τα είδη πωλήσεων και ενημερώνει την οθόνη.',
    targetTab: 'sales',
    targetLabel: 'Μετάβαση στο Ταμείο & Ζ'
  },
  {
    id: 'faq-2',
    category: 'Ταμείο & Ζ',
    question: 'Τι κάνει το Safe Drop στο χρηματοκιβώτιο;',
    answer:
      'Μεταφέρει τα καθαρά μετρητά του συρταριού (πέρα από το αρχικό Cash Float και τυχόν μικροέξοδα) στο υπόλοιπο του χρηματοκιβωτίου, αφήνοντας το συρτάρι έτοιμο με την αρχική ρευστότητα για την επόμενη βάρδια.',
    targetTab: 'sales',
    targetLabel: 'Άνοιγμα Ταμείου'
  },
  {
    id: 'faq-3',
    category: 'Αποθήκη & Παραγγελίες',
    question: 'Πώς συνδέεται η Αποθήκη με τους Προμηθευτές και τις Συνταγές BOM;',
    answer:
      'Στην Αποθήκη παρακολουθείτε αποθέματα, όρια έλλειψης (Threshold) και κόστος μονάδας. Στους Προμηθευτές μπορείτε να διαχειριστείτε τον κατάλογο κάθε συνεργάτη, να συμπληρώσετε αυτόματα τις ελλείψεις και να καταχωρήσετε παραλαβή παραγγελίας.',
    targetTab: 'suppliers',
    targetLabel: 'Άνοιγμα Προμηθευτών'
  },
  {
    id: 'faq-4',
    category: 'Προσωπικό & Portal',
    question: 'Πώς φαίνονται οι εγκεκριμένες άδειες στους υπόλοιπους εργαζόμενους χωρίς να χάνεται η ιδιωτικότητα;',
    answer:
      'Όταν εγκρίνετε ένα αίτημα άδειας ή βάρδιας στο «Προσωπικό & Μισθοδοσία», μπορείτε να ορίσετε αν θα είναι ορατό στους συναδέλφους. Αν είναι ενεργό, στο Staff Portal φαίνεται η δεσμευμένη ημέρα ώστε να αποφεύγονται διπλές αιτήσεις την ίδια μέρα.',
    targetTab: 'payroll',
    targetLabel: 'Άνοιγμα Προσωπικού'
  },
  {
    id: 'faq-5',
    category: 'Οικονομικά & Ρυθμίσεις',
    question: 'Πώς υπολογίζεται το περιθώριο κέρδους στις Συνταγές BOM για delivery;',
    answer:
      'Στις «Συνταγές BOM» μπορείτε να συγκρίνετε την τιμή καταλόγου του καταστήματος με την προσομοίωση προμήθειας delivery (-15%), να δείτε αν το προϊόν πιάνει τον στόχο margin και να προσαρμόσετε την τιμή.',
    targetTab: 'recipes',
    targetLabel: 'Άνοιγμα Συνταγών BOM'
  }
];

interface SupportNote {
  id: number;
  subject: string;
  message: string;
  createdAt: string;
}

export default function SupportView() {
  const { setOwnerTab, employerConfig, notify } = useMetric();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openFaqIds, setOpenFaqIds] = useState<{ [id: string]: boolean }>({ 'faq-1': true });

  // Φόρμα σημειώσεων / ερωτημάτων εργοδότη
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<SupportNote[]>([
    {
      id: 1,
      subject: 'Έλεγχος προμηθειών delivery & πάγιων',
      message: 'Υπενθύμιση ελέγχου λογαριασμών ρεύματος/τηλεφωνίας και συμφωνίας POS στο τέλος του μήνα.',
      createdAt: '19/11/2026'
    }
  ]);

  const filteredFaqs = useMemo(() => {
    return FAQ_ENTRIES.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      notify('⚠️ Συμπληρώστε θέμα και περιγραφή σημείωσης.');
      return;
    }
    const newNote: SupportNote = {
      id: Date.now(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toLocaleDateString('el-GR')
    };
    setNotes([newNote, ...notes]);
    setSubject('');
    setMessage('');
    notify('✔ Η σημείωση / ερώτημα καταχωρήθηκε επιτυχώς.');
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Header & Quick Guide Cards */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-6 w-6 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">
                Υποστήριξη, Οδηγός Λειτουργίας & FAQ
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Πρακτικός οδηγός καθημερινής χρήσης για {employerConfig?.storeName || 'blysscafe Athens'}, συχνές ερωτήσεις και σημειώσεις διαχείρισης.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOwnerTab('settings')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition self-start lg:self-auto"
          >
            <span>Στοιχεία Επιχείρησης & Ρυθμίσεις</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* 3 Core Operational Reference Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>Κοστολόγηση & Prime Cost</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Συνδυάζει το κόστος πρώτων υλών (BOM) και τη μισθοδοσία σε σχέση με τον τζίρο ώστε να έχετε καθαρή εικόνα κερδοφορίας.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-extrabold text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Συμφωνία Ταμείου & Διαφάνεια</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Συγκρίνει τα μετρητά του Δελτίου Ζ, τα έξοδα συρταριού και τη φυσική καταμέτρηση για άμεσο εντοπισμό αποκλίσεων.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-extrabold text-purple-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Συντονισμός Βάρδιας (Staff Portal)</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Επιτρέπει στο προσωπικό να καταγράφει βάρδιες, καταμετρήσεις, ελλείψεις και αιτήματα χωρίς πρόσβαση σε οικονομικά στοιχεία.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Interactive FAQ & Notes Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Searchable FAQ */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="border-b border-slate-800 pb-3 space-y-3">
            <h3 className="text-base font-extrabold text-white">Συχνές Ερωτήσεις (FAQ)</h3>

            <div className="flex flex-col sm:flex-row gap-2 text-xs">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Αναζήτηση ερώτησης ή λειτουργίας..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:outline-none"
              >
                <option value="ALL">Όλες οι Ενότητες</option>
                <option value="Ταμείο & Ζ">Ταμείο & Ζ</option>
                <option value="Αποθήκη & Παραγγελίες">Αποθήκη & Παραγγελίες</option>
                <option value="Προσωπικό & Portal">Προσωπικό & Portal</option>
                <option value="Οικονομικά & Ρυθμίσεις">Οικονομικά & Ρυθμίσεις</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {filteredFaqs.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">Δεν βρέθηκαν ερωτήσεις με αυτά τα φίλτρα.</p>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = !!openFaqIds[faq.id];
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-900/50 transition"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">
                          {faq.category}
                        </span>
                        <span className="font-extrabold text-white text-xs sm:text-sm">
                          {faq.question}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-900 space-y-3 text-slate-300 leading-relaxed">
                        <p>{faq.answer}</p>
                        {faq.targetTab && faq.targetLabel && (
                          <button
                            type="button"
                            onClick={() => setOwnerTab(faq.targetTab!)}
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 hover:text-emerald-300"
                          >
                            <span>{faq.targetLabel}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 cols: Employer Notes / Ticket Log */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span>Σημειώσεις & Καταγραφή Ερωτημάτων</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Κρατήστε σημειώσεις για τον λογιστή, τεχνικά θέματα ή λειτουργικές υπενθυμίσεις.
            </p>
          </div>

          <form onSubmit={handleAddNote} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-bold">Θέμα:</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="π.χ. Έλεγχος τιμολογίων / βάρδιες εβδομάδας"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">Περιγραφή:</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Γράψτε τη σημείωση ή το ερώτημά σας..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold flex items-center justify-center gap-1.5 shadow transition"
            >
              <Send className="h-4 w-4" />
              <span>Αποθήκευση Σημείωσης</span>
            </button>
          </form>

          <div className="space-y-2.5 pt-2 text-xs">
            {notes.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white">{n.subject}</span>
                  <span className="text-[10px] font-mono text-slate-500">{n.createdAt}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}