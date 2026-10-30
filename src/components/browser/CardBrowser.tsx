import React, { useState } from 'react';
import { Search, Edit3, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
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

  const stripPreviewText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards, clozes, answers, tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all shadow-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Deck Filter */}
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400/50 shadow-xs"
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
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400/50 shadow-xs"
          >
            <option value="all">All States</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
          </select>

          <button
            onClick={onNewCard}
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-xs transition-all items-center space-x-1.5 ios-btn cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Cards List / Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: Native Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredCards.map(card => {
            const stateBadge = {
              new: (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                  New
                </span>
              ),
              learning: (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                  Learning
                </span>
              ),
              relearning: (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                  Relearn
                </span>
              ),
              review: (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                  Review
                </span>
              ),
            }[card.state];

            return (
              <div
                key={card.id}
                onClick={() => onEditCard(card)}
                className="p-4 hover:bg-slate-50/70 active:bg-slate-100/70 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {stateBadge}
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[140px]">
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
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                        title="View Attachment"
                      >
                        <ImageIcon size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
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

                <div className="font-semibold text-slate-900 text-xs leading-snug line-clamp-2">
                  {stripPreviewText(card.front) || (card.frontImage ? '[Image Attachment]' : '(Empty)')}
                </div>

                <div className="text-slate-600 text-xs line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-normal">
                  {stripPreviewText(card.back) || (card.backImage ? '[Image Attachment]' : '(Empty)')}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                  <span>Interval: <strong className="text-slate-700 font-semibold">{formatIntervalPreview(card.interval || 0)}</strong></span>
                  <span>Ease: <strong className="text-slate-700 font-semibold">{Math.round((card.easeFactor || 2.5) * 100)}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto max-h-[560px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 font-semibold text-slate-700 select-none z-10">
              <tr>
                <th className="py-2.5 px-4 w-24 text-center">State</th>
                <th className="py-2.5 px-4">Deck</th>
                <th className="py-2.5 px-4 w-1/3">Front / Question</th>
                <th className="py-2.5 px-4 w-1/3">Back / Key Answer</th>
                <th className="py-2.5 px-3">Interval</th>
                <th className="py-2.5 px-3">Ease</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCards.map(card => {
                const stateBadge = {
                  new: (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                      New
                    </span>
                  ),
                  learning: (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                      Learning
                    </span>
                  ),
                  relearning: (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                      Relearn
                    </span>
                  ),
                  review: (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                      Review
                    </span>
                  ),
                }[card.state];

                return (
                  <tr
                    key={card.id}
                    onClick={() => onEditCard(card)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 text-center">{stateBadge}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {getDeckName(card.deckId)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      <div className="flex items-center space-x-2">
                        {card.frontImage && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">Image</span>
                        )}
                        <span className="truncate">{stripPreviewText(card.front) || '(Empty front)'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate font-normal">
                      <div className="flex items-center space-x-2">
                        {card.backImage && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">Image</span>
                        )}
                        <span className="truncate">{stripPreviewText(card.back) || '(Empty back)'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap font-medium">
                      {formatIntervalPreview(card.interval || 0)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap font-medium">
                      {Math.round((card.easeFactor || 2.5) * 100)}%
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditCard(card)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Card"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this card?')) onDeleteCard(card.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
      </div>

      {/* Image Preview Lightbox */}
      <ImageLightboxModal
        isOpen={!!previewImage}
        src={previewImage?.url || null}
        title={previewImage?.title || 'Card Attachment'}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};
