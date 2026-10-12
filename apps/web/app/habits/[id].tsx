import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyState, Screen } from '../../src/components';
import { useAuth } from '../../src/features/auth';
import { DeleteHabit, HabitForm, renameHabit, useHabit } from '../../src/features/habits';
import { useI18n } from '../../src/i18n';
import { useTheme } from '../../src/theme';

/** The habit itself, read once the session is known: a request sent before the saved token is loaded would be refused. */
function HabitDetail() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabit(id);
  const toList = () => router.dismissTo('/');
  const save = async (name: string) => {
    await renameHabit(id, name);
    toList();
  };

  let body: React.ReactNode;
  if (habit.status === 'failed') {
    body = habit.notFound ? (
      <EmptyState
        testID="habit-notfound" icon="search-outline" title={t('habits.detail.notFound.title')}
        body={t('habits.detail.notFound.body')} actionTitle={t('habits.detail.back')} onAction={toList}
      />
    ) : (
      <EmptyState
        testID="habit-error" icon="alert-circle-outline" title={t('app.error')} body={t('habits.detail.error.body')}
        actionTitle={t('app.retry')} onAction={habit.reload}
      />
    );
  } else if (habit.data === null) {
    body = <ActivityIndicator testID="habit-loading" color={theme.colors.primary} accessibilityLabel={t('app.loading')} />;
  } else {
    body = (
      <View style={{ width: '100%', maxWidth: 480, gap: theme.spacing.lg }}>
        <HabitForm initialName={habit.data.name} submitTestID="habit-edit-submit" onSubmit={save} onCancel={toList} />
        <DeleteHabit habitId={habit.data.id} onDeleted={() => router.dismissTo({ pathname: '/', params: { notice: 'deleted' } })} />
      </View>
    );
  }
  return <>{body}</>;
}

/** One habit: change its name or delete it (after a confirmation). Both go back to the list. */
export default function HabitScreen() {
  const { t } = useI18n();
  const { status } = useAuth();
  return (
    <Screen title={t('habits.edit.title')} testID="habit-detail-screen">
      {status === 'signedIn' ? <HabitDetail /> : null}
    </Screen>
  );
}
