import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { deleteHabit } from './api';

/**
 * The delete control of the habit screen. "Sil" does not delete: it opens the question, and only "Evet, sil"
 * sends the request. A refusal shows under the question and leaves the habit where it is.
 */
export function DeleteHabit({ habitId, onDeleted }: { habitId: string; onDeleted: () => void }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await deleteHabit(habitId);
      onDeleted();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  if (!asking) {
    return <Button title={t('habits.delete.action')} variant="secondary" onPress={() => setAsking(true)} testID="habit-delete" />;
  }
  return (
    <Card testID="habit-delete-confirm" accessibilityRole="alert" style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="heading">{t('habits.delete.confirmTitle')}</AppText>
        <AppText variant="small" muted>{t('habits.delete.confirmBody')}</AppText>
      </View>
      {failed ? (
        <AppText variant="small" accessibilityRole="alert" testID="habit-delete-error" style={{ color: theme.colors.danger }}>
          {t('habits.delete.error')}
        </AppText>
      ) : null}
      <View style={{ gap: theme.spacing.sm }}>
        <Button title={t('habits.delete.confirm')} variant="danger" onPress={confirm} loading={busy} testID="habit-delete-yes" />
        <Button title={t('habits.form.cancel')} variant="ghost" onPress={() => { setAsking(false); setFailed(false); }}
          disabled={busy} testID="habit-delete-no" />
      </View>
    </Card>
  );
}
