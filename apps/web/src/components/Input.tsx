import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

/**
 * A labelled field with its hint and its error under it. The design draws no field of its own, so it is built
 * from the design's card: the same surface, the 20 px radius and the text styles, with the violet as focus.
 */
export function Input({ label, hint, error, style, onFocus, onBlur, ...rest }:
  TextInputProps & { label?: string; hint?: string; error?: string | null }) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const border = error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? <AppText variant="chip">{label}</AppText> : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textMuted}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={[StyleSheet.flatten({
          minHeight: 57, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radius.md, borderWidth: 1,
          borderColor: border, backgroundColor: theme.colors.surface, color: theme.colors.text,
          fontSize: theme.font.lg, fontWeight: theme.weight.regular, fontFamily: theme.fontFamily,
          outlineStyle: 'none',
        }), style]}
        {...rest}
      />
      {error ? <AppText variant="caption" style={{ color: theme.colors.danger }} accessibilityRole="alert">{error}</AppText>
        : hint ? <AppText variant="caption">{hint}</AppText> : null}
    </View>
  );
}
