import React from 'react';
import { View } from 'react-native';
import { AppText, Card, Graphic } from '../../components';
import { useI18n } from '../../i18n';
import { NEXT_ACHIEVEMENT_DAYS } from '../../lib/streak';
import { useTheme } from '../../theme';
import { BADGE, faceSvg, hexagonSvg, outlineSvg } from './badge';

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
  const { theme } = useTheme();
  const { t, tn, format } = useI18n();
  const goal = t('home.achievement.goal', { days: format.number(NEXT_ACHIEVEMENT_DAYS) });
  const light = (box: { size: number; left: number; top: number }, color: string) => (
    <View
      style={{
        position: 'absolute', left: box.left, top: box.top, width: box.size, height: box.size,
        borderRadius: theme.radius.pill, backgroundColor: color, filter: `blur(${BADGE.blur / 2}px)`,
      }}
    />
  );
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
      <View style={{ position: 'absolute', right: BADGE_RIGHT, top: BADGE_TOP, width: BADGE.size, height: BADGE.size }}>
        <Graphic svg={hexagonSvg} width={BADGE.size} height={BADGE.size} style={{ position: 'absolute', left: 0, top: 0 }} />
        <View
          style={{
            position: 'absolute', left: BADGE.outline.offset, top: BADGE.outline.offset, width: BADGE.outline.size,
            height: BADGE.outline.size,
          }}
        >
          <Graphic svg={outlineSvg} width={BADGE.outline.size} height={BADGE.outline.size} />
        </View>
        {light(BADGE.cyan, theme.colors.badgeCyan)}
        {light(BADGE.yellow, theme.colors.badgeYellow)}
        <Graphic
          svg={faceSvg} width={BADGE.face.size} height={BADGE.face.size}
          style={{ position: 'absolute', left: BADGE.face.offset, top: BADGE.face.offset }}
        />
      </View>
    </Card>
  );
}
