import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

/** A short status word ("Bekliyor", "Onaylandı") in its tone's colour. */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { theme } = useTheme();
  const color = tone === 'neutral' ? theme.colors.textMuted : theme.colors[tone];
  return (
    <View style={{
      alignSelf: 'flex-start', paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xxs,
      borderRadius: theme.radius.pill, borderWidth: 1, borderColor: color,
    }}>
      <AppText style={{ color, fontSize: theme.font.xs, fontWeight: theme.weight.semibold }}>{label}</AppText>
    </View>
  );
}
