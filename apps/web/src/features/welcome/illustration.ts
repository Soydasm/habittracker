/**
 * The welcome screen's pictures as raw SVG strings, drawn from the Figma frame "1.1 Start" in the frame's own
 * coordinates (the illustration group sits at 72,172 and is 245×353). They go to `Image` as
 * `data:image/svg+xml;utf8,` + the raw string: React Native Web encodes it itself.
 */

/** Room around the group for the blurred lights, which reach beyond its box. */
export const ILLUSTRATION_PAD = 80;
export const ILLUSTRATION_SIZE = { width: 245, height: 353 };

const heart = (x: number, y: number, w: number, h: number, turn: number) =>
  `<path transform="translate(${x} ${y}) rotate(${turn} ${w / 2} ${h / 2}) scale(${w} ${h})" fill="#ff3b62" ` +
  'd="M.5 1C.12.72 0 .5 0 .3 0 .1.14 0 .3 0c.1 0 .17.07.2.17C.53.07.6 0 .7 0 .86 0 1 .1 1 .3 1 .5.88.72.5 1Z"/>';

/** The smiling emoji with the green check coin behind it, over soft orange and green lights. */
export const ILLUSTRATION_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${72 - ILLUSTRATION_PAD} ${172 - ILLUSTRATION_PAD} ` +
  `${ILLUSTRATION_SIZE.width + 2 * ILLUSTRATION_PAD} ${ILLUSTRATION_SIZE.height + 2 * ILLUSTRATION_PAD}">` +
  '<defs>' +
  '<filter id="b55" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="27.7"/></filter>' +
  '<filter id="b48" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="24.2"/></filter>' +
  '<radialGradient id="face" cx=".5" cy=".58" r=".52">' +
  '<stop offset="0" stop-color="#f6a53a"/><stop offset=".55" stop-color="#f9b94b"/><stop offset="1" stop-color="#fdf47f"/>' +
  '</radialGradient>' +
  '<linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" stop-color="#14c98f"/><stop offset="1" stop-color="#008a63"/></linearGradient>' +
  '<linearGradient id="top" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#2ff5a8"/><stop offset="1" stop-color="#1ddc9b"/></linearGradient>' +
  '<linearGradient id="tick" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#e4fbff"/><stop offset="1" stop-color="#9fe6f2"/></linearGradient>' +
  '</defs>' +
  '<ellipse cx="195.5" cy="271.5" rx="99.5" ry="99.5" fill="#ff9c28" filter="url(#b55)"/>' +
  '<ellipse cx="151.5" cy="453" rx="55.5" ry="72" fill="#d5ff8f" filter="url(#b55)"/>' +
  '<ellipse cx="145.5" cy="442" rx="73.5" ry="56" fill="url(#edge)"/>' +
  '<ellipse cx="152" cy="418.5" rx="72" ry="63.5" fill="url(#top)"/>' +
  '<polyline points="124,418 146,438 181,407" fill="none" stroke="url(#tick)" stroke-width="16" opacity=".85"/>' +
  '<ellipse cx="195.5" cy="380" rx="79.5" ry="37" fill="#346d63" opacity=".86" filter="url(#b48)"/>' +
  '<circle cx="217" cy="288" r="100" fill="url(#face)"/>' +
  heart(177, 200, 45, 31, -8) +
  heart(223, 229, 44, 42, 8) +
  '<path fill="#412121" d="M158 230C146 245 140 275 150 302c8 20 35 24 55 16 23-10 39-20 38-33-18-15-53-30-85-55Z"/>' +
  '<path fill="#ff3b62" d="M146 262c9 16 39 23 61 28-12 20-22 38-37 38-18 0-28-28-24-66Z"/>' +
  '<path fill="#ffffff" d="M156 234c34 16 64 34 80 51 2 6-6 12-10 11-26-11-54-28-72-46-4-6-4-12 2-16Z"/>' +
  '</svg>';

/** The backdrop: a vertical gradient between two theme colours, stretched over the whole screen. */
export const backdropSvg = (top: string, bottom: string) =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none">' +
  `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/>` +
  `<stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="1" height="1" fill="url(#g)"/></svg>`;
