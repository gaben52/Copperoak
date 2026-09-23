// A handful of Acquire Hub's design-system colors, duplicated as plain hex here rather than
// imported from components/shell/styles.js — that file emits a CSS string meant for a <style>
// tag, and email HTML needs the raw values inlined per-element instead. Keep these in sync with
// the --ah-* tokens in components/shell/styles.js if the palette ever changes.
export const ACQUIRE_HUB_EMAIL_COLORS = {
  bg: '#f3f4f7',
  surface: '#ffffff',
  surface2: '#fafbfc',
  border: '#e7e9ee',
  text: '#14171c',
  textSecondary: '#565c66',
  textMuted: '#8a909c',
  // Dark sidebar/header bar — --ah-sidebar-bg / --ah-sidebar-bg-2.
  headerBg: '#12151c',
  headerBg2: '#1b202b',
  headerText: '#9aa1b0',
  // Gold accent — --ah-gold, the lighter shade .ah-btn-gold's gradient uses, and a translucent
  // tint (--ah-gold-soft) for badges/dividers against a light background.
  gold: '#c99a3f',
  goldLight: '#e3bd6e',
  goldText: '#241a06',
  goldSoft: '#f6ecd8',
};
