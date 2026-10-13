/** The unlocked-badge picture of the design's celebration sheet: sizes are the design's, in px. */
export const ART = {
  width: 198,
  height: 136,
  /** The big badge is the home block's 76 px badge, drawn 122 px wide (the design's "Polygon 1"). */
  badge: { box: 122, scale: 122 / 76, left: 51, top: 14 },
  lock: { size: 30, border: 3, left: 144, top: 98, glyph: 18 },
  /** The soft bubbles around the badge: `strong` ones show the theme's `glowStrong`, `faint` the palest `glow`. */
  bubbles: [
    { size: 23, left: 147, top: 28, strong: false, faint: true },
    { size: 11, left: 187, top: 98, strong: false, faint: false },
    { size: 28, left: 31, top: 0, strong: false, faint: false },
    { size: 6, left: 175, top: 83, strong: true, faint: false },
    { size: 10, left: 184, top: 8, strong: true, faint: false },
    { size: 4, left: 0, top: 54, strong: true, faint: false },
  ],
} as const;

/** Remix "lock 2 line", white. */
export const lockSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M6 8V7a6 6 0 1 1 12 0v1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2zm13 2H5v10h14V10zm-8 5.732a2 2 0 1 1 2 0V18h-2v-2.268zM8 8h8V7a4 4 0 1 0-8 0v1z"/></svg>';

/** The pill's gradient: light at the top right, dark at the bottom left. */
export const pillSvg = (from: string, to: string) =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none">' +
  '<defs><linearGradient id="p" x1="0.85" y1="0" x2="0.25" y2="1">' +
  `<stop offset="0" stop-color="${from}"/><stop offset="0.7" stop-color="${to}"/></linearGradient></defs>` +
  '<rect width="100%" height="100%" fill="url(#p)"/></svg>';
