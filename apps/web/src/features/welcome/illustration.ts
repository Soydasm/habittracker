/**
 * The welcome screen's pictures, one raw SVG string per Figma layer, drawn in the frame's own coordinates
 * ("1.1 Start", 390×844). Every part's `box` is that layer's box in the frame, and its SVG has the same box as its
 * `viewBox`, so a part drawn as an `Image` of exactly that box lands where the design has it. They go to `Image` as
 * `data:image/svg+xml;utf8,` + the raw string: React Native Web encodes it itself.
 */
export type Box = readonly [x: number, y: number, width: number, height: number];
export type Sprite = { id: string; label: string; box: Box; svg: string; blur?: number };

export const STAGE = { width: 390, height: 844 };

const sprite = (id: string, label: string, box: Box, defs: string, body: string, blur?: number): Sprite => ({
  id, label, box, blur,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}"><defs>${defs}</defs>${body}</svg>`,
});

const linear = (id: string, from: string, to: string, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${from}"/>` +
  `<stop offset="1" stop-color="${to}"/></linearGradient>`;

const ellipse = ([x, y, w, h]: Box, fill: string, extra = '') =>
  `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" ${extra}/>`;

/** A heart drawn in the unit square and scaled to its layer's box, turned by `turn` degrees. */
const heart = (id: string, box: Box, turn: number) => {
  const [x, y, w, h] = box;
  return sprite(id, 'heart', box, '',
    `<path transform="translate(${x} ${y}) rotate(${turn} ${w / 2} ${h / 2}) scale(${w} ${h})" fill="#ff3b62" ` +
    'd="M.5 1C.12.72 0 .5 0 .3 0 .1.14 0 .3 0c.1 0 .17.07.2.17C.53.07.6 0 .7 0 .86 0 1 .1 1 .3 1 .5.88.72.5 1Z"/>');
};

const LIGHT_ORANGE: Box = [96, 172, 199, 199];
const LIGHT_GREEN: Box = [96, 381, 111, 144];
const COIN_EDGE: Box = [72, 386, 147, 112];
const COIN_TOP: Box = [80, 355, 144, 127];
const SHADOW: Box = [116, 343, 159, 74];
const FACE: Box = [117, 188, 200, 200];

/** The smiling emoji with the green check coin behind it, over soft orange and green lights, bottom layer first. */
export const SPRITES: readonly Sprite[] = [
  sprite('5:211', 'light', LIGHT_ORANGE, '', ellipse(LIGHT_ORANGE, '#ff9c28'), 55.41 / 2),
  sprite('5:212', 'light', LIGHT_GREEN, '', ellipse(LIGHT_GREEN, '#d5ff8f'), 55.41 / 2),
  sprite('5:205', 'coin edge', COIN_EDGE, linear('e', '#14c98f', '#008a63'), ellipse(COIN_EDGE, 'url(#e)')),
  sprite('5:206', 'coin top', COIN_TOP, linear('t', '#2ff5a8', '#1ddc9b', 1, 1), ellipse(COIN_TOP, 'url(#t)')),
  sprite('5:207', 'coin shine', COIN_TOP,
    '<linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".3"/>' +
    '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>', ellipse(COIN_TOP, 'url(#s)', 'opacity=".7"')),
  sprite('5:208', 'tick', [116, 397, 72, 48], linear('k', '#e4fbff', '#9fe6f2', 1, 1),
    '<polygon fill="url(#k)" opacity=".85" points="116,424 127,413 144,428 177,397 188,408 144,445"/>'),
  sprite('5:209', 'shadow', SHADOW, '', ellipse(SHADOW, '#346d63', 'opacity=".86"'), 48.38 / 2),
  sprite('5:196', 'face', FACE,
    '<radialGradient id="f" cx=".5" cy=".58" r=".52"><stop offset="0" stop-color="#f6a53a"/>' +
    '<stop offset=".55" stop-color="#f9b94b"/><stop offset="1" stop-color="#fdf47f"/></radialGradient>',
    ellipse(FACE, 'url(#f)')),
  heart('5:198', [177, 200, 45, 31], -8),
  heart('5:199', [223, 229, 44, 42], 8),
  sprite('5:200', 'mouth', [141, 229, 102, 91], '',
    '<path fill="#412121" d="M158 230C146 245 140 275 150 302c8 20 35 24 55 16 23-10 39-20 38-33-18-15-53-30-85-55Z"/>'),
  sprite('5:201', 'tongue', [143, 260, 63, 68], '',
    '<path fill="#ff3b62" d="M146 262c9 16 39 23 61 28-12 20-22 38-37 38-18 0-28-28-24-66Z"/>'),
  sprite('5:202', 'teeth', [153, 233, 82, 68], '',
    '<path fill="#ffffff" d="M156 234c34 16 64 34 80 51 2 6-6 12-10 11-26-11-54-28-72-46-4-6-4-12 2-16Z"/>'),
];

/** The first page dot: a ring, 14 px, drawn in the screen's text colour. */
export const ringSvg = (ink: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="none" stroke="${ink}" stroke-width="3"/></svg>`;

/** The backdrop: a vertical gradient between two theme colours, stretched over the whole screen. */
export const backdropSvg = (top: string, bottom: string) =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none">' +
  `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/>` +
  `<stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="1" height="1" fill="url(#g)"/></svg>`;
