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
      {/* Top Filter & Search Controls Bento Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#EFE8DE] shadow-bento">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards, clozes, answers, tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE] text-xs font-semibold text-[#3E2D28] placeholder-cocoa-400 focus:outline-none focus:ring-2 focus:ring-strawberry-300 focus:border-strawberry-400 transition-all shadow-2xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Deck Filter */}
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-[#EFE8DE] bg-white text-xs font-bold text-cocoa-700 focus:outline-none focus:ring-2 focus:ring-strawberry-300 shadow-2xs cursor-pointer"
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
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-[#EFE8DE] bg-white text-xs font-bold text-cocoa-700 focus:outline-none focus:ring-2 focus:ring-strawberry-300 shadow-2xs cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
          </select>

          <button
            onClick={onNewCard}
            className="hidden sm:flex px-4 py-2 rounded-xl bg-strawberry-500 hover:bg-strawberry-600 text-white font-bold text-xs shadow-squishy-pink transition-all items-center space-x-1.5 squishy-btn cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Cards List / Table Container */}
      <div className="bento-card overflow-hidden">
        {/* Mobile View: Native Cards */}
        <div className="md:hidden divide-y divide-[#EFE8DE]">
          {filteredCards.map(card => {
            const stateBadge = {
              new: (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-taro-50 text-taro-700 border border-taro-200 inline-block">
                  New
                </span>
              ),
              learning: (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-honey-50 text-honey-700 border border-honey-200 inline-block">
                  Learning
                </span>
              ),
              relearning: (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-strawberry-50 text-strawberry-700 border border-strawberry-200 inline-block">
                  Relearn
                </span>
              ),
              review: (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-matcha-50 text-matcha-700 border border-matcha-200 inline-block">
                  Review
                </span>
              ),
            }[card.state];

            return (
              <div
                key={card.id}
                onClick={() => onEditCard(card)}
                className="p-4 hover:bg-[#FAF7F2] transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {stateBadge}
                    <span className="text-[11px] font-bold text-cocoa-700 truncate max-w-[140px]">
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
                        className="p-1.5 rounded-lg bg-[#FAF7F2] text-cocoa-600 hover:bg-slate-200 cursor-pointer"
                        title="View Attachment"
                      >
                        <ImageIcon size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 rounded-lg text-cocoa-500 hover:text-[#3E2D28] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this card?')) onDeleteCard(card.id);
                      }}
                      className="p-1.5 rounded-lg text-cocoa-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="font-bold text-[#3E2D28] text-xs leading-snug line-clamp-2">
                  {stripPreviewText(card.front) || (card.frontImage ? '[Image Attachment]' : '(Empty)')}
                </div>

                <div className="text-cocoa-600 text-xs line-clamp-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EFE8DE] font-medium">
                  {stripPreviewText(card.back) || (card.backImage ? '[Image Attachment]' : '(Empty)')}
                </div>

                <div className="flex items-center justify-between text-[11px] text-cocoa-400 font-mono pt-0.5">
                  <span>Interval: <strong className="text-cocoa-700 font-bold">{formatIntervalPreview(card.interval || 0)}</strong></span>
                  <span>Ease: <strong className="text-cocoa-700 font-bold">{Math.round((card.easeFactor || 2.5) * 100)}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto max-h-[560px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#FAF7F2] border-b border-[#EFE8DE] font-bold text-cocoa-600 select-none z-10">
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
            <tbody className="divide-y divide-[#EFE8DE]">
              {filteredCards.map(card => {
                const stateBadge = {
                  new: (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-taro-50 text-taro-700 border border-taro-200 inline-block">
                      New
                    </span>
                  ),
                  learning: (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-honey-50 text-honey-700 border border-honey-200 inline-block">
                      Learning
                    </span>
                  ),
                  relearning: (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-strawberry-50 text-strawberry-700 border border-strawberry-200 inline-block">
                      Relearn
                    </span>
                  ),
                  review: (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-matcha-50 text-matcha-700 border border-matcha-200 inline-block">
                      Review
                    </span>
                  ),
                }[card.state];

                return (
                  <tr
                    key={card.id}
                    onClick={() => onEditCard(card)}
                    className="hover:bg-[#FAF7F2]/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 text-center">{stateBadge}</td>
                    <td className="py-3 px-4 font-bold text-cocoa-700 whitespace-nowrap">
                      {getDeckName(card.deckId)}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#3E2D28] max-w-xs truncate">
                      <div className="flex items-center space-x-2">
                        {card.frontImage && (
                          <span className="px-1.5 py-0.5 rounded bg-strawberry-100 text-strawberry-700 text-[10px] font-bold">Image</span>
                        )}
                        <span className="truncate">{stripPreviewText(card.front) || '(Empty front)'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-cocoa-600 max-w-xs truncate font-medium">
                      <div className="flex items-center space-x-2">
                        {card.backImage && (
                          <span className="px-1.5 py-0.5 rounded bg-strawberry-100 text-strawberry-700 text-[10px] font-bold">Image</span>
                        )}
                        <span className="truncate">{stripPreviewText(card.back) || '(Empty back)'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-cocoa-600 whitespace-nowrap font-bold">
                      {formatIntervalPreview(card.interval || 0)}
                    </td>
                    <td className="py-3 px-3 font-mono text-cocoa-600 whitespace-nowrap font-bold">
                      {Math.round((card.easeFactor || 2.5) * 100)}%
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditCard(card)}
                          className="p-1.5 rounded-xl text-cocoa-400 hover:text-[#3E2D28] hover:bg-white transition-colors cursor-pointer"
                          title="Edit Card"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this card?')) onDeleteCard(card.id);
                          }}
                          className="p-1.5 rounded-xl text-cocoa-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
