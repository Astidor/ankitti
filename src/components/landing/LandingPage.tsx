import React, { useState } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  Download, 
  Check, 
  Play, 
  ChevronDown,
  Smartphone,
  Sparkles,
  BookOpen,
  Zap,
  Flame,
  Coffee,
  Heart,
  Star,
  Layers,
  CheckCircle2,
  Clock,
  BarChart2
} from 'lucide-react';
import { 
  KittyBow, 
  CuteSparkleStar, 
  SparkleCluster, 
  KawaiiPancakeStack, 
  KawaiiBobaCup, 
  KawaiiStudyNotebook, 
  KawaiiWashiTape 
} from '../common/KittyIllustrations';
import { FloatingPetals } from '../common/FloatingPetals';
import { sounds } from '../../services/audio';
import { Deck, UserAccount } from '../../types/anki';

interface LandingPageProps {
  decks: Deck[];
  user?: UserAccount | null;
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
    front: 'What is the average time complexity of QuickSort?',
    back: 'O(n log n) average time complexity.\n\nWorst-case O(n²) when pivot selection is unbalanced.',
    takeaway: 'Randomized pivot selection avoids the quadratic worst-case.',
    previews: { again: '<10m', hard: '1d', good: '3d', easy: '6d' }
  },
  {
    topic: 'Cell Biology',
    tag: 'Biology 🧬',
    front: 'What is the primary function of Mitochondria in eukaryotic cells?',
    back: 'Generate ATP through oxidative phosphorylation (cellular respiration).',
    takeaway: 'Mitochondria contain circular mtDNA inherited maternally.',
    previews: { again: '<10m', hard: '18h', good: '2d', easy: '5d' }
  },
  {
    topic: 'Spanish Travel',
    tag: 'Spanish ☕',
    front: '¿Dónde está el baño, por favor?',
    back: 'Where is the bathroom, please?\n\n¿Dónde está...? = Where is...?',
    takeaway: 'Always add "por favor" for polite requests in travel and dining.',
    previews: { again: '<10m', hard: '10m', good: '1d', easy: '4d' }
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
  const [demoStudiedCount, setDemoStudiedCount] = useState<number>(0);

  const currentDemo = DEMO_CARDS[demoIndex];

  const handleDemoFlip = () => {
    sounds.playFlip();
    setIsDemoFlipped(!isDemoFlipped);
  };

  const handleDemoRate = (rating: 1 | 2 | 3 | 4) => {
    sounds.playRating(rating);
    setDemoStudiedCount(prev => prev + 1);
    setIsDemoFlipped(false);
    setDemoIndex((prev) => (prev + 1) % DEMO_CARDS.length);
  };

  return (
    <div className="min-h-screen kawaii-grid-bg text-cocoa-900 font-sans selection:bg-pink-200 selection:text-strawberry-900 relative overflow-x-hidden">
      
      {/* Floating Sakura Petals Animation */}
      <FloatingPetals />

      {/* 🌸 Ambient Background Glows 🌸 */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,182,193,0.35),transparent)]" />
      <div className="pointer-events-none absolute top-[600px] -right-20 w-96 h-96 bg-[radial-gradient(circle,rgba(254,215,170,0.25),transparent)]" />
      <div className="pointer-events-none absolute top-[1200px] -left-20 w-96 h-96 bg-[radial-gradient(circle,rgba(187,247,208,0.25),transparent)]" />

      {/* 🎀 TOP GLASSMORPHIC NAVIGATION BAR 🎀 */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-pink-100/80 transition-all shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
          
          {/* Logo & Kawaii Title */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group select-none" 
            onClick={onLaunchApp}
          >
            <div className="w-9 h-9 rounded-2xl bg-pink-100 border border-pink-200/80 flex items-center justify-center text-strawberry-600 shadow-2xs group-hover:scale-105 group-hover:rotate-6 transition-transform">
              <KittyBow size={22} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-display font-extrabold text-2xl tracking-tight text-cocoa-900">
                Ankitti
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-strawberry-50 text-strawberry-700 border border-strawberry-200/70 hidden sm:inline-block shadow-2xs">
                Study Studio 🌸
              </span>
            </div>
          </div>

          {/* Centered Navigation Pills */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-cocoa-600">
            <a href="#features" className="hover:text-strawberry-600 transition-colors">Features</a>
            <a href="#demo" className="hover:text-strawberry-600 transition-colors">Interactive Demo</a>
            <a href="#journey" className="hover:text-strawberry-600 transition-colors">How It Works</a>
            <a href="#decks" className="hover:text-strawberry-600 transition-colors">Starter Decks</a>
            <a href="#faq" className="hover:text-strawberry-600 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {onOpenInstall && (
              <button
                onClick={() => { sounds.playClick(); onOpenInstall(); }}
                className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-cocoa-700 bg-white hover:bg-pink-50 border border-pink-200/80 shadow-2xs transition-all cursor-pointer"
                title="Install Ankitti as an offline PWA app"
              >
                <Smartphone size={13} className="text-strawberry-500 shrink-0" />
                <span>Install App</span>
              </button>
            )}

            {user?.email ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-cocoa-700 bg-white px-3 py-1.5 rounded-full border border-pink-200/80 shadow-2xs">
                  <span>{user.name}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs font-semibold text-cocoa-500 hover:text-cocoa-900 px-2.5 py-1.5 rounded-full hover:bg-pink-50 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn text-xs sm:text-sm font-bold bg-strawberry-500 hover:bg-strawberry-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center space-x-1.5 cursor-pointer"
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
                    className="text-xs font-bold text-cocoa-700 hover:text-cocoa-900 px-3 py-1.5 rounded-full hover:bg-pink-50 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn text-xs sm:text-sm font-bold bg-strawberry-500 hover:bg-strawberry-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <KittyBow size={15} />
                  <span>Launch Studio</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🌸 HERO SECTION: VIBRANT KAWAII STUDY ATELIER 🌸 */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Bouncy Messaging & Dual CTA */}
            <div className="lg:col-span-7 space-y-6 text-left relative z-10">
              
              {/* Cute Bento Ribbon Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-pink-200 text-strawberry-700 text-xs font-bold shadow-2xs">
                <KittyBow size={15} />
                <span>SuperMemo SM-2 • Hello Kitty Vibes • Anki Sync</span>
                <SparkleCluster color="#F59E0B" className="hidden sm:inline-flex ml-1" />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-cocoa-900 tracking-tight leading-[1.12]">
                Spaced repetition, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-strawberry-500 via-rose-500 to-pink-500">
                  made delightful. 🎀
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-cocoa-600 leading-relaxed max-w-xl font-normal">
                Turn daunting exams and vocabulary lists into a cozy Japanese stationery routine.
                Powered by scientific SM-2 memory curves, keystroke auto-save, and Hello Kitty study companions cheering you on every day.
              </p>

              {/* Primary Call-to-Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn px-7 py-3.5 bg-strawberry-500 hover:bg-strawberry-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-rose-btn"
                >
                  <KittyBow size={16} />
                  <span>Enter Ankitti Studio</span>
                  <ArrowRight size={15} />
                </button>

                <a
                  href="#demo"
                  onClick={() => sounds.playClick()}
                  className="squishy-white-btn px-5 py-3.5 bg-white hover:bg-pink-50/50 text-cocoa-800 rounded-2xl font-bold text-sm border border-pink-200/80 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Try Live Demo</span>
                  <span className="text-strawberry-500 font-normal">↓</span>
                </a>

                <button
                  onClick={() => { sounds.playClick(); onOpenImport(); }}
                  className="squishy-white-btn px-5 py-3.5 bg-white hover:bg-pink-50/50 text-cocoa-800 rounded-2xl font-bold text-sm border border-pink-200/80 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Download size={15} className="text-cocoa-500" />
                  <span>Import .apkg</span>
                </button>
              </div>

              {/* Sweet Trust Badges */}
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-bold text-cocoa-600">
                <div className="flex items-center space-x-1.5 bg-white/90 px-3 py-1.5 rounded-full border border-pink-200/80 shadow-2xs">
                  <Check size={14} className="text-matcha-600 stroke-[3]" />
                  <span>100% Free & Offline-Ready</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/90 px-3 py-1.5 rounded-full border border-pink-200/80 shadow-2xs">
                  <Check size={14} className="text-strawberry-500 stroke-[3]" />
                  <span>Relearn Anytime Mode</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/90 px-3 py-1.5 rounded-full border border-pink-200/80 shadow-2xs">
                  <Check size={14} className="text-taro-600 stroke-[3]" />
                  <span>Keystroke Auto-Save</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Mascot Study Desk Scene (Reference 4 / Coffee Shop Style) */}
            <div className="lg:col-span-5 flex flex-col items-center relative">
              
              {/* Outer Decorative Glow & Sparkles */}
              <div className="absolute -top-6 -right-6 z-20 animate-twinkle">
                <CuteSparkleStar size={28} color="#F59E0B" />
              </div>
              <div className="absolute top-1/2 -left-8 z-20 animate-twinkle [animation-delay:1.2s]">
                <CuteSparkleStar size={20} color="#EC4899" />
              </div>

              {/* Floating Boba Cup & Pancake Stickers (Inspired by Reference 4) */}
              <div className="absolute -top-10 -left-6 z-20 hidden sm:block animate-float-gentle">
                <div className="p-2 bg-white/95 rounded-2xl border border-pink-200 shadow-md">
                  <KawaiiBobaCup size={54} />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-4 z-20 hidden sm:block animate-float-slow">
                <div className="p-2 bg-white/95 rounded-2xl border border-pink-200 shadow-md">
                  <KawaiiPancakeStack size={56} />
                </div>
              </div>

              {/* Main Mascot Card Frame */}
              <div className="w-full max-w-md bg-white rounded-[32px] border-2 border-pink-200/90 shadow-[0_12px_40px_rgba(255,77,121,0.12)] p-6 relative overflow-hidden">
                
                {/* Cute Top Ribbon Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-pink-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-strawberry-500 animate-pulse" />
                    <span className="font-display font-extrabold text-xs text-cocoa-900 tracking-tight">
                      Ankitti Study Desk
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-strawberry-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200/80">
                    Goal: 25 cards 🌸
                  </span>
                </div>

                {/* Illustrated Mascot Image */}
                <div className="w-full rounded-2xl bg-gradient-to-b from-pink-50/70 to-rose-50/50 p-4 border border-pink-100 flex items-center justify-center relative">
                  <img 
                    src="/assets/hero_mascot.png" 
                    alt="Hello Kitty studying at wooden desk" 
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-md select-none"
                  />
                  
                  {/* Floating Streak Pill */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full border border-pink-200 shadow-sm flex items-center space-x-1.5 text-xs font-bold text-cocoa-800">
                    <Flame size={14} className="text-amber-500 fill-amber-500" />
                    <span>1 Day Streak 🔥</span>
                  </div>

                  {/* Floating Retention Pill */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full border border-pink-200 shadow-sm flex items-center space-x-1.5 text-xs font-bold text-matcha-800">
                    <CheckCircle2 size={13} className="text-matcha-600" />
                    <span>95%+ Recall</span>
                  </div>
                </div>

                {/* Encouraging Mascot Dialogue */}
                <div className="mt-4 p-3.5 bg-pink-50/50 rounded-2xl border border-pink-100 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-pink-200 p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
                    <img 
                      src="/assets/reading_mascot.png" 
                      alt="Companion" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-cocoa-900 font-display">Study Buddy</div>
                    <div className="text-[11px] text-cocoa-600 font-medium">
                      "Grab some tea! Reviewing now locks your memory into long-term storage."
                    </div>
                  </div>
                </div>

                {/* Quick 1-Click Study Trigger */}
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="mt-3.5 w-full py-2.5 rounded-xl bg-strawberry-500 hover:bg-strawberry-600 text-white font-bold text-xs shadow-rose-btn transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <KittyBow size={14} />
                  <span>Start Today's Review (7 Cards Due) →</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🍓 INTERACTIVE 3D FLASHCARD DEMO PLAYGROUND (Reference 1 style) 🍓 */}
      <section id="demo" className="py-16 md:py-24 bg-white/80 border-y border-pink-100 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-strawberry-700 text-xs font-bold">
              <Sparkles size={13} className="text-strawberry-500" />
              <span>Interactive Playground</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-cocoa-900 tracking-tight">
              Try flipping a flashcard right now.
            </h2>
            <p className="text-cocoa-600 text-sm sm:text-base font-normal">
              Click the card or press Space to see how SM-2 spaced repetition calculates next review dates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Mascot Companion Speech & Category Pills */}
            <div className="lg:col-span-5 space-y-5 text-left">
              
              <div className="p-5 rounded-3xl bg-pink-50/60 border border-pink-100 shadow-sm space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 p-1 shrink-0 shadow-2xs">
                    <img 
                      src="/assets/cafe_mascot.png" 
                      alt="Companion" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-sm text-cocoa-900">
                      Hello Kitty Tutor
                    </div>
                    <div className="text-xs text-strawberry-600 font-semibold">
                      Spaced Repetition Guide
                    </div>
                  </div>
                </div>
                <p className="text-xs text-cocoa-700 leading-relaxed font-medium">
                  "Notice how each button below the answer shows a precise time interval. Anki computes intervals dynamically based on how difficult the recall felt!"
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-cocoa-500 border-t border-pink-200/60">
                  <span>Demo cards flipped: <strong className="text-strawberry-600 font-bold">{demoStudiedCount}</strong></span>
                  <span>Ease Factor: <strong>250%</strong></span>
                </div>
              </div>

              {/* Topic Switcher Pills (Inspired by Reference 1 Categories) */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cocoa-500 block">
                  Select Demo Topic:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sounds.playClick();
                        setDemoIndex(idx);
                        setIsDemoFlipped(false);
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        demoIndex === idx
                          ? 'bg-strawberry-50 text-strawberry-700 border-strawberry-300 shadow-2xs'
                          : 'bg-white text-cocoa-700 border-pink-100 hover:border-pink-200 hover:bg-pink-50/30'
                      }`}
                    >
                      <span>{card.tag}</span>
                      {demoIndex === idx && <Check size={14} className="text-strawberry-600 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: The 3D Interactive Flashcard */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[32px] border-2 border-pink-200/90 shadow-[0_12px_36px_rgba(255,77,121,0.08)] p-6 sm:p-7 relative">
                
                {/* Header within Demo */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-pink-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-strawberry-700 bg-strawberry-50 border border-strawberry-100 px-3 py-0.5 rounded-full">
                      {currentDemo.topic}
                    </span>
                    <span className="text-cocoa-400 font-mono uppercase text-[10px]">
                      {isDemoFlipped ? 'Answer Face' : 'Question Face'}
                    </span>
                  </div>
                  <KittyBow size={18} />
                </div>

                {/* 3D Perspective Flashcard Container */}
                <div 
                  onClick={handleDemoFlip}
                  className="perspective-1000 w-full min-h-[240px] cursor-pointer select-none"
                  title="Click or tap to flip card"
                >
                  <div className={`relative w-full min-h-[240px] transition-transform duration-500 transform-style-3d ${isDemoFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front Face */}
                    <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 sm:p-8 bg-pink-50/30 rounded-2xl border border-pink-100 shadow-2xs hover:border-strawberry-200 transition-colors">
                      <div className="text-xs font-semibold text-cocoa-400 font-mono">
                        QUESTION
                      </div>

                      <div className="my-auto text-center font-bold text-2xl sm:text-3xl text-cocoa-900 leading-snug">
                        {currentDemo.front}
                      </div>

                      <div className="text-center text-xs text-strawberry-600 font-bold flex items-center justify-center space-x-1.5 pt-2">
                        <RotateCcw size={13} className="text-strawberry-500" />
                        <span>Tap anywhere to reveal answer</span>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-6 sm:p-8 bg-white rounded-2xl border-2 border-strawberry-300 shadow-md">
                      <div className="flex items-center justify-between text-xs pb-1">
                        <span className="text-strawberry-600 font-bold text-xs flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-strawberry-500" />
                          <span>ANSWER</span>
                        </span>
                      </div>

                      <div className="my-auto text-cocoa-900 font-bold text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-left">
                        {currentDemo.back}
                      </div>

                      <div className="p-3 bg-honey-50 rounded-xl text-xs text-honey-900 border border-honey-200 text-left">
                        <strong className="block text-[10px] uppercase font-bold text-honey-700 mb-0.5">
                          Key Concept
                        </strong>
                        {currentDemo.takeaway}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Rating Pills Below Card */}
                <div className="mt-5 pt-4 border-t border-pink-100">
                  {!isDemoFlipped ? (
                    <button
                      onClick={handleDemoFlip}
                      className="squishy-btn w-full py-3 bg-cocoa-900 hover:bg-cocoa-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Show Answer (Flip)</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleDemoRate(1)}
                        className="py-2.5 rounded-xl bg-strawberry-50 hover:bg-strawberry-100 text-strawberry-700 text-center border border-strawberry-200 transition-all cursor-pointer shadow-2xs hover:scale-102"
                      >
                        <div className="text-[10px] font-bold">🍰 Again</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.again}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(2)}
                        className="py-2.5 rounded-xl bg-honey-50 hover:bg-honey-100 text-honey-800 text-center border border-honey-200 transition-all cursor-pointer shadow-2xs hover:scale-102"
                      >
                        <div className="text-[10px] font-bold">☕ Hard</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.hard}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(3)}
                        className="py-2.5 rounded-xl bg-matcha-50 hover:bg-matcha-100 text-matcha-800 text-center border border-matcha-200 transition-all cursor-pointer shadow-2xs hover:scale-102"
                      >
                        <div className="text-[10px] font-bold">🌸 Good</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.good}</div>
                      </button>
                      <button
                        onClick={() => handleDemoRate(4)}
                        className="py-2.5 rounded-xl bg-taro-50 hover:bg-taro-100 text-taro-800 text-center border border-taro-200 transition-all cursor-pointer shadow-2xs hover:scale-102"
                      >
                        <div className="text-[10px] font-bold">✨ Easy</div>
                        <div className="text-[11px] font-mono font-bold">{currentDemo.previews.easy}</div>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🍱 WHY LEARNERS LOVE ANKITTI — 4 ILLUSTRATED BENTO PILLARS (Inspired by References 1 & 2) 🍱 */}
      <section id="features" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-pink-200 text-strawberry-700 text-xs font-bold shadow-2xs">
              <KittyBow size={14} />
              <span>Thoughtfully Crafted Craft</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-cocoa-900 tracking-tight">
              Built for high memory. Styled for joy.
            </h2>
            <p className="text-cocoa-600 text-sm sm:text-base font-normal">
              Everything that makes spaced repetition scientifically bulletproof, elevated with warm pastel aesthetics and distraction-free clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Bento Card 1: SuperMemo SM-2 Science */}
            <div className="squishy-card p-6 rounded-[28px] bg-white border border-pink-100 shadow-[0_6px_20px_rgba(255,77,121,0.05)] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-strawberry-50 border border-strawberry-200/80 p-1 mb-4 flex items-center justify-center shadow-2xs">
                  <img 
                    src="/assets/reading_mascot.png" 
                    alt="SM-2 Mascot" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-strawberry-100 text-strawberry-700">
                  Cognitive Science
                </span>
                <h3 className="font-display font-extrabold text-lg text-cocoa-900 mt-2 mb-1">
                  SuperMemo SM-2 Engine
                </h3>
                <p className="text-xs text-cocoa-600 leading-relaxed font-normal">
                  Calculates optimal intervals before neural traces decay. Enjoy 90%+ long-term retention without cramming stress.
                </p>
              </div>
              <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-xs font-bold text-strawberry-600">
                <span>95% Recall Rate</span>
                <span>📈</span>
              </div>
            </div>

            {/* Bento Card 2: Relearn Anytime Mode */}
            <div className="squishy-card p-6 rounded-[28px] bg-white border border-pink-100 shadow-[0_6px_20px_rgba(255,77,121,0.05)] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-honey-50 border border-honey-200/80 p-1 mb-4 flex items-center justify-center shadow-2xs">
                  <KawaiiStudyNotebook size={44} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-honey-100 text-honey-800">
                  Total Flexibility
                </span>
                <h3 className="font-display font-extrabold text-lg text-cocoa-900 mt-2 mb-1">
                  Relearn Anytime Mode
                </h3>
                <p className="text-xs text-cocoa-600 leading-relaxed font-normal">
                  Standard Anki locks cards when reviews hit zero. In Ankitti, drill and relearn any deck whenever inspiration strikes.
                </p>
              </div>
              <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-xs font-bold text-honey-700">
                <span>Zero Lockouts</span>
                <span>⚡</span>
              </div>
            </div>

            {/* Bento Card 3: Cozy Focus Café Pomodoro */}
            <div className="squishy-card p-6 rounded-[28px] bg-white border border-pink-100 shadow-[0_6px_20px_rgba(255,77,121,0.05)] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-matcha-50 border border-matcha-200/80 p-1 mb-4 flex items-center justify-center shadow-2xs">
                  <img 
                    src="/assets/cafe_mascot.png" 
                    alt="Cafe Mascot" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-matcha-100 text-matcha-800">
                  Focus Caddy
                </span>
                <h3 className="font-display font-extrabold text-lg text-cocoa-900 mt-2 mb-1">
                  Cozy Focus Timer
                </h3>
                <p className="text-xs text-cocoa-600 leading-relaxed font-normal">
                  Built-in 25m Pomodoro study timer with gentle chimes and calming visual progress to keep your focus deep and steady.
                </p>
              </div>
              <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-xs font-bold text-matcha-700">
                <span>25m Focus / 5m Tea</span>
                <span>🧋</span>
              </div>
            </div>

            {/* Bento Card 4: Study Garden & Heatmap */}
            <div className="squishy-card p-6 rounded-[28px] bg-white border border-pink-100 shadow-[0_6px_20px_rgba(255,77,121,0.05)] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-taro-50 border border-taro-200/80 p-1 mb-4 flex items-center justify-center shadow-2xs">
                  <img 
                    src="/assets/celebrate_mascot.png" 
                    alt="Celebrate Mascot" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-taro-100 text-taro-800">
                  Visual Momentum
                </span>
                <h3 className="font-display font-extrabold text-lg text-cocoa-900 mt-2 mb-1">
                  Study Garden Heatmap
                </h3>
                <p className="text-xs text-cocoa-600 leading-relaxed font-normal">
                  Watch your daily review streak bloom across 12-week visual heatmaps with celebration confetti as milestones are reached.
                </p>
              </div>
              <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-xs font-bold text-taro-700">
                <span>Streak Momentum</span>
                <span>🌱</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🌸 3-STEP VISUAL JOURNEY: HOW ANKITTI WORKS (Inspired by References 1 & 3) 🌸 */}
      <section id="journey" className="py-16 md:py-24 bg-white/70 border-t border-pink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-cocoa-900 tracking-tight">
              3 simple steps to effortless memory.
            </h2>
            <p className="text-cocoa-600 text-sm sm:text-base font-normal">
              No complicated configuration files or confusing menus. Just pure, delightful learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 01 */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-[0_4px_16px_rgba(255,77,121,0.04)] text-left relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-strawberry-100 text-strawberry-700 font-display font-extrabold text-base flex items-center justify-center border border-strawberry-200">
                01
              </div>
              <h3 className="font-display font-extrabold text-lg text-cocoa-900">
                Import or Create
              </h3>
              <p className="text-xs text-cocoa-600 leading-relaxed font-normal">
                Drag and drop your existing Anki <code>.apkg</code> packages, generate decks with AI, or compose new cards with instant keystroke auto-save.
              </p>
              <div className="pt-2 text-strawberry-500 font-bold text-xs flex items-center space-x-1">
                <span>Instant In-Browser Import</span>
                <span>→</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-[0_4px_16px_rgba(255,77,121,0.04)] text-left relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-honey-100 text-honey-800 font-display font-extrabold text-base flex items-center justify-center border border-honey-200">
                02
              </div>
              <h3 className="font-display font-extrabold text-lg text-cocoa-900">
                5-Minute Daily Habit
              </h3>
              <p className="text-xs text-cocoa-600 leading-relaxed font-normal">
                Flip cards with Space, rate recall difficulty with 1-4 keys, and let the SM-2 algorithm schedule future appearances with pinpoint precision.
              </p>
              <div className="pt-2 text-honey-700 font-bold text-xs flex items-center space-x-1">
                <span>Keystroke Controls</span>
                <span>→</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-[0_4px_16px_rgba(255,77,121,0.04)] text-left relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-matcha-100 text-matcha-800 font-display font-extrabold text-base flex items-center justify-center border border-matcha-200">
                03
              </div>
              <h3 className="font-display font-extrabold text-lg text-cocoa-900">
                Permanent Recall
              </h3>
              <p className="text-xs text-cocoa-600 leading-relaxed font-normal">
                Watch cards graduate into mature storage (&ge;21 days). Walk into your exam or language test with 95%+ effortless recall accuracy.
              </p>
              <div className="pt-2 text-matcha-700 font-bold text-xs flex items-center space-x-1">
                <span>Bloom Your Garden</span>
                <span>✨</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 📚 CURATED STARTER DECKS SHOWCASE (Reference 1 style) 📚 */}
      <section id="decks" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-pink-200 text-strawberry-700 text-xs font-bold shadow-2xs mb-2">
                <KittyBow size={13} />
                <span>Pre-Loaded & Ready to Practice</span>
              </div>
              <h2 className="text-3xl font-display font-extrabold text-cocoa-900 tracking-tight">
                Curated Starter Decks
              </h2>
              <p className="text-cocoa-600 text-sm mt-1 font-normal">
                Jump right in with pre-loaded high-yield decks, or create your own custom decks anytime.
              </p>
            </div>

            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="squishy-white-btn self-start md:self-auto px-4 py-2 rounded-2xl bg-white text-xs font-bold text-strawberry-600 hover:text-strawberry-700 border border-pink-200 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>View all decks in Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {decks.slice(0, 4).map((deck, idx) => {
              const themes = [
                { 
                  tagBg: 'bg-rose-100 text-rose-800', 
                  badge: 'Japanese 🌸',
                  colorPill: 'border-rose-200'
                },
                { 
                  tagBg: 'bg-purple-100 text-purple-800', 
                  badge: 'CS & Code 💻',
                  colorPill: 'border-purple-200'
                },
                { 
                  tagBg: 'bg-pink-100 text-pink-800', 
                  badge: 'Biology 🧬',
                  colorPill: 'border-pink-200'
                },
                { 
                  tagBg: 'bg-amber-100 text-amber-800', 
                  badge: 'Spanish ☕',
                  colorPill: 'border-amber-200'
                },
              ];
              const theme = themes[idx % themes.length];

              return (
                <div 
                  key={deck.id}
                  className="squishy-card bg-white p-5 rounded-[26px] border border-pink-100 shadow-[0_4px_16px_rgba(255,77,121,0.04)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.tagBg}`}>
                        {theme.badge}
                      </span>
                      <KittyBow size={14} />
                    </div>
                    
                    <h3 className="font-display font-extrabold text-cocoa-900 text-base mb-1.5">
                      {deck.name}
                    </h3>
                    
                    <p className="text-xs text-cocoa-600 line-clamp-2 font-normal leading-relaxed">
                      {deck.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-pink-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cocoa-500 bg-pink-50/60 px-2 py-0.5 rounded-lg border border-pink-100">
                      SM-2 Ready
                    </span>
                    <button
                      onClick={() => { sounds.playClick(); onOpenDeck(deck); }}
                      className="squishy-btn px-3.5 py-1.5 bg-strawberry-500 hover:bg-strawberry-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Study</span>
                      <Play size={10} className="fill-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 💌 STUDENT LOVE NOTES & TESTIMONIALS (Sticky notes with Washi Tape) 💌 */}
      <section className="py-16 md:py-24 bg-white/70 border-t border-pink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-display font-extrabold text-cocoa-900 tracking-tight">
              Loved by learners, language students & med students.
            </h2>
            <p className="text-cocoa-600 text-sm font-normal">
              Hear why thousands swapped clunky desktop dialogs for Ankitti's warm study studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Note 1 */}
            <div className="bg-[#FFFDF7] rounded-3xl p-6 border border-pink-200/80 shadow-sm relative pt-7">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <KawaiiWashiTape color="#FDA4AF" />
              </div>
              <div className="flex items-center space-x-1 text-amber-400 mb-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-cocoa-700 leading-relaxed font-medium">
                "I was studying for JLPT N2 and standard Anki was so sterile it burned me out. Ankitti made daily reviews feel like a cozy tea break. Passed with room to spare!"
              </p>
              <div className="pt-3 mt-3 border-t border-pink-100 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-strawberry-700 font-bold text-xs flex items-center justify-center">
                  M
                </div>
                <div>
                  <div className="font-bold text-xs text-cocoa-900">Maya S.</div>
                  <div className="text-[10px] text-cocoa-400">Japanese JLPT Student</div>
                </div>
              </div>
            </div>

            {/* Note 2 */}
            <div className="bg-[#FFFDF7] rounded-3xl p-6 border border-pink-200/80 shadow-sm relative pt-7">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <KawaiiWashiTape color="#FDE047" />
              </div>
              <div className="flex items-center space-x-1 text-amber-400 mb-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-cocoa-700 leading-relaxed font-medium">
                "The Relearn Anytime mode is a lifesaver. Standard Anki locking cards out before exams drove me crazy. Being able to drill high-yield cards anytime gives so much confidence."
              </p>
              <div className="pt-3 mt-3 border-t border-pink-100 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-honey-100 text-honey-800 font-bold text-xs flex items-center justify-center">
                  D
                </div>
                <div>
                  <div className="font-bold text-xs text-cocoa-900">David K.</div>
                  <div className="text-[10px] text-cocoa-400">Medical Student (USMLE)</div>
                </div>
              </div>
            </div>

            {/* Note 3 */}
            <div className="bg-[#FFFDF7] rounded-3xl p-6 border border-pink-200/80 shadow-sm relative pt-7">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <KawaiiWashiTape color="#C4B5FD" />
              </div>
              <div className="flex items-center space-x-1 text-amber-400 mb-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-cocoa-700 leading-relaxed font-medium">
                "Imported my 4,000-card Anki deck in about 3 seconds right inside Chrome. The draft auto-save means I never lose long code explanations if my browser restarts."
              </p>
              <div className="pt-3 mt-3 border-t border-pink-100 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-taro-100 text-taro-800 font-bold text-xs flex items-center justify-center">
                  E
                </div>
                <div>
                  <div className="font-bold text-xs text-cocoa-900">Elena R.</div>
                  <div className="text-[10px] text-cocoa-400">Software Engineer</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🎀 MASCOT ENCOURAGEMENT BANNER 🎀 */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-pink-50/90 via-rose-50/80 to-pink-100/70 rounded-[36px] p-8 md:p-12 border-2 border-pink-200/80 shadow-[0_12px_40px_rgba(255,77,121,0.08)] flex flex-col lg:flex-row items-center justify-between gap-8 text-left relative overflow-hidden">
            
            {/* Ambient Sparkles */}
            <div className="absolute top-4 right-8 animate-twinkle">
              <CuteSparkleStar size={24} color="#F59E0B" />
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white text-strawberry-700 text-xs font-bold border border-pink-200">
                <KittyBow size={14} />
                <span>Cheering You On Every Day</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-cocoa-900 tracking-tight leading-tight">
                Ready to make studying feel cozy again?
              </h2>
              
              <p className="text-sm text-cocoa-600 leading-relaxed font-normal">
                No credit cards. No subscriptions. Just scientific spaced repetition in a sweet Japanese stationery atelier.
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn px-7 py-3 bg-strawberry-500 hover:bg-strawberry-600 text-white font-bold rounded-2xl text-sm shadow-rose-btn transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <KittyBow size={15} />
                  <span>Enter Ankitti Studio Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Mascot Jumping with Celebration Star */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 relative flex items-center justify-center">
              <img 
                src="/assets/celebrate_mascot.png" 
                alt="Celebrate Mascot" 
                className="w-full h-full object-contain drop-shadow-md select-none animate-float-gentle"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ❓ SWEET FAQ ACCORDION ❓ */}
      <section id="faq" className="py-16 md:py-24 bg-white/70 border-t border-pink-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-display font-extrabold text-cocoa-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-cocoa-600 text-sm font-normal">
              Everything you need to know about Ankitti, Anki sync, and spaced repetition.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Can I import my existing Anki decks (.apkg)?',
                a: 'Yes! Ankitti includes a fast in-browser SQLite WASM unpacker that imports your existing Anki packages (.apkg), tags, clozes, and media completely offline in your browser without sending any card data to an external server.'
              },
              {
                q: 'How does the "Relearn Anytime" feature work?',
                a: 'Standard Anki locks cards once their daily review is finished. In Ankitti, you can click "Practice" or "Relearn Anytime" on any deck at any hour to drill high-yield material or test yourself before an exam without messing up your schedule.'
              },
              {
                q: 'Will I lose my in-progress flashcards if I close the browser?',
                a: 'Never! Ankitti auto-saves every single keystroke into your browser storage. If your laptop battery dies or you accidentally close the tab, your card draft is automatically restored the second you reopen the app.'
              },
              {
                q: 'Is Ankitti really 100% compliant with SuperMemo SM-2?',
                a: 'Yes! It calculates exact interval multipliers, ease factors (starting at 2.5), lapse intervals, and graduating review steps according to the original SuperMemo SM-2 algorithm specification.'
              },
              {
                q: 'Can I install Ankitti on my phone or tablet?',
                a: 'Yes! Ankitti is a certified Progressive Web App (PWA). Click "Install App" in the top bar or use Safari\'s "Add to Home Screen" on iOS to get a full-screen, native offline experience.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border border-pink-100 rounded-2xl overflow-hidden bg-white shadow-2xs transition-colors"
              >
                <button
                  onClick={() => { sounds.playClick(); setActiveFaq(activeFaq === idx ? null : idx); }}
                  className="w-full p-4.5 text-left font-bold text-cocoa-900 flex items-center justify-between text-sm cursor-pointer hover:bg-pink-50/30 transition-colors"
                >
                  <span className="font-display font-bold">{faq.q}</span>
                  <ChevronDown 
                    size={16} 
                    className={`transform transition-transform text-cocoa-400 shrink-0 ml-2 ${activeFaq === idx ? 'rotate-180 text-strawberry-600' : ''}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4.5 pb-4.5 text-xs text-cocoa-600 leading-relaxed border-t border-pink-100 pt-3 font-normal animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎀 SWEET KAWAII FOOTER 🎀 */}
      <footer className="py-12 bg-white border-t border-pink-100 text-cocoa-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-xl bg-pink-100 flex items-center justify-center text-strawberry-600 shadow-2xs">
              <KittyBow size={16} />
            </div>
            <span className="font-display font-extrabold text-cocoa-900 text-base tracking-tight">Ankitti</span>
            <span className="text-xs text-cocoa-400">
              • Made with 🎀 & strawberry milk by Astidor
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                sounds.playClick();
              }}
              className="text-xs font-bold text-cocoa-500 hover:text-cocoa-900 px-3 py-1.5 rounded-full hover:bg-pink-50 transition-colors cursor-pointer"
            >
              Back to Top ↑
            </button>
            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="squishy-btn px-4 py-2 bg-strawberry-500 hover:bg-strawberry-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-rose-btn"
            >
              <span>Launch Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
