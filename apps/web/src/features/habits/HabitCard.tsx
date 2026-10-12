import React from 'react';
import { View } from 'react-native';
import { AppText, Card } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import type { Habit } from './types';

const CIRCLE = 24;

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
      <View
        testID="habit-card-check"
        style={{ width: CIRCLE, height: CIRCLE, borderRadius: theme.radius.pill, borderWidth: 2, borderColor: theme.colors.primary }}
      />
      <AppText style={{ flex: 1 }} testID="habit-card-name">{habit.name}</AppText>
    </Card>
  );
}
