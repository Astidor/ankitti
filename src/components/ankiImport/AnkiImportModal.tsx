import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Database, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-[28px] w-full max-w-xl shadow-2xl overflow-hidden border border-pink-200/80">
        
        {/* iOS Grabber & Header */}
        <div className="pt-2.5 pb-1 px-4 flex justify-center bg-white/70">
          <div className="w-10 h-1 bg-pink-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-white/80 border-b border-pink-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-pink-50 rounded-xl border border-pink-200/60 shadow-xs flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-xs font-black text-kitty-dark tracking-tight">
                Import from Anki (.apkg / .tsv / .txt)
              </div>
              <div className="text-[10px] text-kitty-subtle">Migrate existing cards & review intervals</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink-100/70 hover:bg-pink-200/70 text-kitty-subtle hover:text-kitty-dark flex items-center justify-center transition-colors ios-btn"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          <div>
            <h3 className="font-black text-kitty-dark text-sm mb-1 flex items-center space-x-1.5">
              <span>Transfer Your Anki Decks to Ankitti</span>
              <span>🎀</span>
            </h3>
            <p className="text-kitty-subtle leading-relaxed text-xs">
              Export your deck from Anki (as an <strong>.apkg</strong> package, or <strong>Notes in Plain Text .txt / .tsv</strong>), and drop it here. We'll import all your cards, clozes, tags, and review intervals!
            </p>
          </div>

          {/* Destination Deck Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-pink-50/60 p-3.5 rounded-2xl border border-pink-200/70">
            <label className="font-bold text-kitty-dark whitespace-nowrap text-xs">
              Import Destination:
            </label>
            <select
              value={selectedTargetDeck}
              onChange={(e) => setSelectedTargetDeck(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-pink-200 bg-white font-medium text-xs focus:ring-2 focus:ring-pink-400 focus:outline-none shadow-xs"
            >
              <option value="new">✨ Create New Deck (from file name)</option>
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
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-pink-500 bg-pink-50/80 scale-[1.01]'
                  : 'border-pink-300/80 bg-pink-50/30 hover:bg-pink-50/60 hover:border-pink-400 hover:scale-[1.005]'
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

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-200 to-rose-100 flex items-center justify-center mx-auto mb-3 text-pink-600 shadow-sm">
                <Upload size={24} />
              </div>

              <div className="font-extrabold text-kitty-dark text-sm mb-1">
                Drop your Anki file here, or <span className="text-pink-600 underline">browse</span>
              </div>
              <div className="text-kitty-subtle text-[11px]">
                Supports <strong>.apkg</strong> (standard Anki package), <strong>.tsv</strong>, <strong>.txt</strong>, and <strong>.json</strong>
              </div>
            </div>
          )}

          {/* Loading Progress */}
          {isLoading && (
            <div className="p-8 text-center bg-pink-50/70 rounded-3xl border border-pink-200 space-y-3">
              <div className="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="font-bold text-kitty-dark text-sm">{progressText}</div>
              <p className="text-kitty-subtle text-[11px]">Extracting notes, tags, and spaced repetition metrics...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start space-x-2.5 text-xs">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Import Warning</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Preview */}
          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Ready to Import {importResult.summary.cardCount} Flashcards!</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-kitty-subtle block text-[11px]">Source File:</span>
                  <span className="font-bold text-kitty-dark truncate block">{importResult.summary.fileName}</span>
                </div>
                <div>
                  <span className="text-kitty-subtle block text-[11px]">Decks to Add:</span>
                  <span className="font-bold text-kitty-dark truncate block">
                    {importResult.decks.map(d => d.name).join(', ') || 'Default Deck'}
                  </span>
                </div>
              </div>

              {/* Sample card preview */}
              {importResult.cards.length > 0 && (
                <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 text-xs">
                  <span className="text-kitty-subtle text-[10px] uppercase font-bold tracking-wider block mb-1">
                    First Card Preview:
                  </span>
                  <div className="font-bold text-kitty-dark truncate">{importResult.cards[0].front}</div>
                  <div className="text-kitty-subtle text-[11px] truncate mt-0.5">{importResult.cards[0].back}</div>
                </div>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-pink-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-kitty-dark hover:bg-pink-100/70 transition-colors font-bold text-xs ios-btn"
            >
              Cancel
            </button>

            {importResult && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-200 hover:shadow-lg transition-all text-xs flex items-center space-x-2 ios-btn cursor-pointer"
              >
                <span>Complete Import ({importResult.summary.cardCount} Cards)</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
