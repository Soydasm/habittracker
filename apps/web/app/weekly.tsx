import React from 'react';
import { Screen } from '../src/components';
import { useAuth } from '../src/features/auth';
import { WeeklySummary } from '../src/features/weekly';
import { useI18n } from '../src/i18n';

/** This week's habits, day by day. The data is read once the session is known: a request sent before the saved token is loaded would be refused. */
export default function WeeklyScreen() {
  const { t } = useI18n();
  const { status } = useAuth();
  return (
    <Screen title={t('weekly.title')} subtitle={t('weekly.subtitle')} testID="weekly-screen">
      {status === 'signedIn' ? <WeeklySummary /> : null}
    </Screen>
  );
}
