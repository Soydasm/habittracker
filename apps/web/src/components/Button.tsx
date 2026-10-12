import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, type Theme } from '../theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * The one button, drawn like the design's "Let's Start!": a full-round pill, 57 px high, the label centred,
 * and — when it has an `icon` — a round accent button inside its right end. A screen has at most one `primary`;
 * everything else is `secondary` or `ghost`. `size="sm"` is the compact 44 px pill.
 */
export function Button({ title, variant = 'primary', size = 'md', icon, loading, disabled, style, ...rest }:
  Omit<PressableProps, 'children'> & {
    title: string; variant?: Variant; size?: 'sm' | 'md'; icon?: IconName; loading?: boolean;
  }) {
  const { theme } = useTheme();
  const s = styles(theme, variant, size, loading ? 'busy' : icon ? 'icon' : 'none');
  const off = disabled || loading;
  const ink = s.label.color as string;
  return (
    <Pressable
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
        <View style={s.trailing}><Ionicons name={icon} size={size === 'sm' ? 18 : 22} color={theme.colors.onPrimary} /></View>
      ) : null}
    </Pressable>
  );
}

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
      backgroundColor: trailing === 'busy' ? 'transparent' : colors.accent, alignItems: 'center', justifyContent: 'center',
    },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
  });
}
