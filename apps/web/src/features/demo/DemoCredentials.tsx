import React from 'react';
import { View } from 'react-native';
import { AppText, Button } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { DEMO_ACCOUNT } from './config';

/** The demo account on the sign-in form, and a button that types it in. */
export function DemoCredentials({ onFill }: { onFill: (email: string, password: string) => void }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <View testID="demo-credentials" style={{
      gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
    }}>
      <View style={{ gap: theme.spacing.xxs }}>
        <AppText variant="chip">{t('demo.credentials.title')}</AppText>
        <AppText variant="small" selectable testID="demo-credentials-email">{DEMO_ACCOUNT.email}</AppText>
        <AppText variant="small" selectable muted testID="demo-credentials-password">{DEMO_ACCOUNT.password}</AppText>
      </View>
      <Button title={t('demo.credentials.fill')} size="sm" variant="secondary" testID="demo-credentials-fill"
        style={{ alignSelf: 'flex-start' }}
        onPress={() => onFill(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)} />
    </View>
  );
}
