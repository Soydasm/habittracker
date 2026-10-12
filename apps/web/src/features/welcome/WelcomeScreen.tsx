/**
 * The Start screen (Figma "1.1 Start" and "1.1 Start_dark"): a full-bleed gradient, the illustration, the page
 * dots, the app name with its tagline, the pill button and "Geç" at the top right. It follows the device's
 * light/dark setting through the theme. Only a visitor sees it: the shell's guard sends a signed-in user home,
 * so while the saved sign-in is still being read nothing but the backdrop is drawn.
 */
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AppText, Button } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { LOGIN_ROUTE, REGISTER_ROUTE, useAuth } from '../auth';
import { ILLUSTRATION_PAD, ILLUSTRATION_SIZE, ILLUSTRATION_SVG, backdropSvg } from './illustration';

/** Measures of the Figma frame (390 px wide) that are not spacing tokens. */
const FRAME = { width: 390, side: 59, top: 40, bottom: 46, skipSide: 32, dot: 6, ring: 14, ringLine: 3 };
const svgUri = (svg: string) => `data:image/svg+xml;utf8,${svg}`;

const DOTS = 5;

function PageDots() {
  const { theme } = useTheme();
  const { colors } = theme;
  return (
    <View testID="welcome-dots" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}>
      <View style={{ width: FRAME.ring, height: FRAME.ring, borderRadius: theme.radius.pill,
        borderWidth: FRAME.ringLine, borderColor: colors.welcomeText }} />
      {Array.from({ length: DOTS - 1 }, (_, i) => (
        <View key={i} style={{ width: FRAME.dot, height: FRAME.dot, borderRadius: theme.radius.pill,
          backgroundColor: colors.welcomeDot }} />
      ))}
    </View>
  );
}

export function WelcomeScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { status } = useAuth();
  const { colors, spacing } = theme;
  const backdrop = (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Image accessible={false} source={{ uri: svgUri(backdropSvg(colors.welcomeTop, colors.welcomeBottom)) }}
        resizeMode="stretch" style={{ width: '100%', height: '100%' }} />
    </View>
  );
  if (status !== 'signedOut') {
    return <View testID="welcome-pending" style={{ flex: 1, backgroundColor: colors.welcomeBottom }}>{backdrop}</View>;
  }
  return (
    <View testID="welcome-screen" style={{ flex: 1, backgroundColor: colors.welcomeBottom }}>
      {backdrop}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, width: '100%', maxWidth: FRAME.width, alignSelf: 'center', paddingTop: FRAME.top,
          paddingBottom: FRAME.bottom }}>
          <View style={{ alignItems: 'flex-end', paddingRight: FRAME.skipSide }}>
            <Link href={LOGIN_ROUTE} asChild>
              <Pressable accessibilityRole="link" testID="welcome-skip"
                style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end', marginTop: -12 }}>
                <AppText variant="small" style={{ color: colors.welcomeText }}>{t('welcome.skip')}</AppText>
              </Pressable>
            </Link>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl,
            paddingBottom: spacing.lg }}>
            <View accessibilityRole="image" accessibilityLabel={t('welcome.illustration')} testID="welcome-illustration"
              pointerEvents="none" style={{ width: ILLUSTRATION_SIZE.width, height: ILLUSTRATION_SIZE.height }}>
              <Image accessible={false} source={{ uri: svgUri(ILLUSTRATION_SVG) }} resizeMode="stretch"
                style={{ position: 'absolute', left: -ILLUSTRATION_PAD, top: -ILLUSTRATION_PAD,
                  width: ILLUSTRATION_SIZE.width + 2 * ILLUSTRATION_PAD,
                  height: ILLUSTRATION_SIZE.height + 2 * ILLUSTRATION_PAD }} />
            </View>
          </View>
          <PageDots />
          <View style={{ paddingHorizontal: FRAME.side, marginTop: spacing.md }}>
            <AppText variant="title" accessibilityRole="header" testID="welcome-title" style={{ color: colors.welcomeText }}>
              {t('app.name')}
            </AppText>
            <AppText variant="caption" testID="welcome-tagline" style={{ color: colors.welcomeTextSoft }}>
              {t('welcome.tagline')}
            </AppText>
          </View>
          <View style={{ paddingHorizontal: FRAME.side, marginTop: spacing.xl + 6 }}>
            <Button title={t('welcome.start')} icon="arrow-forward" testID="welcome-start"
              onPress={() => router.push(REGISTER_ROUTE)} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
