import React from 'react';
import { Pressable, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppText, Header } from '../src/components';
import { I18nProvider, useI18n } from '../src/i18n';
import { ThemeProvider, useTheme } from '../src/theme';

/** The app name in the header; it takes the user back to the home screen. */
function AppName() {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <Link href="/" asChild>
      <Pressable accessibilityRole="link" testID="app-header-name" style={{ minHeight: 44, justifyContent: 'center' }}>
        <AppText accessibilityRole="header" style={{ color: theme.colors.primary }}>{t('app.name')}</AppText>
      </Pressable>
    </Link>
  );
}

/** The navigation shell: the header with the app name above every screen. */
function Shell() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header titleSlot={<AppName />} testID="app-header" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <Shell />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
