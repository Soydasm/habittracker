import React from 'react';
import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import type { WeeklyHabit } from './types';

const DAY = 32;

/** A `YYYY-MM-DD` calendar day as a local date (a bare `new Date('2026-10-12')` would be UTC and can slip a day). */
export const dayOf = (iso: string, offset = 0) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day + offset);
};

/**
 * One habit's week as a card: its name and "3/7" on top, then the seven days Monday to Sunday — a violet circle
 * with a tick for a marked day, an empty ring otherwise. Today's weekday is violet and bold. Pressing the card
 * opens the habit.
 */
export function WeeklyRow({ habit, weekStart, todayIndex, onPress }: {
  habit: WeeklyHabit; weekStart: string; todayIndex: number; onPress: () => void;
}) {
  const { theme } = useTheme();
  const { t, format } = useI18n();
  return (
    <Card
      onPress={onPress} testID="weekly-row" accessibilityLabel={t('weekly.row.open', { name: habit.name })}
      style={{ gap: theme.spacing.md }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <AppText style={{ flex: 1 }} testID="weekly-row-name">{habit.name}</AppText>
        <AppText
          variant="heading" style={{ color: theme.colors.primary }} testID="weekly-row-count"
          accessibilityLabel={t('weekly.count.label', { done: habit.done_count, total: 7 })}
        >
          {t('weekly.count', { done: habit.done_count, total: 7 })}
        </AppText>
      </View>
      <View accessibilityLabel={t('weekly.days.label')} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {habit.days.map((done, index) => {
          const today = index === todayIndex;
          const name = format.date(dayOf(weekStart, index), { weekday: 'short' });
          const full = format.date(dayOf(weekStart, index), { weekday: 'long' });
          const label = t(done ? 'weekly.day.done' : 'weekly.day.open', { day: today ? `${full} (${t('weekly.day.today')})` : full });
          return (
            <View
              key={index} accessible accessibilityLabel={label} testID={today ? 'weekly-day-today' : 'weekly-day'}
              style={{ alignItems: 'center', gap: theme.spacing.xs, flex: 1 }}
            >
              <AppText
                variant="caption" testID="weekly-day-name"
                style={{ color: today ? theme.colors.primary : theme.colors.textMuted, fontWeight: today ? theme.weight.semibold : theme.weight.regular }}
              >
                {name}
              </AppText>
              <View
                testID={done ? 'weekly-day-done' : 'weekly-day-open'}
                style={{
                  width: DAY, height: DAY, borderRadius: theme.radius.circle, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: done ? theme.colors.primary : theme.colors.surfaceMuted,
                  borderWidth: today ? 2 : 0, borderColor: theme.colors.primary,
                }}
              >
                {done ? <Ionicons name="checkmark" size={18} color={theme.colors.onPrimary} /> : null}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
