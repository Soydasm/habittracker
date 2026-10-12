import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, type Theme } from '../theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** The one button. A screen has at most one `primary`; everything else is `secondary` or `ghost`. */
export function Button({ title, variant = 'primary', size = 'md', icon, loading, disabled, style, ...rest }:
  Omit<PressableProps, 'children'> & {
    title: string; variant?: Variant; size?: 'sm' | 'md'; icon?: IconName; loading?: boolean;
  }) {
  const { theme } = useTheme();
  const s = styles(theme, variant, size);
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      style={(state) => [s.base, state.pressed && s.pressed, off && s.disabled,
        typeof style === 'function' ? style(state) : style]}
      {...rest}
    >
      <View style={s.row}>
        {loading ? <ActivityIndicator size="small" color={s.label.color as string} /> : icon ? (
          <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={s.label.color as string} />
        ) : null}
        <AppText style={s.label}>{title}</AppText>
      </View>
    </Pressable>
  );
}

function styles(theme: Theme, variant: Variant, size: 'sm' | 'md') {
  const { colors } = theme;
  const fill = { primary: colors.primary, secondary: colors.surface, ghost: 'transparent', danger: colors.danger }[variant];
  const ink = { primary: colors.onPrimary, secondary: colors.text, ghost: colors.primary, danger: colors.onDanger }[variant];
  return StyleSheet.create({
    base: {
      minHeight: size === 'sm' ? 36 : 44,
      paddingHorizontal: size === 'sm' ? theme.spacing.md : theme.spacing.lg,
      borderRadius: theme.radius.md,
      backgroundColor: fill,
      borderWidth: variant === 'secondary' ? 1 : 0,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    label: { color: ink, fontSize: size === 'sm' ? theme.font.sm : theme.font.md, fontWeight: theme.weight.semibold },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
  });
}
