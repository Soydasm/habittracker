import React from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card, Graphic } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import type { Habit } from './types';

const CIRCLE = 24;

/** The open circle of the design: a 2 px ring fading from the violet (top left) into the magenta (bottom right). */
const ring = (from: string, to: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CIRCLE}" height="${CIRCLE}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><circle cx="12" cy="12" r="9" fill="none" stroke="url(#g)" stroke-width="2"/></svg>`;

/** The done state: the same circle, filled with the same gradient, and a tick in it. */
const filled = (from: string, to: string, tick: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CIRCLE}" height="${CIRCLE}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><circle cx="12" cy="12" r="11" fill="url(#g)"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="${tick}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** The tap target around the circle is 44 px; the circle keeps its 24 px, and the negative margin keeps the card's size. */
const TARGET = 44;

/**
 * One habit as the design's check block: the card with the circle on the left, the name, and the run of days.
 * Pressing the card opens the habit; the circle is its own tap target that marks today (open ring → filled
 * circle with "Yapıldı") and takes the mark back when pressed again.
 */
export function HabitCard({ habit, onPress, onToggle }: { habit: Habit; onPress: () => void; onToggle: () => void }) {
  const { theme } = useTheme();
  const { t, tn } = useI18n();
  const done = habit.checked_today;
  const { primary, tickActive, onPrimary } = theme.colors;
  const inset = (CIRCLE - TARGET) / 2;
  return (
    <Card
      onPress={onPress} testID="habit-card" accessibilityLabel={t('habits.card.open', { name: habit.name })}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md + theme.spacing.xs,
        paddingVertical: theme.spacing.cozy + theme.spacing.xs + theme.spacing.xxs, paddingHorizontal: theme.spacing.lg,
      }}
    >
      <Pressable
        onPress={onToggle} testID="habit-card-check-toggle" accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={t(done ? 'habits.check.unmark' : 'habits.check.mark', { name: habit.name })}
        style={{
          width: TARGET, height: TARGET, alignItems: 'center', justifyContent: 'center',
          marginVertical: inset, marginHorizontal: inset,
        }}
      >
        <View testID="habit-card-check" style={{ width: CIRCLE, height: CIRCLE }}>
          <Graphic
            svg={done ? filled(primary, tickActive, onPrimary) : ring(primary, tickActive)} width={CIRCLE} height={CIRCLE}
          />
        </View>
      </Pressable>
      <AppText style={{ flex: 1 }} testID="habit-card-name">{habit.name}</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        {done ? (
          <AppText variant="chip" style={{ color: primary }} testID="habit-card-done">{t('habits.check.done')}</AppText>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <Ionicons name="flame" size={14} color={habit.streak > 0 ? theme.colors.accent : theme.colors.textMuted} />
          <AppText variant="caption" testID="habit-card-streak">{tn('habits.streak', habit.streak)}</AppText>
        </View>
      </View>
    </Card>
  );
}
