import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components';
import { HabitForm, createHabit } from '../../src/features/habits';
import { useI18n } from '../../src/i18n';

/** Add a habit: only its name. Saving goes back to the list, where the new card is on top. */
export default function NewHabitScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const save = async (name: string) => {
    await createHabit(name);
    router.dismissTo('/');
  };
  return (
    <Screen title={t('habits.new.title')} testID="habit-new-screen">
      <View style={{ width: '100%', maxWidth: 480 }}>
        <HabitForm submitTestID="habit-new-submit" onSubmit={save} onCancel={() => router.dismissTo('/')} />
      </View>
    </Screen>
  );
}
