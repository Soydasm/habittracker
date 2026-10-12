import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText, Button, Card, EmptyState, Screen } from '../src/components';
import { useAuth, useMe } from '../src/features/auth';
import { useI18n } from '../src/i18n';
import { useTheme } from '../src/theme';

/** The account card: the e-mail from /auth/me/ in its four states, and the sign-out button. */
function Account() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { signOut } = useAuth();
  const me = useMe();

  if (me.status === 'failed') {
    return (
      <EmptyState testID="settings-error" icon="alert-circle-outline" title={t('app.error')}
        body={me.error ?? undefined} actionTitle={t('app.retry')} onAction={me.reload} />
    );
  }
  return (
    <View style={{ width: '100%', maxWidth: 480, gap: theme.spacing.lg }}>
      <Card testID="settings-account">
        <AppText variant="label">{t('auth.settings.email')}</AppText>
        {me.data ? (
          <AppText variant="heading" testID="settings-email" selectable>{me.data.email}</AppText>
        ) : (
          <ActivityIndicator testID="settings-loading" color={theme.colors.primary} accessibilityLabel={t('app.loading')} />
        )}
      </Card>
      <Button title={t('auth.settings.logout')} variant="secondary" onPress={signOut} testID="settings-logout" />
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useI18n();
  const { status } = useAuth();
  return (
    <Screen title={t('auth.settings.title')} testID="settings-screen">
      {status === 'signedIn' ? <Account /> : null}
    </Screen>
  );
}
