import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme, type Theme } from '../theme';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'caption' | 'label';

function variantStyle(theme: Theme, variant: TextVariant): TextStyle {
  const { font, lineHeight, weight } = theme;
  switch (variant) {
    case 'display': return { fontSize: font.xxl, lineHeight: lineHeight.xxl, fontWeight: weight.bold };
    case 'title': return { fontSize: font.xl, lineHeight: lineHeight.xl, fontWeight: weight.bold };
    case 'heading': return { fontSize: font.lg, lineHeight: lineHeight.lg, fontWeight: weight.semibold };
    case 'caption': return { fontSize: font.sm, lineHeight: lineHeight.sm, color: theme.colors.textMuted };
    case 'label': return {
      fontSize: font.xs, lineHeight: lineHeight.xs, fontWeight: weight.semibold,
      letterSpacing: 0.6, textTransform: 'uppercase', color: theme.colors.textMuted,
    };
    default: return { fontSize: font.md, lineHeight: lineHeight.md };
  }
}

/** Every piece of text: one of six variants, in the theme's font and colour. */
export function AppText({ variant = 'body', muted, style, ...rest }:
  TextProps & { variant?: TextVariant; muted?: boolean }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[{ color: muted ? theme.colors.textMuted : theme.colors.text, fontFamily: theme.fontFamily },
        variantStyle(theme, variant), style]}
      {...rest}
    />
  );
}
