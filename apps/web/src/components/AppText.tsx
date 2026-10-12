import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme, type Theme } from '../theme';

/** The design's text styles (Jost). Size / weight in the comments. */
export type TextVariant =
  | 'display' // 48 / 400 — the big number
  | 'title' // 30 / 600 — a page title
  | 'heading' // 20 / 500 — a button label, a section heading
  | 'body' // 18 / 400 — card text
  | 'small' // 14 / 400 — secondary lines
  | 'chip' // 14 / 500 — numbers in chips, short emphasised text
  | 'caption' // 13 / 400 — hints, fine print (muted)
  | 'label' // 16 / 400, letter-spaced capitals (muted)
  | 'micro'; // 9 / 400 — the weekday under a chip

function variantStyle(theme: Theme, variant: TextVariant): TextStyle {
  const { font, lineHeight, weight } = theme;
  switch (variant) {
    case 'display': return { fontSize: font.display, lineHeight: lineHeight.display, fontWeight: weight.regular };
    case 'title': return { fontSize: font.xxl, lineHeight: lineHeight.xxl, fontWeight: weight.semibold };
    case 'heading': return { fontSize: font.xl, lineHeight: lineHeight.xl, fontWeight: weight.medium };
    case 'small': return { fontSize: font.sm, lineHeight: lineHeight.sm, fontWeight: weight.regular };
    case 'chip': return { fontSize: font.sm, lineHeight: lineHeight.sm, fontWeight: weight.medium };
    case 'caption': return {
      fontSize: font.xs, lineHeight: lineHeight.xs, fontWeight: weight.regular, color: theme.colors.textMuted,
    };
    case 'label': return {
      fontSize: font.md, lineHeight: lineHeight.md, fontWeight: weight.regular,
      letterSpacing: 2, textTransform: 'uppercase', color: theme.colors.textMuted,
    };
    case 'micro': return { fontSize: font.micro, lineHeight: lineHeight.micro, fontWeight: weight.regular };
    default: return { fontSize: font.lg, lineHeight: lineHeight.lg, fontWeight: weight.regular };
  }
}

/** Every piece of text: one of the design's text styles, in the theme's font and colour. */
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
