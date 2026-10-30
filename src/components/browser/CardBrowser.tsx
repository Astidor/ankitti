import React, { useState } from 'react';
import { Search, Edit3, Trash2, Plus, Image as ImageIcon, X } from 'lucide-react';
import { Card, Deck } from '../../types/anki';
import { formatIntervalPreview } from '../../services/scheduler';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { KittyBow } from '../common/KittyIllustrations';

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
    const raw = decks.find(d => d.id === deckId)?.name || 'General';
    return raw.replace(/^(\p{Extended_Pictographic}|\p{Regional_Indicator}{2})\s*/u, '')
      .replace(/^(JP|ES|CS:?)\s*/i, '')
      .trim() || raw;
  };

  const stripPreviewText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
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
      {/* Catalog Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-cocoa-900 tracking-tight flex items-center space-x-2">
            <span>Card Catalog</span>
            <KittyBow size={20} />
          </h2>
          <p className="text-xs text-cocoa-500 mt-0.5">
            Browse, search, and manage all {cards.length} flashcards across your decks.
          </p>
        </div>
        <button
          onClick={onNewCard}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-strawberry-500 hover:bg-strawberry-600 text-white font-bold text-xs shadow-rose-btn transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>New Flashcard</span>
        </button>
      </div>

      {/* Top Filter & Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-pink-100 shadow-[0_4px_16px_rgba(255,77,121,0.04)]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards, clozes, answers, tags..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-pink-50/30 border border-pink-200/80 text-xs font-medium text-cocoa-900 placeholder-cocoa-400 focus:outline-none focus:ring-2 focus:ring-strawberry-200 focus:border-strawberry-400 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cocoa-400 hover:text-cocoa-700"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Deck Filter */}
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-pink-200/80 bg-white text-xs font-semibold text-cocoa-700 focus:outline-none focus:ring-2 focus:ring-strawberry-200 shadow-2xs cursor-pointer"
          >
            <option value="all">All Decks ({cards.length})</option>
            {decks.map(d => (
              <option key={d.id} value={d.id}>{getDeckName(d.id)}</option>
            ))}
          </select>

          {/* State Filter */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-pink-200/80 bg-white text-xs font-semibold text-cocoa-700 focus:outline-none focus:ring-2 focus:ring-strawberry-200 shadow-2xs cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
          </select>
        </div>
      </div>

      {/* Cards List / Table Container */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-[0_4px_16px_rgba(255,77,121,0.04)] overflow-hidden">
        {/* Mobile View: Clean Card Items */}
        <div className="md:hidden divide-y divide-pink-100">
          {filteredCards.map(card => {
            const stateBadge = {
              new: (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-taro-50 text-taro-700 border border-taro-200">
                  New
                </span>
              ),
              learning: (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-honey-50 text-honey-700 border border-honey-200">
                  Learning
                </span>
              ),
              relearning: (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-strawberry-50 text-strawberry-700 border border-strawberry-200">
                  Relearn
                </span>
              ),
              review: (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-matcha-50 text-matcha-700 border border-matcha-200">
                  Review
                </span>
              ),
            }[card.state] || null;

            return (
              <div 
                key={card.id} 
                className="p-4 space-y-2 hover:bg-cocoa-50/50 transition-colors cursor-pointer"
                onClick={() => onEditCard(card)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {stateBadge}
                    <span className="text-[11px] font-semibold text-cocoa-700 truncate max-w-[140px]">
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
                        className="p-1.5 rounded-lg bg-cocoa-50 text-cocoa-600 hover:bg-cocoa-100 cursor-pointer"
                        title="View Attachment"
                      >
                        <ImageIcon size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 rounded-lg text-cocoa-500 hover:text-cocoa-900 hover:bg-cocoa-100 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this card?')) onDeleteCard(card.id);
                      }}
                      className="p-1.5 rounded-lg text-cocoa-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="font-semibold text-cocoa-900 text-xs leading-snug line-clamp-2">
                  {stripPreviewText(card.front) || (card.frontImage ? '[Image Attachment]' : '(Empty)')}
                </div>

                <div className="text-cocoa-600 text-xs line-clamp-2 bg-pink-50/30 p-2 rounded-xl border border-pink-100 font-normal">
                  {stripPreviewText(card.back) || (card.backImage ? '[Image Attachment]' : '(Empty)')}
                </div>

                <div className="flex items-center justify-between text-[11px] text-cocoa-400 font-mono pt-0.5">
                  <span>Interval: <strong className="text-cocoa-700 font-semibold">{formatIntervalPreview(card.interval || 0)}</strong></span>
                  <span>Ease: <strong className="text-cocoa-700 font-semibold">{Math.round((card.easeFactor || 2.5) * 100)}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto max-h-[560px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-pink-50/50 backdrop-blur-xs border-b border-pink-100 font-semibold text-cocoa-700 select-none z-10">
              <tr>
                <th className="py-3 px-4 w-24 text-center">State</th>
                <th className="py-3 px-4">Deck</th>
                <th className="py-3 px-4 w-1/3">Front / Question</th>
                <th className="py-3 px-4 w-1/3">Back / Key Answer</th>
                <th className="py-3 px-3">Interval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100 font-normal">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-cocoa-400 text-xs">
                    No cards match current filter.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const stateBadge = {
                    new: (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-taro-50 text-taro-700 border border-taro-200">
                        New
                      </span>
                    ),
                    learning: (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-honey-50 text-honey-700 border border-honey-200">
                        Learning
                      </span>
                    ),
                    relearning: (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-strawberry-50 text-strawberry-700 border border-strawberry-200">
                        Relearn
                      </span>
                    ),
                    review: (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-matcha-50 text-matcha-700 border border-matcha-200">
                        Review
                      </span>
                    ),
                  }[card.state] || null;

                  return (
                    <tr 
                      key={card.id}
                      onClick={() => onEditCard(card)}
                      className="hover:bg-cocoa-50/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 text-center">
                        {stateBadge}
                      </td>
                      <td className="py-3 px-4 font-semibold text-cocoa-800">
                        <span className="truncate max-w-[120px] block">{getDeckName(card.deckId)}</span>
                      </td>
                      <td className="py-3 px-4 text-cocoa-900 font-medium">
                        <div className="flex items-center space-x-1.5">
                          {card.frontImage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage({ url: card.frontImage!, title: 'Front Attachment' });
                              }}
                              className="text-strawberry-500 hover:text-strawberry-700 p-0.5 rounded"
                              title="View Question Attachment"
                            >
                              <ImageIcon size={13} />
                            </button>
                          )}
                          <span className="truncate block max-w-sm">
                            {stripPreviewText(card.front) || '(Empty)'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-cocoa-600">
                        <div className="flex items-center space-x-1.5">
                          {card.backImage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage({ url: card.backImage!, title: 'Back Attachment' });
                              }}
                              className="text-strawberry-500 hover:text-strawberry-700 p-0.5 rounded"
                              title="View Answer Attachment"
                            >
                              <ImageIcon size={13} />
                            </button>
                          )}
                          <span className="truncate block max-w-sm font-normal">
                            {stripPreviewText(card.back) || '(Empty)'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-cocoa-500 font-medium whitespace-nowrap">
                        {formatIntervalPreview(card.interval || 0)}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditCard(card)}
                            className="p-1 rounded-lg text-cocoa-500 hover:text-cocoa-900 hover:bg-cocoa-100 transition-colors cursor-pointer"
                            title="Edit Card"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this card?')) onDeleteCard(card.id);
                            }}
                            className="p-1 rounded-lg text-cocoa-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <ImageLightboxModal
          isOpen={true}
          src={previewImage.url}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
