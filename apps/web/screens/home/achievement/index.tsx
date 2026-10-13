import React, { useState } from 'react';
import { useMe } from '../../../src/features/auth';
import { MAIN_STATE_DAYS } from '../../../src/lib/streak';
import { AchievementModal } from './AchievementModal';
import { rememberDismissed, wasDismissed } from './storage';

/**
 * The 200-day celebration for the home screen. It opens over the list when the streak has reached
 * `MAIN_STATE_DAYS` and this user has not closed it on this device yet; closing it is remembered.
 * `streak` is the home screen's own figure (`streakOf`), `null` while the habits are still loading.
 */
export function AchievementUnlocked({ streak }: { streak: number | null }) {
  const { data: user } = useMe();
  const [closed, setClosed] = useState(false);
  if (!user || streak === null || streak < MAIN_STATE_DAYS || closed || wasDismissed(MAIN_STATE_DAYS, user.id)) return null;
  const close = () => {
    rememberDismissed(MAIN_STATE_DAYS, user.id);
    setClosed(true);
  };
  return <AchievementModal days={MAIN_STATE_DAYS} onClose={close} />;
}
