// Colours for components, as CSS variables, so they follow the light or dark theme
// defined in index.css. Use these instead of hex values in TSX.

export const C = {
  ground: 'var(--c-ground)',
  paper: 'var(--c-paper)',
  raised: 'var(--c-raised)',
  ink: 'var(--c-ink)',
  inkSoft: 'var(--c-ink-soft)',
  pink: 'var(--c-pink)',
  pinkSoft: 'var(--c-pink-soft)',
  lilac: 'var(--c-lilac)',
  mint: 'var(--c-mint)',
  butter: 'var(--c-butter)',
  peach: 'var(--c-peach)',
  sky: 'var(--c-sky)',
  oat: 'var(--c-oat)',
  sea: 'var(--c-sea)',
  blush: 'var(--c-blush)',
  ok: 'var(--c-ok)',
} as const;

/** The pastels a deck can be given (stored on the deck as these hex values). */
const PASTEL_TOKENS: Record<string, string> = {
  '#ffd2e5': C.pinkSoft,
  '#d9ccfd': C.lilac,
  '#c9f0dc': C.mint,
  '#fff0b0': C.butter,
  '#ffdcc4': C.peach,
  '#cfe6ff': C.sky,
  '#f3e1d3': C.oat,
  '#d6f2f0': C.sea,
};

/**
 * A stored deck colour as a colour that suits the current theme: one of the palette
 * pastels maps to its token, any other colour is softened towards the background.
 */
export const themedColour = (hex: string) =>
  PASTEL_TOKENS[hex.toLowerCase()] ?? `color-mix(in srgb, ${hex} 32%, var(--c-mix))`;
