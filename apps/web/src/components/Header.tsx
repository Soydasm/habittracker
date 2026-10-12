import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { AppText } from './AppText';

/**
 * The design's top sheet (the slide): a white (dark: slate) band with the soft shadow and rounded bottom corners,
 * the title on the left in the violet and an optional note on the right. Its content is capped to the
 * content width of a screen on a desktop. The titleSlot prop replaces the plain title (the shell puts a link there).
 */
export function Header({ title, note, titleSlot, testID }: {
  title?: string; note?: string; titleSlot?: React.ReactNode; testID?: string;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const sheet = {
    backgroundColor: theme.colors.surface, borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg, paddingTop: insets.top + theme.spacing.lg,
    paddingBottom: theme.spacing.lg, ...theme.shadow.sm,
  };
  const row = {
    width: '100%', maxWidth: theme.maxContentWidth, alignSelf: 'center', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  } as const;
  return (
    <View testID={testID} style={sheet}>
      <View style={row}>
        {titleSlot ?? <AppText accessibilityRole="header" style={{ color: theme.colors.primary }}>{title}</AppText>}
        {note ? <AppText variant="small" muted style={{ textAlign: 'right', flexShrink: 1 }}>{note}</AppText> : null}
      </View>
    </View>
  );
}
