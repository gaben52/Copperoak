// A handful of OakFlow's design-system colors, duplicated as plain hex here rather than imported
// from components/design-system.js — that file emits a CSS string meant for a <style> tag, and
// email HTML needs the raw values inlined per-element instead. Keep these in sync with the
// --of-* tokens in components/design-system.js if the palette ever changes.
export const OAKFLOW_EMAIL_COLORS = {
  bg: '#f4f5f7',
  surface: '#ffffff',
  surface2: '#fafbfc',
  border: '#e3e5e8',
  text: '#14171a',
  textSecondary: '#4a5058',
  textMuted: '#7a828c',
  accent: '#1c1f23',
  accentText: '#ffffff',
};
