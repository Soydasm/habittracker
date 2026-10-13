import React from 'react';
import { View } from 'react-native';
import { AppText, Card, Graphic } from '../../components';
import { useI18n } from '../../i18n';
import { NEXT_ACHIEVEMENT_DAYS } from '../../lib/streak';
import { useTheme } from '../../theme';
import { BADGE_SIZE, badgeSvg } from './badge';

/**
 * The design's "Next Achievement" block: the goal on two lines, the user's points under it and the badge on the
 * right. The goal is the design's fixed text; only the points follow the streak.
 */
export function AchievementCard({ points }: { points: number }) {
  const { theme } = useTheme();
  const { t, tn, format } = useI18n();
  const goal = t('home.achievement.goal', { days: format.number(NEXT_ACHIEVEMENT_DAYS) });
  return (
    <Card
      testID="home-achievement" accessible accessibilityLabel={`${t('home.achievement.title')} ${goal}, ${tn('home.points', points)}`}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md, minHeight: 116 }}
    >
      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <AppText testID="home-achievement-title">{t('home.achievement.title')}</AppText>
        <AppText testID="home-achievement-goal">{goal}</AppText>
        <AppText variant="caption" testID="home-achievement-points" style={{ marginTop: theme.spacing.tight }}>
          {tn('home.points', points)}
        </AppText>
      </View>
      <Graphic svg={badgeSvg} width={BADGE_SIZE} height={BADGE_SIZE} />
    </Card>
  );
}
