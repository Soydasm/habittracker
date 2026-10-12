import React from 'react';
import { Pressable, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppText, BottomNav, Header, type NavItem } from '../src/components';
import { AuthProvider, HOME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE, SETTINGS_ROUTE, useAuth, useAuthGuard } from '../src/features/auth';
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

/** The way in for a visitor who is not signed in: sign-in and sign-up links on the right of the header. */
function GuestLinks() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const links = [
    { href: LOGIN_ROUTE, label: t('auth.nav.login'), testID: 'app-header-login', color: theme.colors.text },
    { href: REGISTER_ROUTE, label: t('auth.nav.register'), testID: 'app-header-register', color: theme.colors.primary },
  ];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
      {links.map((link) => (
        <Link key={link.href} href={link.href} asChild>
          <Pressable accessibilityRole="link" testID={link.testID} style={{ minHeight: 44, justifyContent: 'center' }}>
            <AppText variant="chip" style={{ color: link.color }}>{link.label}</AppText>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

/** The tabs of a signed-in user. Weekly summary joins when its screen exists. */
const NAV_ITEMS: readonly NavItem[] = [
  { href: HOME_ROUTE, label: 'nav.list', icon: 'list-outline', testID: 'app-nav-list' },
  { href: SETTINGS_ROUTE, label: 'nav.settings', icon: 'settings-outline', testID: 'app-nav-settings' },
];

/** The navigation shell: the header with the app name above every screen, the tabs below when signed in. */
function Shell() {
  const { theme } = useTheme();
  const { status } = useAuth();
  useAuthGuard();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        titleSlot={<AppName />} actionSlot={status === 'signedOut' ? <GuestLinks /> : null} testID="app-header"
      />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
      {status === 'signedIn' ? <BottomNav items={NAV_ITEMS} /> : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <Shell />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
