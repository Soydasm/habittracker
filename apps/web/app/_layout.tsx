import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '../src/i18n';
import { ThemeProvider, useTheme } from '../src/theme';

function Routes() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <Routes />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
