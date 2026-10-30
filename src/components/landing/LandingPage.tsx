import React, { useState } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  Save, 
  Download, 
  Check, 
  Play, 
  ChevronDown,
  Smartphone,
  Sparkles,
  BookOpen,
  Zap,
  ShieldCheck,
  Flame,
  Brain
} from 'lucide-react';
import { KittyBow, AestheticMascot } from '../common/KittyIllustrations';
import { FloatingPetals } from '../common/FloatingPetals';
import { sounds } from '../../services/audio';
import { Deck } from '../../types/anki';

interface LandingPageProps {
  decks: Deck[];
  user?: import('../../types/anki').UserAccount | null;
  onLaunchApp: () => void;
  onOpenDeck: (deck: Deck) => void;
  onOpenImport: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onLogout?: () => void;
  onOpenInstall?: () => void;
}

const DEMO_CARDS = [
  {
    topic: 'Japanese JLPT N5',
    tag: 'Japanese 🌸',
    front: '食べる (たべる)',
    back: 'To eat (Ichidan verb)\n\n寿司を食べる (I eat sushi)',
    takeaway: 'Pair with the を (wo) particle to mark the direct food object.',
    previews: { again: '<10m', hard: '12h', good: '1d', easy: '4d' }
  },
  {
    topic: 'Computer Science',
    tag: 'Code 💻',
    front: 'What is the time complexity of binary search on a sorted array?',
    back: 'O(log n) time complexity, O(1) auxiliary space.\n\nHalves search space on each step.',
    takeaway: 'Requires the underlying sequence to be strictly sorted first.',
    previews: { again: '<10m', hard: '1d', good: '3d', easy: '6d' }
  },
  {
    topic: 'Biology Fundamentals',
    tag: 'Biology 🧬',
    front: 'What is the primary function of Mitochondria in eukaryotic cells?',
    back: 'Generate ATP through oxidative phosphorylation (cellular respiration).',
    takeaway: 'Mitochondria contain circular mtDNA inherited maternally.',
    previews: { again: '<10m', hard: '18h', good: '2d', easy: '5d' }
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  decks,
  user,
  onLaunchApp,
  onOpenDeck,
  onOpenImport,
  onOpenAuth,
  onLogout,
  onOpenInstall,
}) => {
  const [demoIndex, setDemoIndex] = useState<number>(0);
  const [isDemoFlipped, setIsDemoFlipped] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const currentDemo = DEMO_CARDS[demoIndex];

  const handleDemoFlip = () => {
    sounds.playFlip();
    setIsDemoFlipped(!isDemoFlipped);
  };

  const handleDemoRate = (rating: 1 | 2 | 3 | 4) => {
    sounds.playRating(rating);
    setIsDemoFlipped(false);
    setDemoIndex((prev) => (prev + 1) % DEMO_CARDS.length);
  };

  return (
    <div className="min-h-screen bg-[#faf9fb] text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900 relative overflow-x-hidden">
      
      {/* Subtle Top Ambient Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(244,63,94,0.12),transparent)]" />

      {/* Modern Frosted Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer group" onClick={onLaunchApp}>
            <div className="p-1 rounded-lg group-hover:scale-105 transition-transform">
              <KittyBow size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Ankitti
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 hidden sm:inline-block">
              Spaced Repetition
            </span>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#practice" className="hover:text-slate-900 transition-colors">Interactive Demo</a>
            <a href="#comparison" className="hover:text-slate-900 transition-colors">Why Ankitti</a>
            <a href="#decks" className="hover:text-slate-900 transition-colors">Starter Decks</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {onOpenInstall && (
              <button
                onClick={() => { sounds.playClick(); onOpenInstall(); }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                title="Install Ankitti as an offline PWA app"
              >
                <Smartphone size={13} className="text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">App</span>
              </button>
            )}

            {user?.email ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="text-xs sm:text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <span>Open Studio</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { sounds.playClick(); onOpenAuth?.('login'); }}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { sounds.playClick(); onOpenAuth?.('signup'); }}
                  className="text-xs sm:text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white px-4 sm:px-4.5 py-2 rounded-full shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 shadow-2xs text-xs font-semibold text-rose-700">
                <KittyBow size={15} />
                <span>SuperMemo SM-2 Science • Distraction-Free Flow</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Spaced repetition designed for deep focus.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                Master languages, medical concepts, algorithms, and exams with Anki's math-backed memory engine. Enjoy zero same-day lockouts, auto-saved drafts, and modern distraction-free craft.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {user?.email ? (
                  <button
                    onClick={() => { sounds.playClick(); onLaunchApp(); }}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full text-sm sm:text-base shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                  >
                    <span>Enter Ankitti Studio</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => { sounds.playClick(); onOpenAuth?.('signup'); }}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full text-sm sm:text-base shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight size={16} />
                  </button>
                )}

                <button
                  onClick={() => {
                    sounds.playClick();
                    if (user?.email) {
                      onOpenImport();
                    } else {
                      onOpenAuth?.('signup');
                    }
                  }}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-full text-sm sm:text-base border border-slate-200 shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <Download size={15} className="text-slate-500" />
                  <span>Import Anki (.apkg)</span>
                </button>
              </div>

              {/* Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-medium text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Check size={14} className="text-emerald-500" />
                  <span>100% Free & Private</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check size={14} className="text-rose-500" />
                  <span>Relearn Anytime</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check size={14} className="text-indigo-500" />
                  <span>Draft Auto-Recovery</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Practice Flashcard */}
            <div id="practice" className="lg:col-span-5 flex flex-col items-center">
              
              <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-6 relative">
                
                {/* Segmented Controller Demo Selector */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    {DEMO_CARDS.map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          sounds.playClick();
                          setDemoIndex(idx);
                          setIsDemoFlipped(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          demoIndex === idx
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {card.tag}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    3D Flip
                  </span>
                </div>

                {/* 3D Perspective Flashcard Container */}
                <div 
                  onClick={handleDemoFlip}
                  className="perspective-1000 w-full min-h-[220px] cursor-pointer select-none"
                  title="Click or tap to flip card"
                >
                  <div className={`relative w-full min-h-[220px] transition-transform duration-500 transform-style-3d ${isDemoFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front Face */}
                    <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-5 bg-slate-50/70 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                          {currentDemo.topic}
                        </span>
                        <KittyBow size={18} />
                      </div>

                      <div className="my-auto text-center font-bold text-2xl text-slate-900 leading-snug">
                        {currentDemo.front}
                      </div>

                      <div className="text-center text-xs text-slate-400 font-medium flex items-center justify-center space-x-1.5">
                        <RotateCcw size={12} />
                        <span>Tap to reveal answer</span>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-5 bg-white rounded-2xl border border-rose-300 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          Answer
                        </span>
                        <KittyBow size={18} />
                      </div>

                      <div className="my-auto text-slate-900 font-semibold text-base leading-relaxed whitespace-pre-wrap text-left">
                        {currentDemo.back}
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/80 text-left">
                        <strong className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                          Key Concept
                        </strong>
                        {currentDemo.takeaway}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {!isDemoFlipped ? (
                    <button
                      onClick={handleDemoFlip}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer active:scale-[0.99]"
                    >
                      <RotateCcw size={13} />
                      <span>Show Answer (Flip)</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleDemoRate(1)}
                        className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-center border border-rose-200 transition-colors cursor-pointer"
                      >
                        <div className="text-[10px] font-bold uppercase">Again</div>
                        <div className="text-[11px] font-mono font-medium">{currentDemo.previews.again}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(2)}
                        className="py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-center border border-amber-200 transition-colors cursor-pointer"
                      >
                        <div className="text-[10px] font-bold uppercase">Hard</div>
                        <div className="text-[11px] font-mono font-medium">{currentDemo.previews.hard}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(3)}
                        className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-center border border-blue-200 transition-colors cursor-pointer"
                      >
                        <div className="text-[10px] font-bold uppercase">Good</div>
                        <div className="text-[11px] font-mono font-medium">{currentDemo.previews.good}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(4)}
                        className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <div className="text-[10px] font-bold uppercase">Easy</div>
                        <div className="text-[11px] font-mono font-medium">{currentDemo.previews.easy}</div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Study Companion Mascot Avatar */}
              <div className="mt-4 flex items-center space-x-2.5 px-3.5 py-1.5 bg-white rounded-full border border-slate-200 shadow-2xs">
                <img 
                  src="/assets/reading_mascot.png" 
                  alt="Mascot" 
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <span className="text-xs font-medium text-slate-700">
                  Ready to study whenever you are.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="py-16 md:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for memory. Polished for flow.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-normal">
              Everything that makes spaced repetition effective, elevated with modern typography and distraction-free design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-[#faf9fb] border border-slate-200/80 space-y-3 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
                <RotateCcw size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Relearn Anytime Mode
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Standard Anki locks you out once cards hit zero. In Ankitti, you have total control: repeat, drill, or relearn any deck whenever inspiration strikes.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-[#faf9fb] border border-slate-200/80 space-y-3 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                <Save size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Auto-Saved Drafts
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Never lose a card you spent time composing. Every keystroke is saved in real time into browser storage with automatic recovery if you close the tab.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-[#faf9fb] border border-slate-200/80 space-y-3 hover:border-slate-300 hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
                <Download size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Full .apkg Anki Import
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Transfer your entire collection seamlessly. Our in-browser SQLite WASM unpacker parses Anki decks, tags, and media without installing extra desktop tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section id="comparison" className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Anki vs. Ankitti
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-normal">
              Proven cognitive algorithms meet modern craft and flexibility.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5 font-semibold text-slate-800">Capability</th>
                  <th className="py-3.5 px-5 font-medium text-slate-500">Legacy Anki</th>
                  <th className="py-3.5 px-5 font-bold text-rose-700 bg-rose-50/50">Ankitti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">Repeat & Relearn on Demand</td>
                  <td className="py-3.5 px-5 text-slate-500">Locked out until next scheduled day</td>
                  <td className="py-3.5 px-5 font-semibold text-rose-700 bg-rose-50/20">Relearn anytime with 1 click</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">Draft Auto-Save & Recovery</td>
                  <td className="py-3.5 px-5 text-slate-500">Lost if window or tab closes</td>
                  <td className="py-3.5 px-5 font-semibold text-rose-700 bg-rose-50/20">Saved in real-time on keystroke</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">Anki Package (.apkg) Support</td>
                  <td className="py-3.5 px-5 text-slate-500">Native format</td>
                  <td className="py-3.5 px-5 font-semibold text-rose-700 bg-rose-50/20">WASM unpacker in browser</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">Design & Typography</td>
                  <td className="py-3.5 px-5 text-slate-500">Dated legacy desktop dialogs</td>
                  <td className="py-3.5 px-5 font-semibold text-rose-700 bg-rose-50/20">Modern, distraction-free typography</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">Focus Tools</td>
                  <td className="py-3.5 px-5 text-slate-500">Requires third-party add-ons</td>
                  <td className="py-3.5 px-5 font-semibold text-rose-700 bg-rose-50/20">Built-in Pomodoro focus timer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Starter Decks Showcase */}
      <section id="decks" className="py-16 md:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Curated Starter Decks
              </h2>
              <p className="text-slate-600 text-sm mt-1 font-normal">
                Start studying immediately with pre-loaded high-yield decks.
              </p>
            </div>

            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>View all decks in Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {decks.slice(0, 4).map((deck) => (
              <div 
                key={deck.id}
                className="p-5 rounded-2xl bg-[#faf9fb] border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 mb-2.5 inline-block">
                    Starter Deck
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    {deck.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 font-normal leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    SM-2 Ready
                  </span>
                  <button
                    onClick={() => { sounds.playClick(); onOpenDeck(deck); }}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <span>Practice</span>
                    <Play size={10} className="fill-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mascot Companion Banner */}
      <section className="py-16 md:py-20 bg-[#faf9fb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg text-left">
              <div className="flex items-center space-x-2">
                <KittyBow size={20} />
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Friendly Study Companion</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Study sessions that keep you encouraged.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Studying for high-stakes exams can be draining. Ankitti balances rigorous cognitive algorithms with joyful, clean aesthetics—making daily reviews something you look forward to.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full text-xs sm:text-sm shadow-xs transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <KittyBow size={15} />
                  <span>Enter Ankitti Studio</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-50 rounded-2xl p-2 shadow-2xs border border-slate-200 flex items-center justify-center">
                <img src="/assets/hero_mascot.png" alt="Study mascot" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-50 rounded-2xl p-2 shadow-2xs border border-slate-200 flex items-center justify-center">
                <img src="/assets/celebrate_mascot.png" alt="Celebrate mascot" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm font-normal">
              Common questions about Ankitti, syncing, and spaced repetition.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Can I import my existing Anki decks (.apkg)?',
                a: 'Yes. Ankitti includes an in-browser SQLite parser that reads Anki packages (.apkg), CSV, TSV, and JSON files without sending any card content to an external server.'
              },
              {
                q: 'How does the "Relearn Anytime" feature work?',
                a: 'Standard Anki locks cards once their daily review is finished. Ankitti lets you click "Relearn Anytime" on any deck to immediately review cards or drill high-yield material whenever you want.'
              },
              {
                q: 'Will I lose my cards if I close the browser?',
                a: 'No. All decks, cards, review history, and in-progress card editor drafts are saved immediately into local browser storage on every keystroke.'
              },
              {
                q: 'Does Ankitti use the real SuperMemo SM-2 algorithm?',
                a: 'Yes. It faithfully calculates interval multipliers, ease factors (starting at 2.5), lapse penalties, and graduating steps according to the SM-2 specification.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-[#faf9fb]"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4.5 text-left font-semibold text-slate-900 flex items-center justify-between text-sm cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={16} 
                    className={`transform transition-transform text-slate-400 ${activeFaq === idx ? 'rotate-180 text-slate-700' : ''}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4.5 pb-4.5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-slate-200 text-slate-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <KittyBow size={18} />
            <span className="font-bold text-slate-900 text-sm tracking-tight">Ankitti</span>
            <span className="text-xs text-slate-400 ml-2">© 2026 • Elevated Spaced Repetition</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Open Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
