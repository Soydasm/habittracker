/**
 * The home screen: the signed-in user's habit list. A visitor who is not signed in gets the bare page under the
 * shell's header (with its sign-in and sign-up links); the habits are only read for a signed-in user.
 */
import React from 'react';
import { Screen } from '../src/components';
import { useAuth } from '../src/features/auth';
import { HabitList } from '../src/features/habits';

export default function HomeScreen() {
  const { status } = useAuth();
  return <Screen testID="home-screen">{status === 'signedIn' ? <HabitList /> : null}</Screen>;
}
