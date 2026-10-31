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
  Heart,
  Star,
} from 'lucide-react';
import { 
  KittyBow, 
  CuteSparkleStar, 
  SparkleCluster, 
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

/* ─── Inline SVG Decorative Illustrations ─── */

const FloatingStarSVG: React.FC<{ className?: string; size?: number; color?: string }> = ({ 
  className = '', size = 24, color = '#FCD34D' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
  </svg>
);

const PlusDecor: React.FC<{ className?: string; size?: number; color?: string }> = ({ 
  className = '', size = 16, color = '#F9A8D4' 
}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} className={className}>
    <rect x="6" y="0" width="4" height="16" rx="2" />
    <rect x="0" y="6" width="16" height="4" rx="2" />
  </svg>
);

const HeartDecor: React.FC<{ className?: string; size?: number; color?: string }> = ({ 
  className = '', size = 18, color = '#FB7185' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CloudSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 200 80" fill="white" className={className} opacity="0.5">
    <ellipse cx="60" cy="50" rx="50" ry="25" />
    <ellipse cx="100" cy="40" rx="60" ry="30" />
    <ellipse cx="145" cy="50" rx="45" ry="22" />
  </svg>
);

const DEMO_CARDS = [
  {
    topic: 'Japanese JLPT N5',
    tag: 'Japanese 🌸',
    emoji: '🌸',
    front: '食べる (たべる)',
    back: 'To eat (Ichidan verb)\n\n寿司を食べる (I eat sushi)',
    takeaway: 'Pair with the を (wo) particle to mark the direct food object.',
    previews: { again: '<10m', hard: '12h', good: '1d', easy: '4d' }
  },
  {
    topic: 'Computer Science',
    tag: 'Algorithms 💻',
    emoji: '💻',
    front: 'What is the average time complexity of QuickSort?',
    back: 'O(n log n) average time complexity.\n\nWorst-case O(n²) when pivot selection is unbalanced.',
    takeaway: 'Randomized pivot selection avoids the quadratic worst-case.',
    previews: { again: '<10m', hard: '1d', good: '3d', easy: '6d' }
  },
  {
    topic: 'Cell Biology',
    tag: 'Biology 🧬',
    emoji: '🧬',
    front: 'What is the primary function of Mitochondria in eukaryotic cells?',
    back: 'Generate ATP through oxidative phosphorylation (cellular respiration).',
    takeaway: 'Mitochondria contain circular mtDNA inherited maternally.',
    previews: { again: '<10m', hard: '18h', good: '2d', easy: '5d' }
  },
  {
    topic: 'Spanish Travel',
    tag: 'Spanish ☕',
    emoji: '☀️',
    front: '¿Dónde está el baño, por favor?',
    back: 'Where is the bathroom, please?\n\n¿Dónde está...? = Where is...?',
    takeaway: 'Always add "por favor" for polite requests in travel and dining.',
    previews: { again: '<10m', hard: '10m', good: '1d', easy: '4d' }
  }
];

// Subject category card config (inspired by Reference 1 bento grid)
const SUBJECT_CARDS = [
  { 
    emoji: '🌸', 
    title: 'Japanese', 
    desc: '15 courses',
    gradient: 'from-rose-100 to-pink-50',
    border: 'border-rose-200',
    img: '/assets/reading_mascot.png',
  },
  { 
    emoji: '🧬', 
    title: 'Biology', 
    desc: '18 courses',
    gradient: 'from-emerald-100 to-green-50',
    border: 'border-emerald-200',
    img: '/assets/kawaii_brain_lightbulb.png',
  },
  { 
    emoji: '💻', 
    title: 'CS & Code', 
    desc: '25 courses',
    gradient: 'from-violet-100 to-purple-50',
    border: 'border-violet-200',
    img: '/assets/kawaii_books_stack.png',
  },
  { 
    emoji: '☀️', 
    title: 'Languages', 
    desc: '14 courses',
    gradient: 'from-amber-100 to-yellow-50',
    border: 'border-amber-200',
    img: '/assets/kawaii_trophy_stars.png',
  },
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
    <div className="min-h-screen text-cocoa-900 font-sans selection:bg-pink-200 selection:text-strawberry-900 relative overflow-x-hidden">
      
      {/* Floating Sakura Petals Animation */}
      <FloatingPetals />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🎀 NAVIGATION BAR — Minimal & Sweet                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-pink-100/80 shadow-[0_1px_3px_rgba(244,63,122,0.06)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group select-none" 
            onClick={onLaunchApp}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-strawberry-500 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <KittyBow size={18} className="brightness-200" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-cocoa-900">
              Ankitti
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-cocoa-500">
            <a href="#categories" className="hover:text-strawberry-600 transition-colors">Subjects</a>
            <a href="#demo" className="hover:text-strawberry-600 transition-colors">Try It</a>
            <a href="#features" className="hover:text-strawberry-600 transition-colors">Features</a>
            <a href="#faq" className="hover:text-strawberry-600 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {onOpenInstall && (
              <button
                onClick={() => { sounds.playClick(); onOpenInstall(); }}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-cocoa-600 hover:text-cocoa-900 hover:bg-pink-50 transition-colors cursor-pointer"
                title="Install Ankitti as an offline PWA app"
              >
                <Smartphone size={13} className="text-strawberry-500" />
                <span>Install</span>
              </button>
            )}

            {user?.email ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-xs font-bold text-cocoa-600">{user.name}</span>
                <button onClick={onLogout} className="text-xs font-semibold text-cocoa-400 hover:text-cocoa-900 px-2 py-1 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer">
                  Log Out
                </button>
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn text-xs font-bold bg-strawberry-500 hover:bg-strawberry-600 text-white px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Open Studio</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {onOpenAuth && (
                  <button
                    onClick={() => { sounds.playClick(); onOpenAuth('login'); }}
                    className="text-xs font-bold text-cocoa-600 hover:text-cocoa-900 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn text-xs font-bold bg-strawberry-500 hover:bg-strawberry-600 text-white px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Start Free</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🌸 HERO — Full-width Illustrated Kawaii Scene              */}
      {/* Like Reference 3 (Sweets Kitty) & Reference 4 (Coffee)    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative kawaii-sky-bg overflow-hidden">
        
        {/* Scattered floating decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Clouds */}
          <CloudSVG className="absolute top-8 left-[5%] w-36 sm:w-48" />
          <CloudSVG className="absolute top-16 right-[8%] w-28 sm:w-40" />
          <CloudSVG className="absolute top-32 left-[55%] w-24" />
          
          {/* Stars scattered around */}
          <FloatingStarSVG className="absolute top-12 left-[12%] animate-twinkle" size={18} color="#FCD34D" />
          <FloatingStarSVG className="absolute top-20 right-[15%] animate-twinkle [animation-delay:0.5s]" size={14} color="#F9A8D4" />
          <FloatingStarSVG className="absolute top-36 left-[30%] animate-twinkle [animation-delay:1s]" size={12} color="#C4B5FD" />
          <FloatingStarSVG className="absolute bottom-32 right-[20%] animate-twinkle [animation-delay:1.5s]" size={16} color="#FCD34D" />
          <FloatingStarSVG className="absolute bottom-20 left-[8%] animate-twinkle [animation-delay:0.8s]" size={20} color="#FBCFE8" />
          
          {/* Plus decorations (like Reference 3 Sweets Kitty) */}
          <PlusDecor className="absolute top-24 right-[25%] animate-sparkle-float" size={14} color="#F9A8D4" />
          <PlusDecor className="absolute top-40 left-[18%] animate-sparkle-float [animation-delay:1.2s]" size={10} color="#DDD6FE" />
          <PlusDecor className="absolute bottom-28 right-[10%] animate-sparkle-float [animation-delay:0.6s]" size={12} color="#FDE68A" />

          {/* Hearts */}
          <HeartDecor className="absolute top-28 left-[42%] animate-float-gentle opacity-40" size={14} color="#FB7185" />
          <HeartDecor className="absolute bottom-36 right-[30%] animate-float-slow opacity-30" size={12} color="#F9A8D4" />
          
          {/* Bottom gradient fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFFBF9] to-transparent" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-0 pt-10 pb-20 md:pt-14 md:pb-28">
            
            {/* Left: Text Content */}
            <div className="lg:w-1/2 space-y-5 text-center lg:text-left">
              
              {/* Small top badge */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-pink-200 text-strawberry-700 text-[11px] font-bold shadow-sm">
                <Heart size={12} className="fill-pink-400 text-pink-400" />
                <span>Free & Offline-Ready Study App</span>
                <SparkleCluster color="#F59E0B" className="ml-1" />
              </div>

              {/* Main headline — big & playful like Reference 4 */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-cocoa-900 tracking-tight leading-[1.05]">
                Study
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-strawberry-500 to-rose-500 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>
                  Sweetly.
                </span>
                {' '}
                <span className="inline-block animate-float-gentle text-4xl sm:text-5xl">🌸</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-cocoa-500 leading-relaxed max-w-md mx-auto lg:mx-0">
                Turn flashcards into a cozy ritual. Powered by scientific 
                <strong className="text-cocoa-700"> SM-2 spaced repetition</strong>, 
                wrapped in warm pastel aesthetics.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 pt-2">
                <button
                  onClick={() => { sounds.playClick(); onLaunchApp(); }}
                  className="squishy-btn px-8 py-3.5 bg-gradient-to-r from-strawberry-500 to-pink-500 hover:from-strawberry-600 hover:to-pink-600 text-white rounded-2xl font-bold text-sm flex items-center space-x-2 cursor-pointer shadow-lg"
                >
                  <KittyBow size={16} className="brightness-200" />
                  <span>Start Studying</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={() => { sounds.playClick(); onOpenImport(); }}
                  className="px-6 py-3.5 bg-white/80 backdrop-blur-sm hover:bg-white text-cocoa-700 rounded-2xl font-bold text-sm border border-pink-200 flex items-center space-x-2 cursor-pointer transition-all hover:shadow-md hover:border-pink-300"
                >
                  <Download size={15} className="text-strawberry-500" />
                  <span>Import .apkg</span>
                </button>
              </div>

              {/* Trust badges - tiny & cute */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
                {['100% Free', 'Works Offline', 'Anki Compatible'].map((badge) => (
                  <span key={badge} className="flex items-center space-x-1 text-[11px] font-bold text-cocoa-500 bg-white/60 px-2.5 py-1 rounded-full border border-pink-100">
                    <Check size={11} className="text-matcha-500 stroke-[3]" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Large Kawaii Hero Illustration — Reference 3 & 4 style */}
            <div className="lg:w-1/2 flex items-center justify-center relative mt-4 lg:mt-0">
              
              {/* Glow behind mascot */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(251,207,232,0.6),transparent)] pointer-events-none" />
              
              {/* Framed mascot illustration with rounded corners & shadow */}
              <div className="relative group">
                <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-3xl overflow-hidden border-2 border-pink-200/90 shadow-[0_16px_48px_rgba(244,63,122,0.18)] bg-white relative z-10 transition-transform duration-500 hover:scale-[1.01]">
                  <img 
                    src="/assets/kawaii_hero_scene.png" 
                    alt="Cute kawaii cat studying at a cozy desk with books and tea" 
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/hero_mascot.png';
                    }}
                  />
                </div>
                
                {/* Floating sticker badges around the mascot */}
                <div className="absolute -top-3 -right-3 z-20 animate-float-gentle">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 border border-pink-200 shadow-md flex items-center space-x-1.5 hover-wiggle cursor-default">
                    <span className="text-base">🔥</span>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-cocoa-400">Streak</div>
                      <div className="text-xs font-extrabold text-cocoa-900 font-display">7 days</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-3 -left-3 z-20 animate-float-slow">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 border border-emerald-200 shadow-md flex items-center space-x-1.5 hover-wiggle cursor-default">
                    <span className="text-base">✨</span>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-cocoa-400">Recall</div>
                      <div className="text-xs font-extrabold text-matcha-700 font-display">95%+</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-1/2 -left-5 z-20 animate-float-gentle [animation-delay:2s] hidden sm:block">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 border border-violet-200 shadow-md flex items-center space-x-1.5 hover-wiggle cursor-default">
                    <span className="text-base">📚</span>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-cocoa-400">Cards</div>
                      <div className="text-xs font-extrabold text-taro-700 font-display">1,247</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🍱 ILLUSTRATED SUBJECT CATEGORIES — Reference 1 Bento Grid */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="categories" className="py-16 md:py-20 kawaii-grid-bg relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold text-cocoa-400 uppercase tracking-widest">Categories</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-cocoa-900 tracking-tight">
              Find something you want to learn
            </h2>
          </div>

          {/* 2x2 Bento Grid with illustrations — like Reference 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {SUBJECT_CARDS.map((card) => (
              <button
                key={card.title}
                onClick={() => { sounds.playClick(); onLaunchApp(); }}
                className={`group relative bg-gradient-to-br ${card.gradient} rounded-3xl p-5 sm:p-6 border ${card.border} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-left overflow-hidden`}
              >
                {/* Illustrated sticker badge */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-2xl bg-white/90 p-1.5 border border-white shadow-sm flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={card.img}
                    alt={card.title} 
                    className="w-full h-full object-contain drop-shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Sparkle accent */}
                  <CuteSparkleStar 
                    size={14} 
                    color="#FCD34D" 
                    className="absolute top-1 right-1 animate-twinkle opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                </div>
                
                <h3 className="font-display font-extrabold text-cocoa-900 text-sm sm:text-base mb-0.5">{card.title}</h3>
                <p className="text-[11px] text-cocoa-500 font-medium">{card.desc}</p>
              </button>
            ))}
          </div>

          {/* "See All" link */}
          <div className="text-center mt-6">
            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="text-xs font-bold text-strawberry-600 hover:text-strawberry-700 inline-flex items-center space-x-1 cursor-pointer group"
            >
              <span>See all subjects</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🃏 INTERACTIVE FLASHCARD DEMO — Heart of the Page           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="demo" className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Subtle decorative BG */}
        <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(251,207,232,0.3),transparent)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 bg-[radial-gradient(circle,rgba(221,214,254,0.2),transparent)]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="max-w-xl mx-auto text-center space-y-2 mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-strawberry-700 text-xs font-bold">
              <Sparkles size={13} className="text-strawberry-500" />
              <span>Try It Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-cocoa-900 tracking-tight">
              Flip a flashcard ✨
            </h2>
            <p className="text-cocoa-500 text-sm font-normal">
              Click the card or press Space to experience SM-2 spaced repetition live.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Companion panel + topic pills */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Mascot companion card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50/50 border border-pink-100 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 p-1 shadow-sm overflow-hidden">
                    <img 
                      src="/assets/cafe_mascot.png" 
                      alt="Study Buddy" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-sm text-cocoa-900">Study Buddy</div>
                    <div className="text-[11px] text-strawberry-600 font-semibold">SM-2 Tutor</div>
                  </div>
                </div>
                <p className="text-xs text-cocoa-600 leading-relaxed font-medium bg-white/60 rounded-xl p-3 border border-pink-100">
                  "Each rating button shows a different interval. The algorithm adapts to how well you remember each card!" 💡
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-cocoa-400 pt-2 border-t border-pink-100">
                  <span>Cards flipped: <strong className="text-strawberry-600">{demoStudiedCount}</strong></span>
                  <span>Ease: <strong>250%</strong></span>
                </div>
              </div>

              {/* Topic selector pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-400 block px-1">
                  Select topic:
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
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        demoIndex === idx
                          ? 'bg-strawberry-50 text-strawberry-700 border-strawberry-300 shadow-sm'
                          : 'bg-white text-cocoa-600 border-pink-100 hover:border-pink-200 hover:bg-pink-50/30'
                      }`}
                    >
                      <span>{card.tag}</span>
                      {demoIndex === idx && <Check size={13} className="text-strawberry-600 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: The 3D Interactive Flashcard */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border-2 border-pink-200/90 shadow-[0_8px_32px_rgba(244,63,122,0.08)] p-5 sm:p-6 relative">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-pink-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-strawberry-700 bg-strawberry-50 border border-strawberry-100 px-2.5 py-0.5 rounded-full text-[11px]">
                      {currentDemo.topic}
                    </span>
                    <span className="text-cocoa-400 font-mono uppercase text-[10px]">
                      {isDemoFlipped ? 'Answer' : 'Question'}
                    </span>
                  </div>
                  <KittyBow size={16} />
                </div>

                {/* 3D Flashcard */}
                <div 
                  onClick={handleDemoFlip}
                  className="perspective-1000 w-full min-h-[220px] cursor-pointer select-none"
                  title="Click to flip"
                >
                  <div className={`relative w-full min-h-[220px] transition-transform duration-500 transform-style-3d ${isDemoFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front Face */}
                    <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 bg-gradient-to-br from-pink-50/40 to-white rounded-2xl border border-pink-100 hover:border-strawberry-200 transition-colors">
                      <div className="text-[10px] font-semibold text-cocoa-400 font-mono uppercase">Question</div>
                      <div className="my-auto text-center font-bold text-xl sm:text-2xl text-cocoa-900 leading-snug py-4">
                        {currentDemo.front}
                      </div>
                      <div className="text-center text-xs text-strawberry-500 font-bold flex items-center justify-center space-x-1.5">
                        <RotateCcw size={12} />
                        <span>Tap to reveal</span>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-6 bg-white rounded-2xl border-2 border-strawberry-200 shadow-sm">
                      <div className="flex items-center space-x-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-strawberry-500" />
                        <span className="text-strawberry-600 font-bold">Answer</span>
                      </div>
                      <div className="my-auto text-cocoa-900 font-bold text-base leading-relaxed whitespace-pre-wrap text-left py-3">
                        {currentDemo.back}
                      </div>
                      <div className="p-2.5 bg-honey-50 rounded-xl text-xs text-honey-900 border border-honey-200">
                        <strong className="block text-[10px] uppercase font-bold text-honey-700 mb-0.5">Key Concept</strong>
                        {currentDemo.takeaway}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating buttons */}
                <div className="mt-4 pt-3 border-t border-pink-100">
                  {!isDemoFlipped ? (
                    <button
                      onClick={handleDemoFlip}
                      className="squishy-btn w-full py-2.5 bg-cocoa-900 hover:bg-cocoa-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Show Answer</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { rating: 1 as const, label: '🍰 Again', time: currentDemo.previews.again, style: 'bg-strawberry-50 hover:bg-strawberry-100 text-strawberry-700 border-strawberry-200' },
                        { rating: 2 as const, label: '☕ Hard', time: currentDemo.previews.hard, style: 'bg-honey-50 hover:bg-honey-100 text-honey-800 border-honey-200' },
                        { rating: 3 as const, label: '🌸 Good', time: currentDemo.previews.good, style: 'bg-matcha-50 hover:bg-matcha-100 text-matcha-800 border-matcha-200' },
                        { rating: 4 as const, label: '✨ Easy', time: currentDemo.previews.easy, style: 'bg-taro-50 hover:bg-taro-100 text-taro-800 border-taro-200' },
                      ].map((btn) => (
                        <button
                          key={btn.rating}
                          onClick={() => handleDemoRate(btn.rating)}
                          className={`py-2 rounded-xl text-center border transition-all cursor-pointer shadow-2xs hover:scale-[1.03] ${btn.style}`}
                        >
                          <div className="text-[10px] font-bold">{btn.label}</div>
                          <div className="text-[11px] font-mono font-bold">{btn.time}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ✨ FEATURES — 3 Illustrated Pillars                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-16 md:py-24 kawaii-grid-bg relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-cocoa-900 tracking-tight">
              How it works 💫
            </h2>
            <p className="text-cocoa-500 text-sm max-w-lg mx-auto">
              Three simple steps from import to permanent recall. No configuration needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {[
              {
                step: '01',
                icon: '📥',
                title: 'Import or Create',
                desc: 'Drag your Anki .apkg packages or compose new cards. Every keystroke auto-saves instantly.',
                color: 'from-rose-100 to-pink-50',
                borderColor: 'border-rose-200',
                accent: 'text-strawberry-600',
                img: '/assets/reading_mascot.png',
              },
              {
                step: '02',
                icon: '🎴',
                title: '5-Min Daily Habit',
                desc: 'Flip cards with Space, rate difficulty with 1-4. SM-2 schedules your next review perfectly.',
                color: 'from-amber-50 to-yellow-50',
                borderColor: 'border-amber-200',
                accent: 'text-honey-700',
                img: '/assets/cafe_mascot.png',
              },
              {
                step: '03',
                icon: '🏆',
                title: 'Permanent Recall',
                desc: 'Watch cards mature into long-term memory. Walk into exams with 95%+ effortless recall.',
                color: 'from-emerald-50 to-green-50',
                borderColor: 'border-emerald-200',
                accent: 'text-matcha-700',
                img: '/assets/celebrate_mascot.png',
              },
            ].map((item) => (
              <div 
                key={item.step}
                className={`squishy-card bg-gradient-to-br ${item.color} rounded-3xl p-6 border ${item.borderColor} shadow-sm relative overflow-hidden`}
              >
                {/* Step number watermark */}
                <div className="absolute -top-3 -right-2 text-7xl font-display font-extrabold opacity-[0.06] text-cocoa-900 select-none">
                  {item.step}
                </div>
                
                {/* Illustration sticker */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/90 p-1.5 border border-white shadow-sm flex items-center justify-center">
                  <img src={item.img} alt={item.title} className="w-full h-full object-contain drop-shadow-xs" />
                </div>
                
                <div className="text-center space-y-2">
                  <span className={`text-xs font-extrabold ${item.accent} font-display`}>Step {item.step}</span>
                  <h3 className="font-display font-extrabold text-lg text-cocoa-900">{item.title}</h3>
                  <p className="text-xs text-cocoa-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 📚 STARTER DECKS — Ready to Study                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="decks" className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-cocoa-900 tracking-tight">
                Starter Decks 📚
              </h2>
              <p className="text-cocoa-500 text-xs mt-1">Jump right in or create your own.</p>
            </div>
            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="self-start text-xs font-bold text-strawberry-600 hover:text-strawberry-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>View all in Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {decks.slice(0, 4).map((deck, idx) => {
              const themes = [
                { bg: 'bg-rose-50', tagBg: 'bg-rose-100 text-rose-800', badge: '🌸', pill: 'border-rose-200' },
                { bg: 'bg-violet-50', tagBg: 'bg-violet-100 text-violet-800', badge: '💻', pill: 'border-violet-200' },
                { bg: 'bg-emerald-50', tagBg: 'bg-emerald-100 text-emerald-800', badge: '🧬', pill: 'border-emerald-200' },
                { bg: 'bg-amber-50', tagBg: 'bg-amber-100 text-amber-800', badge: '☀️', pill: 'border-amber-200' },
              ];
              const theme = themes[idx % themes.length];

              return (
                <div 
                  key={deck.id}
                  className={`squishy-card ${theme.bg} p-4 rounded-2xl border ${theme.pill} shadow-sm flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.tagBg}`}>
                        {theme.badge} Study
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-cocoa-900 text-sm mb-1">{deck.name}</h3>
                    <p className="text-[11px] text-cocoa-500 line-clamp-2 leading-relaxed">{deck.description}</p>
                  </div>
                  <button
                    onClick={() => { sounds.playClick(); onOpenDeck(deck); }}
                    className="mt-3 w-full py-2 bg-white hover:bg-pink-50 rounded-xl text-xs font-bold text-strawberry-600 border border-pink-200 flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Play size={11} className="fill-strawberry-600" />
                    <span>Study Now</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 💌 TESTIMONIALS — Cute Sticky Notes                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 kawaii-grid-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-cocoa-900 tracking-tight">
              Loved by learners 💕
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                text: '"I was studying for JLPT N2 and standard Anki burned me out. Ankitti made daily reviews feel like a cozy tea break. Passed with room to spare!"',
                name: 'Maya S.',
                role: 'JLPT Student',
                tape: '#FDA4AF',
                avatar: 'M',
                avatarBg: 'bg-pink-100 text-strawberry-700',
              },
              {
                text: '"The Relearn Anytime mode is a lifesaver. Being able to drill high-yield cards anytime before exams gives so much confidence."',
                name: 'David K.',
                role: 'Med Student',
                tape: '#FDE047',
                avatar: 'D',
                avatarBg: 'bg-honey-100 text-honey-800',
              },
              {
                text: '"Imported my 4,000-card deck in 3 seconds in Chrome. The auto-save means I never lose card drafts if my browser restarts."',
                name: 'Elena R.',
                role: 'Software Engineer',
                tape: '#C4B5FD',
                avatar: 'E',
                avatarBg: 'bg-taro-100 text-taro-800',
              },
            ].map((note, idx) => (
              <div 
                key={idx}
                className="bg-[#FFFEF9] rounded-2xl p-5 border border-pink-200/70 shadow-sm relative pt-6"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <KawaiiWashiTape color={note.tape} />
                </div>
                <div className="flex items-center space-x-0.5 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-cocoa-700 leading-relaxed font-medium">{note.text}</p>
                <div className="pt-3 mt-3 border-t border-pink-100 flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-full ${note.avatarBg} font-bold text-[10px] flex items-center justify-center`}>
                    {note.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-[11px] text-cocoa-900">{note.name}</div>
                    <div className="text-[10px] text-cocoa-400">{note.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🎀 BIG CTA BANNER — Illustrated & Inviting                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50 rounded-[32px] p-8 md:p-12 border-2 border-pink-200 shadow-lg overflow-hidden">
            
            {/* Scattered decorations */}
            <div className="pointer-events-none absolute inset-0">
              <FloatingStarSVG className="absolute top-6 right-10 animate-twinkle" size={22} color="#FCD34D" />
              <FloatingStarSVG className="absolute bottom-8 left-12 animate-twinkle [animation-delay:0.7s]" size={16} color="#F9A8D4" />
              <PlusDecor className="absolute top-12 left-[30%] animate-sparkle-float" size={12} color="#DDD6FE" />
              <HeartDecor className="absolute bottom-12 right-[25%] animate-float-gentle opacity-40" size={16} />
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-cocoa-900 tracking-tight leading-tight">
                  Ready to make studying feel cozy? 🌸
                </h2>
                <p className="text-sm text-cocoa-600 max-w-md mx-auto lg:mx-0">
                  No credit cards. No subscriptions. Just beautiful spaced repetition that works.
                </p>
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 pt-1">
                  <button
                    onClick={() => { sounds.playClick(); onLaunchApp(); }}
                    className="squishy-btn px-8 py-3.5 bg-gradient-to-r from-strawberry-500 to-pink-500 hover:from-strawberry-600 hover:to-pink-600 text-white rounded-2xl font-bold text-sm flex items-center space-x-2 cursor-pointer shadow-lg"
                  >
                    <KittyBow size={15} className="brightness-200" />
                    <span>Enter Ankitti Studio</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
              
              {/* Mascot */}
              <div className="w-40 h-40 sm:w-48 sm:h-48 shrink-0">
                <img 
                  src="/assets/celebrate_mascot.png" 
                  alt="Celebration mascot" 
                  className="w-full h-full object-contain drop-shadow-xl animate-float-gentle select-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ❓ FAQ ACCORDION                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-16 md:py-20 kawaii-grid-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-cocoa-900 tracking-tight">
              Questions? 🤔
            </h2>
          </div>

          <div className="space-y-2.5">
            {[
              {
                q: 'Can I import my existing Anki decks (.apkg)?',
                a: 'Yes! Ankitti includes a fast in-browser SQLite WASM unpacker that imports your existing Anki packages (.apkg), tags, clozes, and media completely offline without sending card data to any server.'
              },
              {
                q: 'How does "Relearn Anytime" work?',
                a: 'Standard Anki locks cards once daily reviews are done. In Ankitti, click "Relearn Anytime" on any deck to drill material before an exam without messing up your schedule.'
              },
              {
                q: 'Will I lose cards if I close the browser?',
                a: 'Never! Every single keystroke auto-saves into browser storage. If your laptop dies or you close the tab, your draft is restored the moment you reopen.'
              },
              {
                q: 'Is it really free?',
                a: 'Yes! 100% free, no subscriptions, no ads. Ankitti runs entirely in your browser with offline PWA support.'
              },
              {
                q: 'Can I install it on my phone?',
                a: 'Yes! Ankitti is a Progressive Web App (PWA). Use "Install App" or Safari\'s "Add to Home Screen" for a native offline experience.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border border-pink-100 rounded-xl overflow-hidden bg-white shadow-2xs"
              >
                <button
                  onClick={() => { sounds.playClick(); setActiveFaq(activeFaq === idx ? null : idx); }}
                  className="w-full p-4 text-left font-bold text-cocoa-900 flex items-center justify-between text-sm cursor-pointer hover:bg-pink-50/30 transition-colors"
                >
                  <span className="font-display font-bold text-[13px]">{faq.q}</span>
                  <ChevronDown 
                    size={15} 
                    className={`transition-transform text-cocoa-400 shrink-0 ml-3 ${activeFaq === idx ? 'rotate-180 text-strawberry-600' : ''}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-cocoa-600 leading-relaxed border-t border-pink-100 pt-3 animate-slide-up">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🎀 FOOTER                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="py-8 bg-white border-t border-pink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-400 to-strawberry-500 flex items-center justify-center shadow-sm">
              <KittyBow size={13} className="brightness-200" />
            </div>
            <span className="font-display font-extrabold text-cocoa-900 text-sm">Ankitti</span>
            <span className="text-[11px] text-cocoa-400">• Made with 🎀 by Astidor</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); sounds.playClick(); }}
              className="text-[11px] font-bold text-cocoa-400 hover:text-cocoa-900 px-2 py-1 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
            >
              Back to Top ↑
            </button>
            <button
              onClick={() => { sounds.playClick(); onLaunchApp(); }}
              className="squishy-btn px-4 py-1.5 bg-strawberry-500 hover:bg-strawberry-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
