import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { useTheme, type Theme } from '../theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconName = 'arrow-forward' | 'add';

const svgUri = (svg: string) => `data:image/svg+xml;utf8,${svg}`;
const GLYPHS: Record<IconName, string> = {
  'arrow-forward': 'M1 8H15M9 2L15 8L9 14',
  add: 'M8 1V15M1 8H15',
};
/** The design's round icon: a radial gradient disc (`centre` to `edge`) and, in its middle, a 16 px glyph. */
const discSvg = (centre: string, edge: string) =>
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><defs><radialGradient id="d" cx=".5" cy=".58" r=".52">' +
  `<stop offset="0" stop-color="${centre}"/><stop offset=".55" stop-color="${centre}" stop-opacity=".9"/>` +
  `<stop offset="1" stop-color="${edge}"/></radialGradient></defs><circle cx=".5" cy=".5" r=".5" fill="url(#d)"/></svg>`;
const glyphSvg = (name: IconName, ink: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${GLYPHS[name]}" fill="none" stroke="${ink}" ` +
  'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const GLYPH_SIZE = 16;

/**
 * The one button, drawn like the design's "Let's Start!": a full-round pill, 57 px high, the label centred,
 * and — when it has an `icon` — a round accent button inside its right end. A screen has at most one `primary`;
 * everything else is `secondary` or `ghost`. `size="sm"` is the compact 44 px pill.
 */
export const Button = React.forwardRef<View, Omit<PressableProps, 'children'> & {
  title: string; variant?: Variant; size?: 'sm' | 'md'; icon?: IconName; loading?: boolean;
}>(function Button({ title, variant = 'primary', size = 'md', icon, loading, disabled, style, ...rest }, ref) {
  const { theme } = useTheme();
  const s = styles(theme, variant, size, loading ? 'busy' : icon ? 'icon' : 'none');
  const off = disabled || loading;
  const ink = s.label.color as string;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      style={(state) => [s.base, state.pressed && s.pressed, off && s.disabled,
        typeof style === 'function' ? style(state) : style]}
      {...rest}
    >
      <AppText variant={size === 'sm' ? 'chip' : 'heading'} style={s.label} numberOfLines={1}>{title}</AppText>
      {loading ? (
        <View style={s.trailing}><ActivityIndicator size="small" color={ink} /></View>
      ) : icon ? (
        <View style={s.trailing} pointerEvents="none">
          <Image accessible={false} resizeMode="stretch" style={s.disc}
            source={{ uri: svgUri(discSvg(theme.colors.accentCenter, theme.colors.accentEdge)) }} />
          <Image accessible={false} resizeMode="stretch" style={s.glyph}
            source={{ uri: svgUri(glyphSvg(icon, theme.colors.onPrimary)) }} />
        </View>
      ) : null}
    </Pressable>
  );
});

/** The design sets the round icon 5 px inside the pill's edge. */
const ICON_INSET = 5;

function styles(theme: Theme, variant: Variant, size: 'sm' | 'md', trailing: 'none' | 'icon' | 'busy') {
  const { colors, spacing } = theme;
  const fill = { primary: colors.primaryStrong, secondary: colors.surface, ghost: 'transparent', danger: colors.danger }[variant];
  const ink = { primary: colors.onPrimary, secondary: colors.text, ghost: colors.primary, danger: colors.onDanger }[variant];
  const height = size === 'sm' ? 44 : 57;
  const edge = ICON_INSET;
  const circle = height - 2 * edge; // 47 px inside the 57 px pill
  return StyleSheet.create({
    base: {
      minHeight: height,
      paddingHorizontal: trailing !== 'none' ? edge * 2 + circle : size === 'sm' ? spacing.lg : spacing.xl,
      borderRadius: theme.radius.xl,
      backgroundColor: fill,
      alignItems: 'center',
      justifyContent: 'center',
      ...(variant === 'secondary' ? theme.shadow.sm : null),
    },
    label: { color: ink, textAlign: 'center' },
    trailing: {
      position: 'absolute', right: edge, top: edge, width: circle, height: circle, borderRadius: theme.radius.pill,
      alignItems: 'center', justifyContent: 'center',
    },
    disc: { position: 'absolute', top: 0, left: 0, width: circle, height: circle },
    glyph: { width: GLYPH_SIZE, height: GLYPH_SIZE },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
  });
}
