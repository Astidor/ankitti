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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-2xl w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 ios-bottom-sheet sm:animate-none">
        
        {/* iOS Grabber */}
        <div className="pt-2 pb-1 px-4 flex justify-center bg-slate-50 sm:hidden">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100 select-none">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-500 border border-rose-100 flex items-center justify-center">
              <KittyBow size={16} />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight">
                Import from Anki (.apkg / .tsv / .txt)
              </div>
              <div className="text-[10px] text-slate-500">Migrate existing cards, clozes, and review intervals</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Import Anki Flashcard Collections
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              Export your deck from desktop Anki (as an <strong>.apkg</strong> package, or <strong>Notes in Plain Text .txt / .tsv</strong>), and drop it here. Ankitti will unpack cards, clozes, tags, and SM-2 schedules entirely in your browser.
            </p>
          </div>

          {/* Destination Deck Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="font-semibold text-slate-700 whitespace-nowrap text-xs">
              Import Destination:
            </label>
            <select
              value={selectedTargetDeck}
              onChange={(e) => setSelectedTargetDeck(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-2xs"
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
                  ? 'border-rose-500 bg-rose-50/50'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
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

              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-600 shadow-2xs">
                <Upload size={22} />
              </div>

              <div className="font-semibold text-slate-800 text-sm mb-1">
                Drop your Anki file here, or <span className="text-rose-600 underline">browse</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Supports <strong>.apkg</strong> (standard Anki package), <strong>.tsv</strong>, <strong>.txt</strong>, and <strong>.json</strong>
              </div>
            </div>
          )}

          {/* Loading Progress */}
          {isLoading && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="font-semibold text-slate-800 text-sm">{progressText}</div>
              <p className="text-slate-500 text-[11px]">Extracting cards, clozes, tags, and spaced repetition metrics...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-2.5 text-xs">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Import Warning</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Preview */}
          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Ready to Import {importResult.summary.cardCount} Flashcards!</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-emerald-100">
                <div>
                  <span className="text-slate-500 block text-[11px]">Source File:</span>
                  <span className="font-semibold text-slate-800 truncate block">{importResult.summary.fileName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Decks to Add:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {importResult.decks.map(d => d.name).join(', ') || 'Default Deck'}
                  </span>
                </div>
              </div>

              {/* Sample card preview */}
              {importResult.cards.length > 0 && (
                <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                    Sample Card Preview:
                  </span>
                  <div className="font-semibold text-slate-800 truncate">{importResult.cards[0].front}</div>
                  <div className="text-slate-500 text-[11px] truncate mt-0.5">{importResult.cards[0].back}</div>
                </div>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 pb-safe flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>

            {importResult && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-all text-xs flex items-center space-x-2 cursor-pointer"
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
