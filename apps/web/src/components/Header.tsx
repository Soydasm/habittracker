import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { AppText } from './AppText';

/** The design's blurred shade behind the sheet: 43 px in from both sides, blurred by 44 (a deviation of half that). */
const SHADE_INSET = 43;
const SHADE_BLUR = 22;
/** The sheet is 95 px tall in the design: its text starts 36 px down, and the handle sits 2 px above the edge. */
const SHEET_TOP = 27;

/**
 * The design's top sheet (the slide): a white (dark: slate) band with the soft shadow and rounded bottom corners,
 * the title on the left in the violet and an optional note on the right, and the handle line at its lower edge. Its content is capped to the
 * content width of a screen on a desktop. The titleSlot prop replaces the plain title (the shell puts a link there); actionSlot is the right side's controls (the shell puts the sign-in links there).
 */
export function Header({ title, note, titleSlot, actionSlot, testID }: {
  title?: string; note?: string; titleSlot?: React.ReactNode; actionSlot?: React.ReactNode; testID?: string;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const sheet = {
    backgroundColor: theme.colors.surface, borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg, paddingTop: insets.top + SHEET_TOP,
    paddingBottom: theme.spacing.lg, ...theme.shadow.sm,
  };
  const row = {
    width: '100%', maxWidth: theme.maxContentWidth, alignSelf: 'center', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  } as const;
  return (
    <View>
      <View
        style={{
          position: 'absolute', top: 0, bottom: 0, left: SHADE_INSET, right: SHADE_INSET, borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.sheetShade, filter: `blur(${SHADE_BLUR}px)`, pointerEvents: 'none',
        }}
      />
      <View testID={testID} style={sheet}>
        <View style={row}>
          {titleSlot ?? <AppText accessibilityRole="header" style={{ color: theme.colors.primary }}>{title}</AppText>}
          {actionSlot}
          {note ? <AppText variant="small" muted style={{ textAlign: 'right', flexShrink: 1 }}>{note}</AppText> : null}
        </View>
        <View style={{
          position: 'absolute', bottom: theme.spacing.xxs, alignSelf: 'center', width: 54, height: 3,
          borderRadius: theme.radius.pill, backgroundColor: theme.colors.border,
        }} />
      </View>
    </View>
  );
}
