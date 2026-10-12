import React from 'react';
import { View } from 'react-native';
import { AppText, Card, Graphic } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import type { Habit } from './types';

const CIRCLE = 24;

/** The open circle of the design: a 2 px ring fading from the violet (top left) into the magenta (bottom right). */
const ring = (from: string, to: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CIRCLE}" height="${CIRCLE}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><circle cx="12" cy="12" r="9" fill="none" stroke="url(#g)" stroke-width="2"/></svg>`;

/**
 * One habit as the design's check block: the card with the open circle on the left and the name. Pressing the
 * card opens the habit; the circle is its own element, kept apart so the check feature can make it the
 * separate tap target that marks the day.
 */
export function HabitCard({ habit, onPress }: { habit: Habit; onPress: () => void }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <Card
      onPress={onPress} testID="habit-card" accessibilityLabel={t('habits.card.open', { name: habit.name })}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md + theme.spacing.xs,
        paddingVertical: theme.spacing.cozy + theme.spacing.xs + theme.spacing.xxs, paddingHorizontal: theme.spacing.lg,
      }}
    >
      <View testID="habit-card-check" style={{ width: CIRCLE, height: CIRCLE }}>
        <Graphic svg={ring(theme.colors.primary, theme.colors.tickActive)} width={CIRCLE} height={CIRCLE} />
      </View>
      <AppText style={{ flex: 1 }} testID="habit-card-name">{habit.name}</AppText>
    </Card>
  );
}
