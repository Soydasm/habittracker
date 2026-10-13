import React from 'react';
import { View } from 'react-native';
import { Graphic } from '../../components';
import { useTheme } from '../../theme';
import { BADGE, faceSvg, hexagonSvg, outlineSvg } from './badge';

/**
 * The design's achievement badge (76 × 76): the hexagon, its outline, two blurred lights and the smiling face,
 * each in the box the design gives it. Decorative.
 */
export function AchievementBadge() {
  const { theme } = useTheme();
  const light = (box: { size: number; left: number; top: number }, color: string) => (
    <View
      style={{
        position: 'absolute', left: box.left, top: box.top, width: box.size, height: box.size,
        borderRadius: theme.radius.pill, backgroundColor: color, filter: `blur(${BADGE.blur / 2}px)`,
      }}
    />
  );
  return (
    <View style={{ width: BADGE.size, height: BADGE.size }}>
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
  );
}
