import React from 'react';
import { View } from 'react-native';
import { Screen } from '../src/components';
import { AuthForm } from '../src/features/auth';
import { useI18n } from '../src/i18n';

export default function RegisterScreen() {
  const { t } = useI18n();
  return (
    <Screen title={t('auth.register.title')} subtitle={t('auth.register.subtitle')} testID="register-screen">
      <View style={{ width: '100%', maxWidth: 480 }}>
        <AuthForm mode="register" />
      </View>
    </Screen>
  );
}
