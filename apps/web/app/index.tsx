/**
 * The example every later screen is modelled on: built from the UI kit (`src/components`), data through `api`,
 * strings through `t`, and all four states (loading, error, empty, content) rendered explicitly.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { api, ApiError } from '../src/api/client';
import { AppText, Button, Card, EmptyState, LanguageSwitcher, Screen } from '../src/components';
import { useI18n } from '../src/i18n';
import { useTheme } from '../src/theme';

type Hello = { message: string; project: string };

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [hello, setHello] = useState<Hello | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHello(await api.get<Hello>('/api/v1/hello/'));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t('home.apiUnreachable'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen title={t('home.title')} actions={<LanguageSwitcher />}>
      <Card testID="hello-card">
        <AppText variant="label">{hello?.project ?? ' '}</AppText>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} testID="hello-loading" />
        ) : error ? (
          <>
            <AppText style={{ color: theme.colors.danger }} testID="hello-error">{error}</AppText>
            <Button title={t('app.retry')} variant="secondary" size="sm" icon="refresh" onPress={() => void load()} />
          </>
        ) : hello ? (
          <AppText variant="heading" testID="hello-message">{hello.message}</AppText>
        ) : (
          <EmptyState title={t('home.empty')} />
        )}
      </Card>
    </Screen>
  );
}
