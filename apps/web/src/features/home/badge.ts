/**
 * The achievement badge of the design ("achievement", 76 × 76), in its own layers so each lands in the box the
 * design gives it (offsets are inside the badge): the violet-to-orchid hexagon, its thin white outline, two soft
 * lights (drawn as blurred views in the card, they take the theme's colours) and the smiling face. Each picture is
 * one raw SVG string, drawn as a `Graphic`.
 */
export const BADGE = {
  size: 76,
  outline: { size: 70, offset: 3 },
  cyan: { size: 29, left: 19, top: 31 },
  yellow: { size: 21, left: 34, top: 17 },
  face: { size: 34, offset: 21 },
  /** The design blurs the lights by 13 (a Gaussian's deviation is half of that). */
  blur: 13,
} as const;

const hexagon = (size: number, radius: number) => {
  const c = size / 2;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${(c + radius * Math.cos(angle)).toFixed(2)},${(c + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
};

const svg = (size: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;

/** Rounded corners: the polygon is drawn 4 px inside the box and stroked 8 px wide with round joins. */
export const hexagonSvg = svg(BADGE.size,
  '<defs><linearGradient id="hex" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b6cf6"/>' +
  '<stop offset="1" stop-color="#e98bf3"/></linearGradient></defs>' +
  `<polygon points="${hexagon(BADGE.size, 34)}" fill="url(#hex)" stroke="url(#hex)" stroke-width="8" stroke-linejoin="round"/>`);

export const outlineSvg = svg(BADGE.outline.size,
  `<polygon points="${hexagon(BADGE.outline.size, 31)}" fill="none" stroke="#ffffff" stroke-opacity=".6" ` +
  'stroke-width="1" stroke-linejoin="round"/>');

export const faceSvg = svg(BADGE.face.size,
  '<defs><radialGradient id="face" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#ffe86b"/>' +
  '<stop offset="1" stop-color="#ff9fb0"/></radialGradient></defs>' +
  '<circle cx="17" cy="17" r="17" fill="url(#face)"/>' +
  '<ellipse cx="12" cy="13" rx="2" ry="2.6" fill="#412121"/><ellipse cx="21.5" cy="12" rx="2.3" ry="2.5" fill="#412121"/>' +
  '<path d="M11.5 18.5c2 6 9.5 6 11.5 0z" fill="#412121"/><path d="M14.5 18.5h6.5l-.6 2.6h-5.3z" fill="#ffffff"/>' +
  '<ellipse cx="9" cy="20" rx="2.3" ry="2.6" fill="#fa4542" opacity=".8"/>' +
  '<ellipse cx="25.5" cy="17" rx="2.8" ry="2.5" fill="#fa4542" opacity=".8"/>');
