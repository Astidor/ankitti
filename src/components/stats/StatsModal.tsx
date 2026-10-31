import React, { useMemo } from 'react';
import { UserAccount, ReviewLog, Deck, Card } from '../../types/anki';
import { Dialog } from '../studio/Dialog';
import { deckColour } from '../decks/DeckList';

interface StatsModalProps {
  isOpen: boolean;
  isInline?: boolean;
  account: UserAccount;
  decks: Deck[];
  cards: Card[];
  reviewLogs: ReviewLog[];
  onClose: () => void;
}

const DAY = 86_400_000;
const WEEKS = 12;
const MATURE_DAYS = 21;

/** Local calendar date, so a review at 23:30 counts for today, not tomorrow in UTC. */
const dayKey = (t: number | Date) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

const SHADES = ['#fffbf6', '#ffe0ed', '#ffc2dc', '#f06aa6', '#d6307c'];
const shadeFor = (count: number) => (count === 0 ? 0 : count < 5 ? 1 : count < 15 ? 2 : count < 40 ? 3 : 4);

const STAGES = [
  { key: 'new', label: 'Not studied yet', colour: '#d9ccfd' },
  { key: 'learning', label: 'Learning', colour: '#fff0b0' },
  { key: 'young', label: 'Getting there', colour: '#ffc2dc' },
  { key: 'mature', label: `Well known (${MATURE_DAYS}+ days)`, colour: '#c9f0dc' },
] as const;

