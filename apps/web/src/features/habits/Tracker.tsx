import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { AppText, Graphic } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';

/** The design's measures, in px: the tracker is 390 wide and 344 tall, its ring 294, the halo 214, the face 194. */
const WIDTH = 390;
const HEIGHT = 344;
const RING = 294;
const RING_TOP = 50;
const HALO = 214;
const FACE = 194;
const TICKS = 100;
const REACHED = 52;
const TICK = { width: 3.5, length: 12 };

/** The soft bubbles of the design: left, top, size, and which glow they use. */
const BUBBLES = [
  { left: 290, top: 54, size: 46, glow: 'faint' },
  { left: 369, top: 193, size: 21, glow: 'soft' },
  { left: 61, top: 0, size: 55, glow: 'soft' },
  { left: 345, top: 163, size: 12, glow: 'strong' },
  { left: 363, top: 15, size: 20, glow: 'strong' },
  { left: 0, top: 106, size: 8, glow: 'strong' },
] as const;

/** The blurred ellipses under the round button: left, top (inside the ring), size, and which colour they use. */
const SHADES = [
  { left: 33, top: 88, size: 153, color: 'haze' },
  { left: 73, top: 128, size: 151, color: 'umbra' },
] as const;
/** The design blurs them by 47 (a Gaussian's deviation is half of that); the picture leaves room for the spread. */
const BLUR = 47;
const SPREAD = BLUR * 2;

const disc = (size: number, fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${fill}"/></svg>`;

const blurredDisc = (size: number, fill: string) => {
  const full = size + SPREAD * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${full}" height="${full}"><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${BLUR / 2}"/></filter><circle cx="${full / 2}" cy="${full / 2}" r="${size / 2}" fill="${fill}" filter="url(#b)"/></svg>`;
};

const channels =(hex: string) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

/** `from` → `to` at `step` (0..1), both `#rrggbb`. */
function mix(from: string, to: string, step: number) {
  const [a, b] = [channels(from), channels(to)];
  return `rgb(${a.map((value, i) => Math.round(value + (b[i] - value) * step)).join(', ')})`;
}

/**
 * The round tracker above the list, drawn from the design: the dashed ring (the first half lit magenta, fading
 * out), the round face in the middle and the soft bubbles around it. The face carries the number of habits.
 */
export function Tracker({ count }: { count: number | null }) {
  const { theme } = useTheme();
  const { t, tn, format } = useI18n();
  const { width } = useWindowDimensions();
  const { colors } = theme;
  const ticks = useMemo(() => Array.from({ length: TICKS }, (_, i) => ({
    angle: (360 / TICKS) * i,
    color: i < REACHED ? mix(colors.tickActive, colors.tickFade, i / REACHED) : colors.tickIdle,
  })), [colors.tickActive, colors.tickFade, colors.tickIdle]);
  const glow = { faint: colors.glow, soft: colors.glow, strong: colors.glowStrong };
  const centred = { position: 'absolute', alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <View
      testID="home-tracker" accessible accessibilityLabel={count === null ? t('habits.home.loading') : tn('habits.count', count)}
      style={{ width: Math.min(WIDTH, width), height: HEIGHT, alignSelf: 'center' }}
    >
      {BUBBLES.map((bubble) => (
        <Graphic
          key={`${bubble.left}-${bubble.top}`} svg={disc(bubble.size, glow[bubble.glow])} width={bubble.size}
          height={bubble.size}
          style={{ position: 'absolute', left: bubble.left, top: bubble.top, opacity: bubble.glow === 'faint' ? 0.4 : 1 }}
        />
      ))}
      <View style={{ position: 'absolute', top: RING_TOP, left: (Math.min(WIDTH, width) - RING) / 2, width: RING, height: RING }}>
        {SHADES.map((shade) => (
          <Graphic
            key={shade.color} svg={blurredDisc(shade.size, colors[shade.color])} width={shade.size + SPREAD * 2}
            height={shade.size + SPREAD * 2}
            style={{ position: 'absolute', left: shade.left - SPREAD, top: shade.top - SPREAD }}
          />
        ))}
        {ticks.map((tick) => (
          <View key={tick.angle} style={{
            position: 'absolute', width: RING, height: RING, alignItems: 'center',
            transform: [{ rotate: `${tick.angle}deg` }],
          }}>
            <View style={{ width: TICK.width, height: TICK.length, borderRadius: TICK.width, backgroundColor: tick.color }} />
          </View>
        ))}
        <View style={[centred, { left: (RING - HALO) / 2, top: (RING - HALO) / 2, width: HALO, height: HALO,
          borderRadius: theme.radius.pill, backgroundColor: colors.discRing }]}>
          <View style={[centred, { position: 'relative', width: FACE, height: FACE, borderRadius: theme.radius.pill,
            backgroundColor: colors.disc }]}>
            <AppText variant="display" testID="home-tracker-count" style={{ textAlign: 'center' }}>
              {count === null ? '–' : format.number(count)}
            </AppText>
            <AppText variant="label" style={{ textAlign: 'center' }}>{t('habits.tracker.label')}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
