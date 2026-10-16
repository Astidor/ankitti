import { Card, DeckSettings } from '../types/anki';

export const DEFAULT_DECK_SETTINGS: DeckSettings = {
  newCardsPerDay: 20,
  reviewsPerDay: 200,
  learningSteps: [1, 10], // 1 min, 10 mins
  graduatingInterval: 1, // 1 day
  easyInterval: 4, // 4 days
  easeBonus: 1.3,
  hardIntervalMultiplier: 1.2,
  intervalModifier: 1.0,
  maximumInterval: 36500, // 100 years
};

export interface SchedulingResult {
  updatedCard: Card;
  intervalPreview: {
    again: string;
    hard: string;
    good: string;
    easy: string;
  };
}

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatIntervalPreview(daysOrMinutes: number, isMinutes: boolean = false): string {
  if (isMinutes) {
    if (daysOrMinutes < 1) return '< 1m';
    if (daysOrMinutes < 60) return `${Math.round(daysOrMinutes)}m`;
    const hours = Math.round(daysOrMinutes / 60);
    return `${hours}h`;
  }

  if (daysOrMinutes < 1) {
    const mins = Math.round(daysOrMinutes * 24 * 60);
    return mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`;
  }
  if (daysOrMinutes === 1) return '1d';
  if (daysOrMinutes < 30) return `${Math.round(daysOrMinutes)}d`;
  if (daysOrMinutes < 365) return `${(daysOrMinutes / 30).toFixed(1)}mo`;
  return `${(daysOrMinutes / 365).toFixed(1)}y`;
}

export function getIntervalPreviews(card: Card, settings: DeckSettings = DEFAULT_DECK_SETTINGS): {
  again: string;
  hard: string;
  good: string;
  easy: string;
} {
  const steps = settings.learningSteps.length > 0 ? settings.learningSteps : [1, 10];

  if (card.state === 'new' || card.state === 'learning' || card.state === 'relearning') {
    const stepIdx = card.stepIndex || 0;
    const againMin = steps[0] || 1;
    const hardMin = stepIdx < steps.length ? Math.max(1, Math.round((steps[stepIdx] + (steps[stepIdx + 1] || steps[stepIdx])) / 2)) : 6;
    
    // Good: next step or graduate
    let goodText = '';
    if (stepIdx + 1 < steps.length) {
      goodText = formatIntervalPreview(steps[stepIdx + 1], true);
    } else {
      goodText = `${settings.graduatingInterval}d`;
    }

    const easyText = `${settings.easyInterval}d`;

    return {
      again: formatIntervalPreview(againMin, true),
      hard: formatIntervalPreview(hardMin, true),
      good: goodText,
      easy: easyText,
    };
  }

  // Card is in 'review' state
  const interval = Math.max(1, card.interval || 1);
  const ease = card.easeFactor || 2.5;

  // Again: drops to learning step 1
  const againText = formatIntervalPreview(steps[0] || 10, true);

  // Hard: interval * 1.2
  const hardDays = Math.min(settings.maximumInterval, Math.max(1, Math.round(interval * settings.hardIntervalMultiplier)));
  
  // Good: interval * ease * modifier
  const goodDays = Math.min(settings.maximumInterval, Math.max(hardDays + 1, Math.round(interval * ease * settings.intervalModifier)));

  // Easy: interval * ease * easeBonus * modifier
  const easyDays = Math.min(settings.maximumInterval, Math.max(goodDays + 1, Math.round(interval * ease * settings.easeBonus * settings.intervalModifier)));

  return {
    again: againText,
    hard: formatIntervalPreview(hardDays),
    good: formatIntervalPreview(goodDays),
    easy: formatIntervalPreview(easyDays),
  };
}

export function answerCard(
  card: Card,
  rating: 1 | 2 | 3 | 4, // 1: Again, 2: Hard, 3: Good, 4: Easy
  settings: DeckSettings = DEFAULT_DECK_SETTINGS,
  now: number = Date.now()
): Card {
  const steps = settings.learningSteps.length > 0 ? settings.learningSteps : [1, 10];
  const updated: Card = { ...card };
  let newEase = updated.easeFactor || 2.5;

  if (updated.state === 'new' || updated.state === 'learning' || updated.state === 'relearning') {
    let currentStep = updated.stepIndex || 0;

    switch (rating) {
      case 1: { // Again
        updated.stepIndex = 0;
        updated.state = 'learning';
        updated.due = now + steps[0] * MINUTE_MS;
        updated.interval = steps[0] / (24 * 60); // fraction of day
        updated.lapses = (updated.lapses || 0) + 1;
        break;
      }
      case 2: { // Hard
        const hardMin = Math.max(1, Math.round((steps[currentStep] + (steps[currentStep + 1] || steps[currentStep])) / 2));
        updated.due = now + hardMin * MINUTE_MS;
        updated.interval = hardMin / (24 * 60);
        break;
      }
      case 3: { // Good
        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
          // Advance to next learning step
          updated.stepIndex = nextStep;
          updated.state = 'learning';
          updated.due = now + steps[nextStep] * MINUTE_MS;
          updated.interval = steps[nextStep] / (24 * 60);
        } else {
          // Graduate to review!
          updated.state = 'review';
          updated.stepIndex = 0;
          updated.interval = settings.graduatingInterval;
          updated.due = now + settings.graduatingInterval * DAY_MS;
          updated.repetitions = (updated.repetitions || 0) + 1;
        }
        break;
      }
      case 4: { // Easy
        // Graduate immediately with easyInterval and bonus ease
        updated.state = 'review';
        updated.stepIndex = 0;
        updated.interval = settings.easyInterval;
        updated.due = now + settings.easyInterval * DAY_MS;
        updated.repetitions = (updated.repetitions || 0) + 1;
        newEase = Math.min(3.5, newEase + 0.15);
        updated.easeFactor = newEase;
        break;
      }
    }

    return updated;
  }

  // REVIEW STATE
  const currentInterval = Math.max(1, updated.interval || 1);

  switch (rating) {
    case 1: { // Again (Lapse)
      newEase = Math.max(1.3, newEase - 0.20);
      updated.easeFactor = newEase;
      updated.lapses = (updated.lapses || 0) + 1;
      updated.state = 'relearning';
      updated.stepIndex = 0;
      updated.due = now + steps[0] * MINUTE_MS;
      updated.interval = steps[0] / (24 * 60);
      break;
    }
    case 2: { // Hard
      newEase = Math.max(1.3, newEase - 0.15);
      updated.easeFactor = newEase;
      const nextInterval = Math.min(
        settings.maximumInterval,
        Math.max(1, Math.round(currentInterval * settings.hardIntervalMultiplier * settings.intervalModifier))
      );
      updated.interval = nextInterval;
      updated.due = now + nextInterval * DAY_MS;
      updated.repetitions = (updated.repetitions || 0) + 1;
      break;
    }
    case 3: { // Good
      const nextInterval = Math.min(
        settings.maximumInterval,
        Math.max(currentInterval + 1, Math.round(currentInterval * newEase * settings.intervalModifier))
      );
      updated.interval = nextInterval;
      updated.due = now + nextInterval * DAY_MS;
      updated.repetitions = (updated.repetitions || 0) + 1;
      break;
    }
    case 4: { // Easy
      newEase = Math.min(3.5, newEase + 0.15);
      updated.easeFactor = newEase;
      const nextInterval = Math.min(
        settings.maximumInterval,
        Math.max(currentInterval + 2, Math.round(currentInterval * newEase * settings.easeBonus * settings.intervalModifier))
      );
      updated.interval = nextInterval;
      updated.due = now + nextInterval * DAY_MS;
      updated.repetitions = (updated.repetitions || 0) + 1;
      break;
    }
  }

  return updated;
}
