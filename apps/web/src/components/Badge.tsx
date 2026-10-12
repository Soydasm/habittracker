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
      alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.cozy, paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceMuted,
    }}>
      <View style={{ width: theme.spacing.sm, height: theme.spacing.sm, borderRadius: theme.radius.pill, backgroundColor: color }} />
      <AppText variant="chip">{label}</AppText>
    </View>
  );
}
