import React, { useState } from 'react';
import { Search, Filter, Edit3, Trash2, Flag, Sparkles, Plus, BookOpen, Layers, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Card, Deck } from '../../types/anki';
import { formatIntervalPreview } from '../../services/scheduler';
import { ImageLightboxModal } from '../common/ImageLightboxModal';

interface CardBrowserProps {
  decks: Deck[];
  cards: Card[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onNewCard: () => void;
}

export const CardBrowser: React.FC<CardBrowserProps> = ({
  decks,
  cards,
  onEditCard,
  onDeleteCard,
  onNewCard,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const filteredCards = cards.filter(card => {
    if (selectedDeckId !== 'all' && card.deckId !== selectedDeckId) return false;
    if (filterState !== 'all' && card.state !== filterState) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchFront = card.front.toLowerCase().includes(term);
      const matchBack = card.back.toLowerCase().includes(term);
      const matchTags = card.tags.some(t => t.toLowerCase().includes(term));
      const matchSystem = card.medicalMeta?.system?.toLowerCase().includes(term);
      const matchPearl = card.medicalMeta?.clinicalPearl?.toLowerCase().includes(term);
      return matchFront || matchBack || matchTags || matchSystem || matchPearl;
    }
    return true;
  });

  const getDeckName = (deckId: string) => {
    return decks.find(d => d.id === deckId)?.name || 'General';
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/90 p-4 rounded-3xl border border-pink-200/80 shadow-xs backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-kitty-subtle" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards, clozes, answers, tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-pink-50/50 border border-pink-200/80 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium placeholder-kitty-subtle/70 shadow-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          {/* Deck Filter */}
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border border-pink-200/80 bg-white text-xs font-semibold text-kitty-dark focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-xs"
          >
            <option value="all">All Decks ({cards.length})</option>
            {decks.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* State Filter */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border border-pink-200/80 bg-white text-xs font-semibold text-kitty-dark focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-xs"
          >
            <option value="all">All States</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
          </select>

          <button
            onClick={onNewCard}
            className="px-4 py-2 rounded-2xl bg-[#FF4D80] hover:bg-[#F43F5E] text-white font-extrabold text-xs shadow-md shadow-pink-200 hover:shadow-lg transition-all flex items-center space-x-1.5 ios-btn cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Add Card 🎀</span>
          </button>
        </div>
      </div>

      {/* Cards List / Table Container */}
      <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: Native iOS Touch Cards (phone screens) */}
        <div className="md:hidden divide-y divide-pink-100/80">
          {filteredCards.map(card => {
            const stateBadge = {
              new: (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                  New
                </span>
              ),
              learning: (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                  Learning
                </span>
              ),
              relearning: (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                  Relearn
                </span>
              ),
              review: (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                  Review
                </span>
              ),
            }[card.state];

            return (
              <div
                key={card.id}
                onClick={() => onEditCard(card)}
                className="p-4 hover:bg-pink-50/40 active:bg-pink-100/50 transition-colors cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {stateBadge}
                    <span className="text-[11px] font-extrabold text-pink-600 truncate max-w-[140px]">
                      {getDeckName(card.deckId)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    {(card.frontImage || card.backImage) && (
                      <button
                        type="button"
                        onClick={() => {
                          const targetImg = card.frontImage || card.backImage;
                          if (targetImg) {
                            setPreviewImage({
                              url: targetImg,
                              title: `${card.front.slice(0, 30)}...`
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 cursor-pointer"
                        title="View Attachment"
                      >
                        <ImageIcon size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-pink-100 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this card?')) onDeleteCard(card.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">
                  {card.front}
                </div>

                <div className="text-slate-600 text-xs line-clamp-2 bg-pink-50/50 p-2.5 rounded-xl border border-pink-100/60 font-medium">
                  {card.back}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                  <span>Interval: <strong className="text-slate-700 font-semibold">{formatIntervalPreview(card.interval || 0)}</strong></span>
                  <span>Ease: <strong className="text-slate-700 font-semibold">{Math.round((card.easeFactor || 2.5) * 100)}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Data Table (Tablets & Desktops) */}
        <div className="hidden md:block overflow-x-auto max-h-[540px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-pink-100/90 backdrop-blur-md border-b border-pink-200/80 font-bold text-kitty-dark select-none z-10">
              <tr>
                <th className="py-3 px-4 w-24 text-center">State</th>
                <th className="py-3 px-4">Deck</th>
                <th className="py-3 px-4 w-1/3">Front / Question</th>
                <th className="py-3 px-4 w-1/3">Back / Key Answer</th>
                <th className="py-3 px-3">Interval</th>
                <th className="py-3 px-3">Ease</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/80">
              {filteredCards.map(card => {
                const stateBadge = {
                  new: (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                      New
                    </span>
                  ),
                  learning: (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                      Learning
                    </span>
                  ),
                  relearning: (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                      Relearn
                    </span>
                  ),
                  review: (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                      Review
                    </span>
                  ),
                }[card.state];

                return (
                  <tr 
                    key={card.id}
                    className="hover:bg-pink-50/50 transition-colors group cursor-pointer"
                    onClick={() => onEditCard(card)}
                  >
                    <td className="py-3 px-4 text-center">
                      {stateBadge}
                    </td>

                    <td className="py-3 px-4 font-extrabold text-pink-600 whitespace-nowrap">
                      {getDeckName(card.deckId)}
                    </td>

                    <td className="py-3 px-4 text-kitty-dark font-medium max-w-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="truncate font-sans">{card.front}</span>
                        {(card.frontImage || card.backImage) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetImg = card.frontImage || card.backImage;
                              if (targetImg) {
                                setPreviewImage({
                                  url: targetImg,
                                  title: `${card.front.slice(0, 30)}... (Attachment)`
                                });
                              }
                            }}
                            className="p-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 shrink-0 transition-colors cursor-pointer"
                            title="Click to preview image attachment"
                          >
                            <ImageIcon size={12} />
                          </button>
                        )}
                      </div>
                      {card.medicalMeta?.highYield && (
                        <span className="text-[10px] text-pink-600 font-bold">⭐ Key Concept</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-kitty-subtle max-w-xs">
                      <div className="truncate">{card.back}</div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-kitty-dark">
                      {formatIntervalPreview(card.interval || 0)}
                    </td>

                    <td className="py-3 px-3 font-mono text-kitty-subtle">
                      {Math.round((card.easeFactor || 2.5) * 100)}%
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditCard(card)}
                          className="p-1.5 rounded-xl text-kitty-subtle hover:text-kitty-dark hover:bg-pink-100 transition-colors ios-btn"
                          title="Edit Card"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this card permanently?')) {
                              onDeleteCard(card.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-kitty-subtle hover:text-rose-600 hover:bg-rose-50 transition-colors ios-btn"
                          title="Delete Card"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCards.length === 0 && (
          <div className="p-12 text-center text-kitty-subtle text-xs space-y-1">
            <div className="text-2xl mb-1">🎀</div>
            <div className="font-bold text-kitty-dark">No cards found</div>
            <div>Try adjusting your search query or deck filter.</div>
          </div>
        )}
      </div>

      {/* Lightbox for Card Browser Attachments */}
      <ImageLightboxModal
        isOpen={!!previewImage}
        src={previewImage?.url || null}
        alt={previewImage?.title}
        title={previewImage?.title}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};
