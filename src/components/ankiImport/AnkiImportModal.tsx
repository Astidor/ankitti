import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { Deck } from '../../types/anki';
import { parseAnkiFile, ImportResult } from '../../services/ankiImporter';
import { sounds } from '../../services/audio';
import { Dialog, Field } from '../studio/Dialog';

interface AnkiImportModalProps {
  isOpen: boolean;
  decks: Deck[];
  onClose: () => void;
  onImportComplete: (result: ImportResult, targetDeckId?: string) => void;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

export const AnkiImportModal: React.FC<AnkiImportModalProps> = ({ isOpen, decks, onClose, onImportComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [target, setTarget] = useState<string>('new');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // A fresh start every time the dialog opens.
  useEffect(() => {
    if (!isOpen) return;
    setResult(null);
    setError(null);
    setIsLoading(false);
    setTarget('new');
  }, [isOpen]);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setFileName(file.name);
    try {
      const parsed = await parseAnkiFile(file, target === 'new' ? undefined : target);
      if (parsed.cards.length === 0) {
        setError('That file opened, but there were no cards in it. Try exporting the deck again from Anki.');
        sounds.playRating(1);
      } else {
        setResult(parsed);
        sounds.playRating(3);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'That file couldn’t be read. Check that it’s an .apkg, .csv, .tsv or .json file.');
      sounds.playRating(1);
    } finally {
      setIsLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const confirm = () => {
    if (!result) return;
    onImportComplete(result, target === 'new' ? undefined : target);
    sounds.playRating(4);
    onClose();
  };

  const targetName = target === 'new' ? null : decks.find((d) => d.id === target)?.name;
  const sample = result?.cards[0];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      busy={isLoading}
      tint="var(--c-sky)"
      title="Import cards"
      description="Bring in a deck from Anki or a spreadsheet. The file is opened on your device; nothing is uploaded to read it."
      footer={
        result ? (
          <>
            <button className="st-btn st-btn-secondary" onClick={() => setResult(null)}>Choose another file</button>
            <button className="st-btn st-btn-primary" onClick={confirm}>Import {plural(result.summary.cardCount, 'card')}</button>
          </>
        ) : (
          <button className="st-btn st-btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
        )
      }
    >
      {!result && (
        <Field label="Where should the cards go?" htmlFor="import-target">
          <select id="import-target" className="st-text" value={target} onChange={(e) => setTarget(e.target.value)} disabled={isLoading}>
            <option value="new">Into a new deck, named after the file</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>Into “{d.name}”</option>
            ))}
          </select>
        </Field>
      )}

      {!result && !isLoading && (
        <button
          type="button"
          className="st-drop"
          data-over={isDragging}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
          }}
        >
          <Upload size={30} />
          <strong>Choose a file</strong>
          <span>or drop it here · .apkg, .csv, .tsv, .txt or .json</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".apkg,.tsv,.txt,.csv,.json"
        hidden
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />

      {isLoading && (
        <div className="st-drop" style={{ cursor: 'default' }} role="status">
          <span className="st-spinner" />
          <strong>Opening {fileName}…</strong>
          <span>Large decks can take a few seconds.</span>
        </div>
      )}

      {error && (
        <div className="st-alert st-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <>
          <div className="st-alert st-alert-ok" role="status">
            <CheckCircle2 size={20} />
            <span>
              <strong>Found {plural(result.summary.cardCount, 'card')}</strong> in {result.summary.fileName}.{' '}
              {targetName
                ? `They’ll be added to “${targetName}”.`
                : `They’ll go into ${result.decks.length > 1 ? `${result.decks.length} new decks` : `a new deck called “${result.decks[0]?.name || 'Imported deck'}”`}.`}
            </span>
          </div>
          {sample && (
            <div style={{ padding: 16, borderRadius: 18, border: '2px solid var(--st-line)', background: 'var(--c-raised)' }}>
              <p className="st-muted" style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '0.875rem' }}>First card</p>
              <p style={{ margin: 0, fontWeight: 800, overflowWrap: 'anywhere' }}>{sample.front.slice(0, 160)}</p>
              <p className="st-muted" style={{ margin: '4px 0 0', fontWeight: 600, overflowWrap: 'anywhere' }}>{sample.back.slice(0, 200)}</p>
            </div>
          )}
        </>
      )}

      {!result && !isLoading && (
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 800 }}>How do I get an .apkg file from Anki?</summary>
          <ol className="st-steps" style={{ marginTop: 10 }}>
            <li>In Anki on your computer, choose File → Export…</li>
            <li>Pick “Anki Deck Package (*.apkg)” and the deck you want.</li>
            <li>Tick “Include scheduling information” to keep your progress.</li>
            <li>Save the file, then choose it here.</li>
          </ol>
        </details>
      )}
    </Dialog>
  );
};
