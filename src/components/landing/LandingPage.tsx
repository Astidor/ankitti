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
  Brain,
  Coffee
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
    tag: 'Algorithms 💻',
    front: 'What is the time complexity of binary search on a sorted array?',
    back: 'O(log n) time complexity, O(1) auxiliary space.\n\nHalves search space on each step.',
    takeaway: 'Requires the underlying sequence to be strictly sorted first.',
    previews: { again: '<10m', hard: '1d', good: '3d', easy: '6d' }
  },
  {
    topic: 'Cell Biology',
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
    <div className="min-h-screen bg-[#FAF7F2] text-[#3E2D28] font-sans selection:bg-strawberry-100 selection:text-strawberry-900 relative overflow-x-hidden">
      
      {/* Ambient Pastel Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,107,157,0.14),transparent)]" />
      <div className="pointer-events-none absolute top-96 right-0 w-96 h-96 bg-[radial-gradient(circle_at_80%_50%,rgba(223,243,229,0.5),transparent)]" />

      {/* Floating Sakura Petals */}
      <FloatingPetals />

      {/* Cozy Bento Header */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EFE8DE] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer group" onClick={onLaunchApp}>
            <div className="w-8 h-8 rounded-xl bg-strawberry-100 flex items-center justify-center text-strawberry-600 shadow-2xs group-hover:scale-105 transition-transform">
              <KittyBow size={20} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-[#3E2D28]">
                Ankitti
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-strawberry-50 text-strawberry-700 border border-strawberry-200 hidden sm:inline-block">
                Cozy Bento Studio
              </span>
            </div>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-cocoa-600">
            <a href="#features" className="hover:text-strawberry-600 transition-colors">Features</a>
            <a href="#practice" className="hover:text-strawberry-600 transition-colors">Interactive Demo</a>
            <a href="#comparison" className="hover:text-strawberry-600 transition-colors">Why Ankitti</a>
            <a href="#decks" className="hover:text-strawberry-600 transition-colors">Starter Decks</a>
            <a href="#faq" className="hover:text-strawberry-600 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {onOpenInstall && (
              <button
                onClick={() => { sounds.playClick(); onOpenInstall(); }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-cocoa-700 bg-white hover:bg-cocoa-50 border border-[#EFE8DE] shadow-2xs transition-all cursor-pointer"
                title="Install Ankitti as an offline PWA app"
              >
                <Smartphone size={13} className="text-cocoa-500 shrink-0" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">App</span>
              </button>
            )}

            {user?.email ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold text-cocoa-700 bg-white px-3 py-1.5 rounded-full border border-[#EFE8DE]">
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs font-medium text-cocoa-500 hover:text-cocoa-900 px-2.5 py-1.5 rounded-full hover:bg-cocoa-100 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn text-xs sm:text-sm font-bold bg-strawberry-500 hover:bg-strawberry-600 text-white px-4 py-2 rounded-full shadow-squishy-pink flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Open Studio</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {onOpenAuth && (
                  <button
                    onClick={() => { sounds.playClick(); onOpenAuth('login'); }}
                    className="text-xs font-semibold text-cocoa-700 hover:text-[#3E2D28] px-3 py-1.5 rounded-full hover:bg-cocoa-100 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn text-xs sm:text-sm font-bold bg-strawberry-500 hover:bg-strawberry-600 text-white px-4 py-2 rounded-full shadow-squishy-pink flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Launch Studio</span>
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
            
            {/* Left Column: Messaging & Primary Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Cute Bento Pill Tag */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-strawberry-100/80 border border-strawberry-200/90 text-strawberry-700 text-xs font-bold shadow-2xs">
                <KittyBow size={14} />
                <span>SuperMemo SM-2 • Bento Studio • Cloud Sync</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3E2D28] tracking-tight leading-[1.12]">
                Spaced repetition,{' '}
                <span className="text-strawberry-500">made delightful.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-cocoa-600 leading-relaxed max-w-xl font-normal">
                Study smarter with a warm Japanese stationery studio. Full Anki package (.apkg) compatibility, instant relearning anytime, keystroke draft recovery, and AI-powered flashcard generation.
              </p>

              {/* Primary Call-to-Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn px-7 py-3.5 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-2xl font-bold text-sm shadow-squishy-pink transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <KittyBow size={16} />
                  <span>Enter Ankitti Studio</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={() => { sounds.playClick(); onOpenImport(); }}
                  className="px-5 py-3.5 bg-white hover:bg-[#FAF7F2] text-cocoa-800 rounded-2xl font-semibold text-sm border border-[#EFE8DE] shadow-xs hover:border-cocoa-300 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download size={15} className="text-cocoa-500" />
                  <span>Import .apkg Deck</span>
                </button>
              </div>

              {/* Bento Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-semibold text-cocoa-600">
                <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-[#EFE8DE] shadow-2xs">
                  <Check size={14} className="text-matcha-600" />
                  <span>100% Free & Private</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-[#EFE8DE] shadow-2xs">
                  <Check size={14} className="text-strawberry-500" />
                  <span>Relearn Anytime</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-[#EFE8DE] shadow-2xs">
                  <Check size={14} className="text-taro-600" />
                  <span>Keystroke Auto-Save</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Practice Flashcard */}
            <div id="practice" className="lg:col-span-5 flex flex-col items-center">
              
              <div className="w-full max-w-md bento-card bg-white rounded-[28px] border border-[#EFE8DE] shadow-bento p-5 sm:p-6 relative">
                
                {/* Segmented Controller Demo Selector */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EFE8DE]">
                  <div className="flex items-center space-x-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#EFE8DE] text-xs font-bold">
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
                            ? 'bg-white text-strawberry-600 shadow-2xs'
                            : 'text-cocoa-500 hover:text-cocoa-800'
                        }`}
                      >
                        {card.tag}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-cocoa-400 font-semibold">
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
                    <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-5 bg-[#FAF7F2] rounded-2xl border border-[#EFE8DE] shadow-2xs hover:border-strawberry-200 transition-colors">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-cocoa-700 bg-white border border-[#EFE8DE] px-2.5 py-0.5 rounded-full">
                          {currentDemo.topic}
                        </span>
                        <KittyBow size={18} />
                      </div>

                      <div className="my-auto text-center font-bold text-2xl text-[#3E2D28] leading-snug">
                        {currentDemo.front}
                      </div>

                      <div className="text-center text-xs text-cocoa-500 font-semibold flex items-center justify-center space-x-1.5">
                        <RotateCcw size={12} className="text-strawberry-500" />
                        <span>Tap to reveal answer</span>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-5 bg-white rounded-2xl border border-strawberry-300 shadow-bento">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-strawberry-700 bg-strawberry-50 border border-strawberry-200 px-2.5 py-0.5 rounded-full">
                          Answer 🌸
                        </span>
                        <KittyBow size={18} />
                      </div>

                      <div className="my-auto text-[#3E2D28] font-bold text-base leading-relaxed whitespace-pre-wrap text-left">
                        {currentDemo.back}
                      </div>

                      <div className="p-2.5 bg-strawberry-50/60 rounded-xl text-xs text-cocoa-700 border border-strawberry-100 text-left">
                        <strong className="block text-[10px] uppercase font-bold text-strawberry-600 mb-0.5">
                          Key Concept
                        </strong>
                        {currentDemo.takeaway}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Bar */}
                <div className="mt-4 pt-3 border-t border-[#EFE8DE]">
                  {!isDemoFlipped ? (
                    <button
                      onClick={handleDemoFlip}
                      className="squishy-btn w-full py-2.5 bg-[#3E2D28] hover:bg-[#2F211D] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Show Answer (Flip)</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleDemoRate(1)}
                        className="py-2 rounded-xl bg-strawberry-50 hover:bg-strawberry-100 text-strawberry-700 text-center border border-strawberry-200 transition-colors cursor-pointer"
                      >
                        <div className="text-[10px] font-bold uppercase">Again</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.again}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(2)}
                        className="py-2 rounded-xl bg-honey-50 hover:bg-honey-100 text-honey-800 text-center border border-honey-200 transition-colors cursor-pointer"
                      >
                        <div className="text-[10px] font-bold uppercase">Hard</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.hard}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(3)}
                        className="py-2 rounded-xl bg-matcha-50 hover:bg-matcha-100 text-matcha-800 text-center border border-matcha-200 transition-colors cursor-pointer"
                      >
                        <div className="text-[10px] font-bold uppercase">Good</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.good}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(4)}
                        className="py-2 rounded-xl bg-taro-50 hover:bg-taro-100 text-taro-800 text-center border border-taro-200 transition-colors cursor-pointer"
                      >
                        <div className="text-[10px] font-bold uppercase">Easy</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.easy}</div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Study Companion Mascot Avatar */}
              <div className="mt-4 flex items-center space-x-2.5 px-4 py-2 bg-white rounded-full border border-[#EFE8DE] shadow-2xs">
                <img 
                  src="/assets/reading_mascot.png" 
                  alt="Mascot" 
                  className="w-7 h-7 rounded-full object-cover border border-[#EFE8DE]"
                />
                <span className="text-xs font-semibold text-cocoa-700">
                  Ready to study whenever you are 🌸
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section id="features" className="py-16 md:py-24 bg-white/70 border-y border-[#EFE8DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3E2D28] tracking-tight">
              Built for memory. Polished for flow.
            </h2>
            <p className="text-cocoa-600 text-sm sm:text-base font-normal">
              Everything that makes spaced repetition scientifically effective, elevated with warm Japanese stationery charm and distraction-free typography.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Pillar 1 */}
            <div className="bento-card p-6 rounded-[28px] bg-[#FAF7F2] border border-[#EFE8DE] space-y-3 shadow-bento hover:border-strawberry-300 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-strawberry-100 border border-strawberry-200 flex items-center justify-center text-strawberry-600 shadow-2xs">
                <RotateCcw size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#3E2D28]">
                Relearn Anytime Mode
              </h3>
              <p className="text-sm text-cocoa-600 leading-relaxed font-normal">
                Standard Anki locks you out once cards hit zero. In Ankitti, you have total control: repeat, drill, or relearn any deck whenever inspiration strikes.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bento-card p-6 rounded-[28px] bg-[#FAF7F2] border border-[#EFE8DE] space-y-3 shadow-bento hover:border-matcha-300 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-matcha-100 border border-matcha-200 flex items-center justify-center text-matcha-700 shadow-2xs">
                <Save size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#3E2D28]">
                Auto-Saved Drafts
              </h3>
              <p className="text-sm text-cocoa-600 leading-relaxed font-normal">
                Never lose a card you spent time composing. Every keystroke is saved in real time into browser storage with automatic recovery if you close the tab.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bento-card p-6 rounded-[28px] bg-[#FAF7F2] border border-[#EFE8DE] space-y-3 shadow-bento hover:border-taro-300 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-taro-100 border border-taro-200 flex items-center justify-center text-taro-700 shadow-2xs">
                <Download size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#3E2D28]">
                Full .apkg Anki Import
              </h3>
              <p className="text-sm text-cocoa-600 leading-relaxed font-normal">
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
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3E2D28] tracking-tight">
              Anki vs. Ankitti
            </h2>
            <p className="text-cocoa-600 text-sm sm:text-base font-normal">
              Proven SuperMemo algorithms meet modern craft, delightful layout, and daily joy.
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#EFE8DE] bg-white shadow-bento">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF7F2] border-b border-[#EFE8DE]">
                <tr>
                  <th className="py-4 px-5 font-bold text-[#3E2D28]">Capability</th>
                  <th className="py-4 px-5 font-medium text-cocoa-500">Legacy Anki</th>
                  <th className="py-4 px-5 font-extrabold text-strawberry-700 bg-strawberry-50/70 border-l border-strawberry-100">
                    <span className="flex items-center space-x-1.5">
                      <KittyBow size={15} />
                      <span>Ankitti Studio</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DE] font-normal">
                <tr>
                  <td className="py-3.5 px-5 font-bold text-[#3E2D28]">Repeat & Relearn on Demand</td>
                  <td className="py-3.5 px-5 text-cocoa-500">Locked out until next scheduled day</td>
                  <td className="py-3.5 px-5 font-bold text-strawberry-700 bg-strawberry-50/30 border-l border-strawberry-100">Relearn anytime with 1 click</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-[#3E2D28]">Draft Auto-Save & Recovery</td>
                  <td className="py-3.5 px-5 text-cocoa-500">Lost if window or tab closes</td>
                  <td className="py-3.5 px-5 font-bold text-strawberry-700 bg-strawberry-50/30 border-l border-strawberry-100">Saved in real-time on keystroke</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-[#3E2D28]">Anki Package (.apkg) Support</td>
                  <td className="py-3.5 px-5 text-cocoa-500">Native format</td>
                  <td className="py-3.5 px-5 font-bold text-strawberry-700 bg-strawberry-50/30 border-l border-strawberry-100">WASM unpacker in browser</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-[#3E2D28]">Design & Aesthetic</td>
                  <td className="py-3.5 px-5 text-cocoa-500">Dated legacy desktop dialogs</td>
                  <td className="py-3.5 px-5 font-bold text-strawberry-700 bg-strawberry-50/30 border-l border-strawberry-100">Cozy Bento Studio + Warm Espresso</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-[#3E2D28]">Focus Tools</td>
                  <td className="py-3.5 px-5 text-cocoa-500">Requires third-party add-ons</td>
                  <td className="py-3.5 px-5 font-bold text-strawberry-700 bg-strawberry-50/30 border-l border-strawberry-100">Built-in Pomodoro focus caddy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Starter Decks Showcase */}
      <section id="decks" className="py-16 md:py-24 bg-white/70 border-t border-[#EFE8DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-[#3E2D28] tracking-tight">
                Curated Starter Decks
              </h2>
              <p className="text-cocoa-600 text-sm mt-1 font-normal">
                Start studying immediately with pre-loaded high-yield decks.
              </p>
            </div>

            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="text-xs font-bold text-strawberry-600 hover:text-strawberry-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>View all decks in Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {decks.slice(0, 4).map((deck, idx) => {
              const themes = [
                { bg: 'bg-[#FFF7F9]', border: 'border-strawberry-200/90', tag: 'bg-strawberry-100 text-strawberry-700' },
                { bg: 'bg-[#F4F9F5]', border: 'border-matcha-200/90', tag: 'bg-matcha-100 text-matcha-800' },
                { bg: 'bg-[#F9F7FC]', border: 'border-taro-200/90', tag: 'bg-taro-100 text-taro-800' },
                { bg: 'bg-[#FFFDF3]', border: 'border-honey-200/90', tag: 'bg-honey-100 text-honey-800' },
              ];
              const theme = themes[idx % themes.length];

              return (
                <div 
                  key={deck.id}
                  className={`bento-card p-5 rounded-[24px] ${theme.bg} border ${theme.border} hover:shadow-bento transition-all flex flex-col justify-between shadow-2xs`}
                >
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.tag} mb-2.5 inline-block`}>
                      Starter Deck
                    </span>
                    <h3 className="font-extrabold text-[#3E2D28] text-base mb-1">
                      {deck.name}
                    </h3>
                    <p className="text-xs text-cocoa-600 line-clamp-2 font-normal leading-relaxed">
                      {deck.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#EFE8DE] flex items-center justify-between">
                    <span className="text-xs font-semibold text-cocoa-500">
                      SM-2 Ready
                    </span>
                    <button
                      onClick={() => { sounds.playClick(); onOpenDeck(deck); }}
                      className="squishy-btn px-3.5 py-1.5 bg-strawberry-500 hover:bg-strawberry-600 text-white text-xs font-bold rounded-full shadow-squishy-pink transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Practice</span>
                      <Play size={10} className="fill-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mascot Companion Banner */}
      <section className="py-16 md:py-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-[#EFE8DE] shadow-bento flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg text-left">
              <div className="flex items-center space-x-2">
                <KittyBow size={20} />
                <span className="text-xs font-bold uppercase tracking-wider text-strawberry-600">Friendly Study Companion</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3E2D28] tracking-tight">
                Study sessions that keep you encouraged.
              </h2>
              <p className="text-sm text-cocoa-600 leading-relaxed font-normal">
                Studying for high-stakes exams can be draining. Ankitti balances rigorous cognitive algorithms with joyful, clean aesthetics—making daily reviews something you genuinely look forward to.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn px-6 py-2.5 bg-strawberry-500 hover:bg-strawberry-600 text-white font-bold rounded-full text-xs sm:text-sm shadow-squishy-pink transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <KittyBow size={15} />
                  <span>Enter Ankitti Studio</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#FAF7F2] rounded-2xl p-2 shadow-2xs border border-[#EFE8DE] flex items-center justify-center">
                <img src="/assets/hero_mascot.png" alt="Study mascot" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#FAF7F2] rounded-2xl p-2 shadow-2xs border border-[#EFE8DE] flex items-center justify-center">
                <img src="/assets/celebrate_mascot.png" alt="Celebrate mascot" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white border-t border-[#EFE8DE]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-extrabold text-[#3E2D28] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-cocoa-600 text-sm font-normal">
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
                className="border border-[#EFE8DE] rounded-2xl overflow-hidden bg-[#FAF7F2]"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4.5 text-left font-bold text-[#3E2D28] flex items-center justify-between text-sm cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={16} 
                    className={`transform transition-transform text-cocoa-400 ${activeFaq === idx ? 'rotate-180 text-cocoa-700' : ''}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4.5 pb-4.5 text-xs text-cocoa-600 leading-relaxed border-t border-[#EFE8DE] pt-3 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#FAF7F2] border-t border-[#EFE8DE] text-cocoa-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <KittyBow size={18} />
            <span className="font-bold text-[#3E2D28] text-sm tracking-tight">Ankitti</span>
            <span className="text-xs text-cocoa-500 ml-2">© 2026 • Cozy Bento Spaced Repetition</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="squishy-btn px-4 py-2 bg-[#3E2D28] hover:bg-[#2F211D] text-white text-xs font-bold rounded-full transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
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
