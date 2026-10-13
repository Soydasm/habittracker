import React from 'react';
import { View } from 'react-native';
import { AppText, Card } from '../../components';
import { useI18n } from '../../i18n';
import { NEXT_ACHIEVEMENT_DAYS } from '../../lib/streak';
import { AchievementBadge } from './AchievementBadge';

/** The design's measures: the block is 116 px tall, the badge 25 px from its right edge and 16 from its top, and
 * 17 px of air above it (the list's own gap gives 12). */
const CARD_HEIGHT = 116;
const BADGE_RIGHT = 25;
const BADGE_TOP = 16;
const LIFT = 5;

/**
 * The design's "Next Achievement" block: the goal on two lines, the user's points under it and the badge on the
 * right. The goal is the design's fixed text; only the points follow the streak.
 */
export function AchievementCard({ points }: { points: number }) {
  const { t, tn, format } = useI18n();
  const goal = t('home.achievement.goal', { days: format.number(NEXT_ACHIEVEMENT_DAYS) });
  return (
    <Card
      testID="home-achievement" accessible accessibilityLabel={`${t('home.achievement.title')} ${goal}, ${tn('home.points', points)}`}
      style={{ justifyContent: 'center', gap: 0, minHeight: CARD_HEIGHT, marginTop: LIFT }}
    >
      <View style={{ maxWidth: '60%' }}>
        <AppText testID="home-achievement-title">{t('home.achievement.title')}</AppText>
        <AppText testID="home-achievement-goal">{goal}</AppText>
        <AppText variant="caption" testID="home-achievement-points">{tn('home.points', points)}</AppText>
      </View>
      <View style={{ position: 'absolute', right: BADGE_RIGHT, top: BADGE_TOP }}>
        <AchievementBadge />
      </View>
    </Card>
  );
}
