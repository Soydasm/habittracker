import React from 'react';
import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** What a list shows when there is nothing yet — and what the user can do about it. Never a blank screen. */
export function EmptyState({ icon = 'sparkles-outline', title, body, actionTitle, onAction, testID }: {
  icon?: IconName; title: string; body?: string; actionTitle?: string; onAction?: () => void; testID?: string;
}) {
  const { theme } = useTheme();
  return (
    <View testID={testID} style={{ alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.xl }}>
      <View style={{
        width: 56, height: 56, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceMuted,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={26} color={theme.colors.primary} />
      </View>
      <AppText variant="heading" style={{ textAlign: 'center' }}>{title}</AppText>
      {body ? <AppText variant="small" muted style={{ textAlign: 'center', maxWidth: 420 }}>{body}</AppText> : null}
      {actionTitle && onAction ? <Button title={actionTitle} onPress={onAction} style={{ marginTop: theme.spacing.sm }} /> : null}
    </View>
  );
}
