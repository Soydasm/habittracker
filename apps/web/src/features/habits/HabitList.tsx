import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, EmptyState } from '../../components';
import { useI18n } from '../../i18n';
import { MAIN_STATE_DAYS, pointsOf, streakOf } from '../../lib/streak';
import { useTheme } from '../../theme';
import { AchievementCard } from '../home';
import { DayStrip } from './DayStrip';
import { HabitCard } from './HabitCard';
import { Tracker } from './Tracker';
import { useHabits } from './useHabits';

export const NEW_HABIT_ROUTE = '/habits/new';
export const habitRoute = (id: string) => `/habits/${id}` as const;

/** What the list shows while the first request runs: three cards' worth of room, so the page does not jump. */
function Loading() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <View testID="home-loading" accessibilityLabel={t('habits.home.loading')} style={{ gap: theme.spacing.cozy }}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={{ height: 60, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, opacity: 0.6 }} />
      ))}
    </View>
  );
}

/** "Alışkanlık silindi": the answer to the delete the user just confirmed, until they leave the screen. */
function Notice({ text, failed, testID = 'home-notice' }: { text: string; failed?: boolean; testID?: string }) {
  const { theme } = useTheme();
  return (
    <View
      testID={testID} accessibilityRole="alert"
      style={{
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.md,
        borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, ...theme.shadow.sm,
      }}
    >
      <Ionicons
        name={failed ? 'alert-circle' : 'checkmark-circle'} size={24}
        color={failed ? theme.colors.danger : theme.colors.success}
      />
      <AppText variant="chip" style={{ flex: 1 }}>{text}</AppText>
    </View>
  );
}

/**
 * The signed-in home: the tracker and the day strip of the design, then one card per habit — or what to do
 * instead while it loads, when it failed, and when there is nothing yet.
 */
export function HabitList() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= theme.breakpoint;
  const habits = useHabits();
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (notice !== 'deleted') return;
    setDeleted(true);
    router.setParams({ notice: '' });
  }, [notice, router]);

  const add = () => router.push(NEW_HABIT_ROUTE);
  const list = habits.data ?? [];
  // From a streak of MAIN_STATE_DAYS the home shows the streak and the next achievement; below it, the habit count.
  const streak = habits.status === 'succeeded' ? streakOf(list, new Date()) : 0;
  const achieved = streak >= MAIN_STATE_DAYS;
  return (
    <>
      <View style={{ marginBottom: theme.spacing.sm }}>
        <Tracker count={habits.status === 'succeeded' ? list.length : null} days={achieved ? streak : undefined} />
      </View>
      {deleted ? <Notice text={t('habits.home.deleted')} /> : null}
      <View style={{ width: '100%', maxWidth: wide ? 760 : 358, alignSelf: 'center', gap: theme.spacing.cozy }}>
        <DayStrip />
        {habits.checkError ? <Notice testID="home-check-error" failed text={t('habits.check.error')} /> : null}
        {habits.status === 'failed' ? (
          <EmptyState
            testID="home-error" icon="alert-circle-outline" title={t('app.error')} body={t('habits.home.error.body')}
            actionTitle={t('app.retry')} onAction={habits.reload} actionTestID="home-retry"
          />
        ) : habits.status !== 'succeeded' ? (
          <Loading />
        ) : list.length === 0 ? (
          <EmptyState
            testID="home-empty" icon="leaf-outline" title={t('habits.home.empty.title')} body={t('habits.home.empty.body')}
            actionTitle={t('habits.home.empty.action')} onAction={add} actionTestID="home-empty-add"
          />
        ) : (
          <>
            <View testID="home-list" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.cozy }}>
              {list.map((habit) => (
                <View key={habit.id} style={{ width: wide ? '49%' : '100%' }}>
                  <HabitCard
                    habit={habit} onPress={() => router.push(habitRoute(habit.id))} onToggle={() => habits.toggle(habit)}
                  />
                </View>
              ))}
            </View>
            {achieved ? <AchievementCard points={pointsOf(streak)} /> : null}
            <Button
              title={t('habits.home.add')} icon="add" onPress={add} testID="home-add"
              style={{ marginTop: theme.spacing.sm, width: '100%', maxWidth: 358, alignSelf: 'center' }}
            />
          </>
        )}
      </View>
    </>
  );
}
