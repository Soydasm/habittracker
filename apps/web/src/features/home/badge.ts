/**
 * The achievement badge of the design ("achievement", 76 × 76): a rounded violet-to-orchid hexagon with a thin
 * white inner outline, two soft lights and a smiling face. One raw SVG string, drawn as a `Graphic`.
 */
export const BADGE_SIZE = 76;

const hexagon = (radius: number) => {
  const c = BADGE_SIZE / 2;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${(c + radius * Math.cos(angle)).toFixed(2)},${(c + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
};

export const badgeSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${BADGE_SIZE}" height="${BADGE_SIZE}" viewBox="0 0 76 76">` +
  '<defs>' +
  '<linearGradient id="hex" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b6cf6"/><stop offset="1" stop-color="#e98bf3"/></linearGradient>' +
  '<radialGradient id="face" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#ffe86b"/><stop offset="1" stop-color="#ff9fb0"/></radialGradient>' +
  '<filter id="soft" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6.5"/></filter>' +
  '</defs>' +
  `<polygon points="${hexagon(34)}" fill="url(#hex)" stroke="url(#hex)" stroke-width="8" stroke-linejoin="round"/>` +
  `<polygon points="${hexagon(32)}" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="1" stroke-linejoin="round"/>` +
  '<circle cx="33.5" cy="40" r="14.5" fill="#1effd6" filter="url(#soft)" opacity=".8"/>' +
  '<circle cx="44" cy="27" r="10.5" fill="#ecff12" filter="url(#soft)" opacity=".8"/>' +
  '<circle cx="38" cy="38" r="17" fill="url(#face)"/>' +
  '<ellipse cx="33" cy="34" rx="2" ry="2.6" fill="#412121"/><ellipse cx="42.5" cy="33" rx="2.3" ry="2.5" fill="#412121"/>' +
  '<path d="M32.5 39.5c2 6 9.5 6 11.5 0z" fill="#412121"/><path d="M35.5 39.5h6.5l-.6 2.6h-5.3z" fill="#ffffff"/>' +
  '<ellipse cx="30" cy="41" rx="2.3" ry="2.6" fill="#fa4542" opacity=".8"/><ellipse cx="46.5" cy="38" rx="2.8" ry="2.5" fill="#fa4542" opacity=".8"/>' +
  '</svg>';
