import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Download, 
  Check, 
  Layers, 
  Clock, 
  Brain, 
  Play, 
  ChevronDown,
  Volume2,
  Zap,
  Heart,
  BookOpen
} from 'lucide-react';
import { KittyBow, AestheticMascot, CuteSparkleStar } from '../common/KittyIllustrations';
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
}

const DEMO_CARDS = [
  {
    topic: 'Japanese JLPT N5',
    tag: 'Japanese 🌸',
    front: '食べる (たべる)',
    back: 'To eat (Ichidan verb)\n\n寿司を食べる (I eat sushi)',
    takeaway: 'Pair with the を (wo) particle to mark the direct food object.',
    previews: { again: '< 10m', hard: '12h', good: '1d', easy: '4d' }
  },
  {
    topic: 'Computer Science',
    tag: 'Code 💻',
    front: 'What is the time complexity of binary search on a sorted array?',
    back: 'O(log n) time complexity, O(1) space.\n\nHalves the search space each step.',
    takeaway: 'Requires the underlying array or sequence to be strictly sorted first.',
    previews: { again: '< 10m', hard: '1d', good: '3d', easy: '6d' }
  },
  {
    topic: 'Biology Fundamentals',
    tag: 'Biology 🧬',
    front: 'What is the primary function of Mitochondria in eukaryotic cells?',
    back: 'Generate ATP through oxidative phosphorylation (cellular respiration).',
    takeaway: 'Mitochondria contain circular mtDNA inherited maternally.',
    previews: { again: '< 10m', hard: '18h', good: '2d', easy: '5d' }
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
    <div className="min-h-screen bg-transparent text-[#2e1065] font-sans selection:bg-[#ffd1dc] selection:text-[#9f1239] relative overflow-x-hidden">
      
      {/* Falling Sakura Cherry Blossoms */}
      <FloatingPetals enabled={true} />

      {/* iOS Frosted Glass Navigation Bar */}
      <header className="sticky top-0 z-50 ios-glass border-b border-pink-200/60 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand with Cute Hello Kitty Bow */}
          <div className="flex items-center space-x-2.5 cursor-pointer group" onClick={onLaunchApp}>
            <KittyBow size={26} className="transform group-hover:scale-115 group-hover:rotate-6 transition-transform" />
            <span className="font-black text-xl tracking-tight text-[#be123c]">
              Ankitti
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 shadow-xs hidden sm:inline-block">
              Spaced Repetition 🎀
            </span>
          </div>

          {/* iOS Centered Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-pink-600 transition-colors">Features</a>
            <a href="#practice" className="hover:text-pink-600 transition-colors">Interactive Practice</a>
            <a href="#comparison" className="hover:text-pink-600 transition-colors">Anki vs Ankitti</a>
            <a href="#decks" className="hover:text-pink-600 transition-colors">Starter Decks</a>
            <a href="#faq" className="hover:text-pink-600 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {user?.email ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-extrabold text-pink-700 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-200 shadow-xs">
                  <span>🎀</span>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="text-xs sm:text-sm font-bold bg-[#FF4D80] hover:bg-[#F43F5E] text-white px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-all ios-btn flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Open Studio</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { sounds.playClick(); onOpenAuth?.('login'); }}
                  className="text-xs font-bold text-slate-700 hover:text-pink-600 px-3.5 py-2 rounded-full bg-white/90 border border-pink-200 hover:border-pink-300 transition-all ios-btn shadow-xs cursor-pointer"
                >
                  Sign In 🎀
                </button>
                <button
                  onClick={() => { sounds.playClick(); onOpenAuth?.('signup'); }}
                  className="text-xs sm:text-sm font-bold bg-[#FF4D80] hover:bg-[#F43F5E] text-white px-4 sm:px-5 py-2 rounded-full shadow-sm hover:shadow-md transition-all ios-btn flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Create Account</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-pink-200 shadow-xs text-xs font-bold text-[#be123c]">
                <KittyBow size={16} />
                <span>SuperMemo SM-2 Algorithm • Hello Kitty Aesthetics</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Spaced repetition that is cute, powerful, and distraction-free.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                Master Japanese, computer science, biology, and exams with Anki's math-backed memory engine. Enjoy zero same-day repeat lockouts, automatic draft recovery, and iOS-grade fluid animations.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {user?.email ? (
                  <button
                    onClick={() => { sounds.playClick(); onLaunchApp(); }}
                    className="px-7 py-3.5 bg-[#ff3366] hover:bg-[#e11d48] text-white font-extrabold rounded-full text-sm sm:text-base shadow-md hover:shadow-lg transition-all ios-btn flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <KittyBow size={18} />
                    <span>Enter Ankitti Studio</span>
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <button
                    onClick={() => { sounds.playClick(); onOpenAuth?.('signup'); }}
                    className="px-7 py-3.5 bg-[#ff3366] hover:bg-[#e11d48] text-white font-extrabold rounded-full text-sm sm:text-base shadow-md hover:shadow-lg transition-all ios-btn flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <KittyBow size={18} />
                    <span>Create Free Account</span>
                    <ArrowRight size={17} />
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
                  className="px-6 py-3.5 bg-white hover:bg-pink-50 text-slate-700 font-bold rounded-full text-sm sm:text-base border border-pink-200 transition-all ios-btn flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                >
                  <Download size={16} className="text-pink-500" />
                  <span>Import Anki (.apkg)</span>
                </button>
              </div>

              {/* Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Check size={14} className="text-emerald-500" />
                  <span>100% Free & Private</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check size={14} className="text-pink-500" />
                  <span>Relearn Anytime Mode</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check size={14} className="text-indigo-500" />
                  <span>Auto-Save Drafts</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Practice Flashcard & Cute Mascot */}
            <div id="practice" className="lg:col-span-5 flex flex-col items-center">
              
              <div className="w-full max-w-md bg-white/95 rounded-[32px] border-2 border-pink-200 shadow-xl p-6 relative">
                
                {/* iOS Segmented Controller Demo Selector */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-100">
                  <div className="flex items-center space-x-1 bg-pink-100/70 p-1 rounded-full border border-pink-200/80 text-[11px] font-bold">
                    {DEMO_CARDS.map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          sounds.playClick();
                          setDemoIndex(idx);
                          setIsDemoFlipped(false);
                        }}
                        className={`px-3 py-1 rounded-full transition-all ${
                          demoIndex === idx
                            ? 'bg-white text-pink-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {card.tag}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-pink-400 font-bold">
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
                    <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-5 bg-[#fff8fa] rounded-2xl border-2 border-pink-200 shadow-sm hover:border-pink-300 transition-colors">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full">
                          {currentDemo.topic}
                        </span>
                        <KittyBow size={20} />
                      </div>

                      <div className="my-auto text-center font-black text-2xl text-slate-800 leading-snug">
                        {currentDemo.front}
                      </div>

                      <div className="text-center text-xs text-pink-400 font-bold flex items-center justify-center space-x-1.5">
                        <RotateCcw size={12} />
                        <span>Tap to flip answer 🎀</span>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-5 bg-white rounded-2xl border-2 border-rose-300 shadow-md">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                          Answer
                        </span>
                        <KittyBow size={20} />
                      </div>

                      <div className="my-auto text-slate-900 font-bold text-base leading-relaxed whitespace-pre-wrap text-left">
                        {currentDemo.back}
                      </div>

                      <div className="p-2.5 bg-pink-50/80 rounded-xl text-xs text-pink-950 border border-pink-200/80 text-left">
                        <strong className="block text-[10px] uppercase font-black text-pink-700 mb-0.5">
                          💡 Concept Insight
                        </strong>
                        {currentDemo.takeaway}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Bar (Simulating SM-2 Intervals) */}
                <div className="mt-4 pt-3 border-t border-pink-100">
                  {!isDemoFlipped ? (
                    <button
                      onClick={handleDemoFlip}
                      className="w-full py-2.5 bg-[#ff3366] hover:bg-[#e11d48] text-white rounded-xl text-xs font-bold transition-all ios-btn flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <RotateCcw size={13} />
                      <span>Show Answer (Flip)</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleDemoRate(1)}
                        className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-center border border-rose-200 ios-btn"
                      >
                        <div className="text-[10px] font-extrabold uppercase">Again</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.again}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(2)}
                        className="py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-center border border-amber-200 ios-btn"
                      >
                        <div className="text-[10px] font-extrabold uppercase">Hard</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.hard}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(3)}
                        className="py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-center border border-pink-200 ios-btn"
                      >
                        <div className="text-[10px] font-extrabold uppercase">Good</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.good}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(4)}
                        className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center border border-emerald-200 ios-btn"
                      >
                        <div className="text-[10px] font-extrabold uppercase">Easy</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.easy}</div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Study Companion Mascot Avatar */}
              <div className="mt-4 flex items-center space-x-3 px-4 py-2 bg-white/90 rounded-full border border-pink-200 shadow-xs mascot-float">
                <img 
                  src="/assets/reading_mascot.png" 
                  alt="Mascot" 
                  className="w-9 h-9 rounded-full object-cover border border-pink-200"
                />
                <span className="text-xs font-bold text-slate-700">
                  Ready to study with you anytime! 🎀
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="py-16 md:py-24 bg-white border-y border-pink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Designed for memory. Sweet on your soul.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Everything that makes spaced repetition effective, elevated with Hello Kitty warmth and Apple iOS smoothness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="p-7 rounded-[28px] bg-[#fff8fa] border-2 border-pink-200/90 space-y-4 hover:-translate-y-1 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center text-[#ff3366]">
                <RotateCcw size={22} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Relearn Anytime Mode 🔄
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Anki locks you out once cards hit zero. In Ankitti, you have total freedom: repeat, drill, or relearn any deck whenever inspiration strikes.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 rounded-[28px] bg-[#fff8fa] border-2 border-pink-200/90 space-y-4 hover:-translate-y-1 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Save size={22} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Auto-Saved Drafts ✏️
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Never lose a card you spent 10 minutes writing. Every keystroke is saved in real time into browser storage with instant recovery.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 rounded-[28px] bg-[#fff8fa] border-2 border-pink-200/90 space-y-4 hover:-translate-y-1 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600">
                <Download size={22} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Full .apkg Anki Import 📦
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Transfer your entire collection seamlessly. Our in-browser SQLite WASM unpacker parses Anki decks, tags, and media without installing extra tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section id="comparison" className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why learners switch to Ankitti 🎀
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Proven cognitive science meets modern Apple-grade craft.
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border-2 border-pink-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fff8fa] border-b border-pink-200">
                <tr>
                  <th className="py-4 px-6 font-black text-slate-900">Feature</th>
                  <th className="py-4 px-6 font-bold text-slate-500">Legacy Anki</th>
                  <th className="py-4 px-6 font-black text-[#ff3366] bg-pink-50/70">Ankitti 🎀</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100 font-medium">
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Repeat & Relearn on Demand</td>
                  <td className="py-4 px-6 text-slate-500">❌ Locked out until tomorrow</td>
                  <td className="py-4 px-6 font-extrabold text-[#be123c] bg-pink-50/40">✅ Relearn anytime with 1 tap</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Draft Auto-Save & Recovery</td>
                  <td className="py-4 px-6 text-slate-500">❌ Work lost if tab closed</td>
                  <td className="py-4 px-6 font-extrabold text-[#be123c] bg-pink-50/40">✅ Auto-saved on every keystroke</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Anki Package (.apkg) Support</td>
                  <td className="py-4 px-6 text-slate-500">✅ Native format</td>
                  <td className="py-4 px-6 font-extrabold text-[#be123c] bg-pink-50/40">✅ In-browser WASM unpacker</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Design & Animations</td>
                  <td className="py-4 px-6 text-slate-500">❌ 1990s desktop grey windows</td>
                  <td className="py-4 px-6 font-extrabold text-[#be123c] bg-pink-50/40">✅ iOS style 3D flip + cute Sanrio art</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Audio Feedback & Focus Tools</td>
                  <td className="py-4 px-6 text-slate-500">❌ None without add-ons</td>
                  <td className="py-4 px-6 font-extrabold text-[#be123c] bg-pink-50/40">✅ Built-in Pomodoro & cute chimes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Starter Decks Showcase */}
      <section id="decks" className="py-16 md:py-24 bg-white border-t border-pink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Curated Starter Decks
              </h2>
              <p className="text-slate-600 text-sm mt-1 font-medium">
                Jump right in and start learning with pre-loaded decks.
              </p>
            </div>

            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="text-xs font-extrabold text-[#ff3366] hover:text-[#be123c] flex items-center space-x-1"
            >
              <span>View all decks in Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {decks.slice(0, 4).map((deck) => (
              <div 
                key={deck.id}
                className="p-5 rounded-[26px] bg-[#fff8fa] border-2 border-pink-200/80 hover:border-pink-300 transition-all flex flex-col justify-between shadow-xs hover:-translate-y-1"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 mb-2 inline-block">
                    Starter Deck
                  </span>
                  <h3 className="font-black text-slate-900 text-base mb-1">
                    {deck.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                    {deck.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-pink-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400">
                    SM-2 Ready
                  </span>
                  <button
                    onClick={() => { sounds.playClick(); onOpenDeck(deck); }}
                    className="px-3.5 py-1.5 bg-[#ff3366] hover:bg-[#e11d48] text-white text-xs font-bold rounded-full transition-colors flex items-center space-x-1 ios-btn shadow-xs"
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

      {/* Mascot Gallery Section */}
      <section className="py-16 md:py-24 bg-[#fff5f7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-[32px] p-8 md:p-12 border-2 border-pink-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-lg text-left">
              <div className="flex items-center space-x-2">
                <KittyBow size={22} />
                <span className="text-xs font-extrabold uppercase tracking-wider text-pink-600">Sanrio Hello Kitty Companion</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Study sessions that spark joy.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Long study sessions can feel exhausting. Ankitti pairs proven cognitive science with warm, joyful craft—giving you a dedicated companion who celebrates every milestone with you.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="px-7 py-3 bg-[#ff3366] hover:bg-[#e11d48] text-white font-extrabold rounded-full text-xs sm:text-sm shadow-sm ios-btn flex items-center space-x-2"
                >
                  <KittyBow size={16} />
                  <span>Enter Ankitti Studio</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="w-36 h-36 sm:w-44 sm:h-44 bg-[#fff8fa] rounded-2xl p-2 shadow-xs border border-pink-200 flex items-center justify-center mascot-float">
                <img src="/assets/hero_mascot.png" alt="Study mascot" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="w-36 h-36 sm:w-44 sm:h-44 bg-[#fff8fa] rounded-2xl p-2 shadow-xs border border-pink-200 flex items-center justify-center mascot-float" style={{ animationDelay: '1.5s' }}>
                <img src="/assets/celebrate_mascot.png" alt="Celebrate mascot" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white border-t border-pink-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Everything you need to know about Ankitti.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Can I import my existing Anki decks (.apkg)?',
                a: 'Yes! Ankitti includes a browser-side SQLite parser that reads Anki packages (.apkg), CSV, TSV, and JSON files without sending any data to a remote server.'
              },
              {
                q: 'How does the "Relearn Anytime" feature work?',
                a: 'Standard Anki locks cards once their daily review is finished. Ankitti lets you click "Relearn Anytime" on any deck to immediately review all cards or just high-yield ones whenever you want.'
              },
              {
                q: 'Will I lose my cards if I close the browser?',
                a: 'No. All decks, cards, review logs, and in-progress drafts are saved immediately into browser storage on every keystroke.'
              },
              {
                q: 'Does Ankitti use the real SuperMemo SM-2 algorithm?',
                a: 'Yes. It faithfully calculates interval multipliers, ease factors (starting at 2.5), lapse penalties, and graduating steps according to the SM-2 specification.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border-2 border-pink-100 rounded-2xl overflow-hidden bg-[#fff8fa]"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={16} 
                    className={`transform transition-transform text-pink-400 ${activeFaq === idx ? 'rotate-180 text-pink-600' : ''}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-pink-100 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA & Footer */}
      <footer className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <KittyBow size={20} />
            <span className="font-extrabold text-base tracking-tight">Ankitti</span>
            <span className="text-xs text-slate-400 ml-2">© 2026 • Elevated Spaced Repetition 🎀</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="px-5 py-2.5 bg-[#ff3366] hover:bg-[#e11d48] text-white text-xs font-bold rounded-full transition-colors flex items-center space-x-1.5 ios-btn shadow-xs"
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
