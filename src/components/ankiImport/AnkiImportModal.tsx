import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Deck } from '../../types/anki';
import { parseAnkiFile, ImportResult } from '../../services/ankiImporter';
import { sounds } from '../../services/audio';
import { KittyBow } from '../common/KittyIllustrations';

interface AnkiImportModalProps {
  isOpen: boolean;
  decks: Deck[];
  onClose: () => void;
  onImportComplete: (result: ImportResult, targetDeckId?: string) => void;
}

export const AnkiImportModal: React.FC<AnkiImportModalProps> = ({
  isOpen,
  decks,
  onClose,
  onImportComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTargetDeck, setSelectedTargetDeck] = useState<string>('new');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressText, setProgressText] = useState<string>('');

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setImportResult(null);
    setProgressText(`Reading ${file.name}...`);

    try {
      if (file.name.endsWith('.apkg')) {
        setProgressText('Unpacking Anki SQLite package (.apkg)...');
      } else {
        setProgressText('Parsing cards and formatting...');
      }

      const result = await parseAnkiFile(
        file,
        selectedTargetDeck === 'new' ? undefined : selectedTargetDeck
      );

      setImportResult(result);
      sounds.playRating(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import file. Please check format.';
      setErrorMessage(msg);
      sounds.playRating(1);
    } finally {
      setIsLoading(false);
      setProgressText('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!importResult) return;
    onImportComplete(importResult, selectedTargetDeck === 'new' ? undefined : selectedTargetDeck);
    sounds.playRating(4);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-cocoa-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF7F2] rounded-t-[28px] sm:rounded-[28px] w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-[#EFE8DE] ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-white/50 sm:hidden">
          <div className="w-10 h-1 bg-cocoa-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#EFE8DE] select-none">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-strawberry-50 rounded-xl text-strawberry-600 border border-strawberry-100 flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-xs font-extrabold text-[#3E2D28] tracking-tight">
                Import from Anki (.apkg / .tsv / .txt)
              </div>
              <div className="text-[10px] text-cocoa-500">Migrate existing cards, clozes, and review intervals</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-cocoa-50 hover:bg-cocoa-100 text-cocoa-500 hover:text-[#3E2D28] transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <h3 className="font-extrabold text-[#3E2D28] text-sm mb-1">
              Import Anki Flashcard Collections
            </h3>
            <p className="text-cocoa-600 leading-relaxed text-xs font-normal">
              Export your deck from desktop Anki (as an <strong>.apkg</strong> package, or <strong>Notes in Plain Text .txt / .tsv</strong>), and drop it here. Ankitti will unpack cards, clozes, tags, and SM-2 schedules entirely in your browser.
            </p>
          </div>

          {/* Destination Deck Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-white p-3.5 rounded-2xl border border-[#EFE8DE] shadow-2xs">
            <label className="font-bold text-cocoa-700 whitespace-nowrap text-xs">
              Import Destination:
            </label>
            <select
              value={selectedTargetDeck}
              onChange={(e) => setSelectedTargetDeck(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-[#EFE8DE] bg-[#FAF7F2] font-bold text-xs text-[#3E2D28] focus:outline-none focus:ring-2 focus:ring-strawberry-400/30 focus:border-strawberry-400 shadow-2xs"
            >
              <option value="new">Create New Deck (from file name)</option>
              {decks.map(d => (
                <option key={d.id} value={d.id}>
                  Append to: {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Box */}
          {!importResult && !isLoading && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-strawberry-500 bg-strawberry-50/50'
                  : 'border-[#EFE8DE] bg-white hover:bg-strawberry-50/20 hover:border-strawberry-300'
              }`}
              onClick={() => document.getElementById('anki-file-input')?.click()}
            >
              <input
                id="anki-file-input"
                type="file"
                accept=".apkg,.tsv,.txt,.csv,.json"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DE] flex items-center justify-center mx-auto mb-3 text-strawberry-600 shadow-2xs">
                <Upload size={22} />
              </div>

              <div className="font-bold text-[#3E2D28] text-sm mb-1">
                Drop your Anki file here, or <span className="text-strawberry-600 underline">browse</span>
              </div>
              <div className="text-cocoa-500 text-[11px] font-normal">
                Supports <strong>.apkg</strong> (standard Anki package), <strong>.tsv</strong>, <strong>.txt</strong>, and <strong>.json</strong>
              </div>
            </div>
          )}

          {/* Loading Progress */}
          {isLoading && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EFE8DE] space-y-2.5 shadow-2xs">
              <div className="w-8 h-8 border-2 border-strawberry-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="font-bold text-[#3E2D28] text-sm">{progressText}</div>
              <p className="text-cocoa-500 text-[11px] font-normal">Extracting cards, clozes, tags, and spaced repetition metrics...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-strawberry-50 border border-strawberry-200 rounded-2xl text-strawberry-800 flex items-start space-x-2.5 text-xs">
              <AlertCircle size={16} className="text-strawberry-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Import Warning</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Preview */}
          {importResult && (
            <div className="p-4 bg-matcha-50 border border-matcha-200 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center space-x-2 text-matcha-900 font-bold text-sm">
                <CheckCircle2 size={18} className="text-matcha-600" />
                <span>Ready to Import {importResult.summary.cardCount} Flashcards!</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-matcha-200">
                <div>
                  <span className="text-cocoa-500 block text-[11px]">Source File:</span>
                  <span className="font-bold text-[#3E2D28] truncate block">{importResult.summary.fileName}</span>
                </div>
                <div>
                  <span className="text-cocoa-500 block text-[11px]">Decks to Add:</span>
                  <span className="font-bold text-[#3E2D28] truncate block">
                    {importResult.decks.map(d => d.name).join(', ') || 'Default Deck'}
                  </span>
                </div>
              </div>

              {/* Sample card preview */}
              {importResult.cards.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-matcha-200 text-xs">
                  <span className="text-cocoa-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                    Sample Card Preview:
                  </span>
                  <div className="font-bold text-[#3E2D28] truncate">{importResult.cards[0].front}</div>
                  <div className="text-cocoa-600 text-[11px] truncate mt-0.5">{importResult.cards[0].back}</div>
                </div>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 pb-safe flex items-center justify-between border-t border-[#EFE8DE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-cocoa-600 hover:bg-cocoa-100 transition-colors font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>

            {importResult && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="squishy-btn px-5 py-2.5 rounded-xl bg-matcha-600 hover:bg-matcha-700 text-white font-bold shadow-2xs transition-all text-xs flex items-center space-x-2 cursor-pointer"
              >
                <span>Import {importResult.summary.cardCount} Cards</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
