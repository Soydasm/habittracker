import React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import { useTheme } from '../theme';

/**
 * The design's card: a white (dark: slate) surface, 20 px radius, no border, the soft drop shadow, and its
 * generous padding. Give it `onPress` and it becomes a tappable card (a list item, a tile).
 */
export function Card({ children, onPress, style, ...rest }: ViewProps & { onPress?: () => void }) {
  const { theme } = useTheme();
  const look = {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.md,
    paddingVertical: theme.cardPadding.vertical, paddingHorizontal: theme.cardPadding.horizontal,
    gap: theme.spacing.sm, ...theme.shadow.sm,
  };
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}
        style={({ pressed }) => [look, pressed && { opacity: 0.9 }, style]} {...rest}>
        {children}
      </Pressable>
    );
  }
  return <View style={[look, style]} {...rest}>{children}</View>;
}