const stageOf = (c: Card) =>
  c.state === 'new' ? 'new' : c.state === 'learning' || c.state === 'relearning' ? 'learning' : (c.interval || 0) >= MATURE_DAYS ? 'mature' : 'young';

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, isInline = false, account, decks, cards, reviewLogs, onClose }) => {
  const stats = useMemo(() => {
    const now = Date.now();
    const byDay = new Map<string, number>();
    reviewLogs.forEach((r) => byDay.set(dayKey(r.timestamp), (byDay.get(dayKey(r.timestamp)) || 0) + 1));

    // Days in a row, counting back from today (or from yesterday if today has no reviews yet).
    let streak = 0;
    let cursor = new Date();
    if (!byDay.has(dayKey(cursor))) cursor = new Date(now - DAY);
    while (byDay.has(dayKey(cursor))) {
      streak++;
      cursor = new Date(cursor.getTime() - DAY);
    }

    // Heatmap: whole weeks, Monday first, ending with the current week.
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const mondayOffset = (today.getDay() + 6) % 7;
    const start = new Date(today.getTime() - (mondayOffset + (WEEKS - 1) * 7) * DAY);
    const weeks: { key: string; count: number; future: boolean; date: Date }[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start.getTime() + (w * 7 + d) * DAY);
        col.push({ key: dayKey(date), count: byDay.get(dayKey(date)) || 0, future: date > today, date });
      }
      weeks.push(col);
    }
    const windowTotal = weeks.flat().reduce((n, d) => n + d.count, 0);

    const recent = reviewLogs.filter((r) => r.timestamp > now - 30 * DAY);
    const remembered = recent.length ? Math.round((recent.filter((r) => r.rating >= 3).length / recent.length) * 100) : null;

    const stageCounts = { new: 0, learning: 0, young: 0, mature: 0 };
    cards.forEach((c) => stageCounts[stageOf(c)]++);

    const exam = account.examDateSet && account.examDate ? new Date(`${account.examDate}T12:00:00`) : null;
    const examDays = exam && !isNaN(exam.getTime()) ? Math.ceil((exam.getTime() - now) / DAY) : null;

    const perDeck = decks.map((d, i) => {
      const own = cards.filter((c) => c.deckId === d.id);
      const due = own.filter((c) => c.state === 'new' || c.state === 'learning' || c.due <= now).length;
      const mature = own.filter((c) => stageOf(c) === 'mature').length;
      return { deck: d, colour: deckColour(d, i), total: own.length, due, mature };
    });

    return {
      today: byDay.get(dayKey(now)) || 0,
      streak,
      weeks,
      windowTotal,
      remembered,
      recentCount: recent.length,
      stageCounts,
      examDays,
      perDeck,
    };
  }, [reviewLogs, cards, decks, account.examDate, account.examDateSet]);

  if (!isOpen) return null;

  const total = cards.length;
  const body = (
    <div className="st-progress-page">
      <div className="st-head">
        <div>
          <h1 className="st-h1 st-display">Progress</h1>
          <p className="st-sub">How much you’ve studied, and how well it’s sticking.</p>
        </div>
      </div>

      {/* The numbers that answer "am I keeping up?" */}
      <section className="st-figures" aria-label="This week at a glance">
        <div>
          <b className="st-display">{stats.today}</b>
          <span>{stats.today === 1 ? 'review today' : 'reviews today'}</span>
        </div>
        <div>
          <b className="st-display">{stats.streak}</b>
          <span>{stats.streak === 1 ? 'day in a row' : 'days in a row'}</span>
        </div>
        <div>
          <b className="st-display">{stats.remembered === null ? '–' : `${stats.remembered}%`}</b>
          <span>{stats.remembered === null ? 'remembered (no reviews in 30 days)' : 'remembered in the last 30 days'}</span>
        </div>
        {stats.examDays !== null && stats.examDays >= 0 && (
          <div>
            <b className="st-display">{stats.examDays}</b>
            <span>{stats.examDays === 1 ? 'day' : 'days'} until {account.targetExam || 'your exam'}</span>
          </div>
        )}
      </section>
      {stats.remembered !== null && (
        <p className="st-sub" style={{ marginTop: 10 }}>
          Remembering 85–95% of cards is a healthy pace. Much lower? Add fewer new cards for a few days.
        </p>
      )}

      {/* Activity */}
      <section className="st-panel" aria-labelledby="st-activity-h">
        <div className="st-panel-h">
          <h2 id="st-activity-h" className="st-display">Last {WEEKS} weeks</h2>
          <span>{plural(stats.windowTotal, 'review')}</span>
        </div>
        <div className="st-heat-wrap">
          <div className="st-heat-days" aria-hidden="true">
            <span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span /><span>Sun</span>
          </div>
          <div className="st-heat" role="img" aria-label={`Reviews per day over the last ${WEEKS} weeks: ${stats.windowTotal} in total`}>
            {stats.weeks.map((col, w) => (
              <div key={w} className="st-heat-col">
                {col.map((d) => (
                  <span
                    key={d.key}
                    className="st-heat-cell"
                    style={{ background: d.future ? 'transparent' : SHADES[shadeFor(d.count)], borderColor: d.future ? 'transparent' : undefined }}
                    title={d.future ? undefined : `${d.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}: ${plural(d.count, 'review')}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="st-heat-legend" aria-hidden="true">
          <span>None</span>
          {SHADES.map((c) => <span key={c} className="st-heat-cell" style={{ background: c }} />)}
          <span>40+ a day</span>
        </div>
        {stats.windowTotal === 0 && <p className="st-sub">Nothing yet. Each day you review lights up a square.</p>}
      </section>

      {/* Card stages */}
      <section className="st-panel" aria-labelledby="st-stages-h">
        <div className="st-panel-h">
          <h2 id="st-stages-h" className="st-display">How well you know your cards</h2>
          <span>{plural(total, 'card')}</span>
        </div>
        {total > 0 && (
          <div className="st-stack" role="img" aria-label={STAGES.map((s) => `${stats.stageCounts[s.key]} ${s.label}`).join(', ')}>
            {STAGES.map((s) =>
              stats.stageCounts[s.key] > 0 ? (
                <span key={s.key} style={{ flexGrow: stats.stageCounts[s.key], background: s.colour }} />
              ) : null
            )}
          </div>
        )}
        <ul className="st-legend">
          {STAGES.map((s) => (
            <li key={s.key}>
              <span className="st-dot" style={{ background: s.colour }} />
              <b>{stats.stageCounts[s.key].toLocaleString()}</b> {s.label}
            </li>
          ))}
        </ul>
      </section>

      {/* By deck */}
      {stats.perDeck.length > 0 && (
        <section className="st-panel" aria-labelledby="st-decks-h">
          <div className="st-panel-h">
            <h2 id="st-decks-h" className="st-display">By deck</h2>
          </div>
          <table className="st-table">
            <thead>
              <tr>
                <th scope="col">Deck</th>
                <th scope="col">Cards</th>
                <th scope="col">To review</th>
                <th scope="col">Well known</th>
              </tr>
            </thead>
            <tbody>
              {stats.perDeck.map((d) => (
                <tr key={d.deck.id}>
                  <th scope="row">
                    <span className="st-dot" style={{ background: d.colour }} /> {d.deck.name}
                  </th>
                  <td>{d.total.toLocaleString()}</td>
                  <td>{d.due === 0 ? '–' : d.due.toLocaleString()}</td>
                  <td>{d.total === 0 ? '–' : `${Math.round((d.mature / d.total) * 100)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );

  if (isInline) return body;

  return (
    <Dialog open={isOpen} onClose={onClose} size="lg" tint="#c9f0dc" title="Progress">
      {body}
    </Dialog>
  );
};
