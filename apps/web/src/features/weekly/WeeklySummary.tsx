import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { EmptyState } from '../../components';
import { HOME_ROUTE } from '../auth';
import { habitRoute } from '../habits';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { useWeeklySummary } from './useWeeklySummary';
import { WeeklyRow, dayOf } from './WeeklyRow';

/** What the screen shows while the first request runs: three cards' worth of room, so the page does not jump. */
function Loading() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <View testID="weekly-loading" accessibilityLabel={t('weekly.loading')} style={{ gap: theme.spacing.cozy }}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={{ height: 110, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, opacity: 0.6 }} />
      ))}
    </View>
  );
}

/** The body of the weekly screen: one card per habit — or what to do instead while it loads, when it failed, and when there is nothing yet. */
export function WeeklySummary() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= theme.breakpoint;
  const summary = useWeeklySummary();

  if (summary.status === 'failed') {
    return (
      <EmptyState
        testID="weekly-error" icon="alert-circle-outline" title={t('app.error')} body={t('weekly.error.body')}
        actionTitle={t('app.retry')} onAction={summary.reload} actionTestID="weekly-retry"
      />
    );
  }
  if (summary.data === null) return <Loading />;
  const { habits, week_start: weekStart, today } = summary.data;
  if (habits.length === 0) {
    return (
      <EmptyState
        testID="weekly-empty" icon="calendar-outline" title={t('weekly.empty.title')} body={t('weekly.empty.body')}
        actionTitle={t('weekly.empty.action')} onAction={() => router.dismissTo(HOME_ROUTE)} actionTestID="weekly-empty-list"
      />
    );
  }
  const todayIndex = Math.round((dayOf(today).getTime() - dayOf(weekStart).getTime()) / 86_400_000);
  return (
    <View testID="weekly-list" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.cozy }}>
      {habits.map((habit) => (
        <View key={habit.id} style={{ width: wide ? '49%' : '100%' }}>
          <WeeklyRow
            habit={habit} weekStart={weekStart} todayIndex={todayIndex} onPress={() => router.push(habitRoute(habit.id))}
          />
        </View>
      ))}
    </View>
  );
}
