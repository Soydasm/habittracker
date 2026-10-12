import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

/** A labelled field with its hint and its error under it. */
export function Input({ label, hint, error, style, onFocus, onBlur, ...rest }:
  TextInputProps & { label?: string; hint?: string; error?: string | null }) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const border = error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? <AppText variant="caption" style={{ color: theme.colors.text, fontWeight: theme.weight.medium }}>{label}</AppText> : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={[StyleSheet.flatten({
          minHeight: 44, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1,
          borderColor: border, backgroundColor: theme.colors.surface, color: theme.colors.text,
          fontSize: theme.font.md, fontFamily: theme.fontFamily,
        }), style]}
        {...rest}
      />
      {error ? <AppText variant="caption" style={{ color: theme.colors.danger }} accessibilityRole="alert">{error}</AppText>
        : hint ? <AppText variant="caption">{hint}</AppText> : null}
    </View>
  );
}
