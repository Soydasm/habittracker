/**
 * The Start screen (Figma "1.1 Start" and "1.1 Start_dark"): a full-bleed gradient and, on it, a 390×844 stage laid
 * out exactly like the frame — "Geç" at the top right, the illustration (one image per Figma layer), the page dots,
 * the app name with its tagline and the pill button. It follows the device's light/dark setting through the theme.
 * Only a visitor sees it: the shell's guard sends a signed-in user home, so while the saved sign-in is still being
 * read nothing but the backdrop is drawn.
 */
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AppText, Button } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';
import { LOGIN_ROUTE, REGISTER_ROUTE, useAuth } from '../auth';
import { SPRITES, STAGE, backdropSvg, ringSvg } from './illustration';

/** Measures of the Figma frame (390 px wide) that are not spacing tokens: where each piece sits on the stage. */
const FRAME = {
  side: 59, skip: { right: 32, top: 40 }, dots: { left: 160, top: 587, ring: 14, dot: 6 },
  title: { top: 621, width: 272 }, tagline: { top: 665, width: 270 }, button: { top: 741, width: 271 },
};
const svgUri = (svg: string) => `data:image/svg+xml;utf8,${svg}`;

const DOTS = 5;

function Illustration() {
  const { t } = useI18n();
  return (
    <View accessibilityRole="image" accessibilityLabel={t('welcome.illustration')} testID="welcome-illustration"
      pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: STAGE.width, height: STAGE.height }}>
      {SPRITES.map(({ id, box: [x, y, width, height], svg, blur }) => (
        <View key={id} testID={`welcome-sprite-${id}`}
          style={[{ position: 'absolute', left: x, top: y, width, height }, blur ? { filter: `blur(${blur}px)` } : null]}>
          <Image accessible={false} source={{ uri: svgUri(svg) }} resizeMode="stretch" style={{ width, height }} />
        </View>
      ))}
    </View>
  );
}

function PageDots() {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { ring, dot, left, top } = FRAME.dots;
  return (
    <View testID="welcome-dots" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', left, top, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Image accessible={false} source={{ uri: svgUri(ringSvg(colors.welcomeText)) }} style={{ width: ring, height: ring }} />
      {Array.from({ length: DOTS - 1 }, (_, i) => (
        <View key={i} style={{ width: dot, height: dot, borderRadius: radius.pill, backgroundColor: colors.welcomeDot }} />
      ))}
    </View>
  );
}

export function WelcomeScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { status } = useAuth();
  const { colors } = theme;
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
    <View testID="welcome-screen" style={{ flex: 1, backgroundColor: colors.welcomeBottom, overflow: 'hidden' }}>
      {backdrop}
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
        <View style={{ width: STAGE.width, height: STAGE.height }}>
          <Illustration />
          <PageDots />
          <Link href={LOGIN_ROUTE} asChild>
            <Pressable accessibilityRole="link" testID="welcome-skip" hitSlop={12}
              style={{ position: 'absolute', right: FRAME.skip.right, top: FRAME.skip.top }}>
              <AppText variant="small" style={{ color: colors.welcomeText, textAlign: 'right' }}>{t('welcome.skip')}</AppText>
            </Pressable>
          </Link>
          <AppText variant="title" accessibilityRole="header" testID="welcome-title" numberOfLines={1}
            style={{ position: 'absolute', left: FRAME.side, top: FRAME.title.top, width: FRAME.title.width,
              color: colors.welcomeText }}>
            {t('app.name')}
          </AppText>
          <AppText variant="caption" testID="welcome-tagline"
            style={{ position: 'absolute', left: FRAME.side, top: FRAME.tagline.top, width: FRAME.tagline.width,
              color: colors.welcomeTextSoft }}>
            {t('welcome.tagline')}
          </AppText>
          <View style={{ position: 'absolute', left: FRAME.side, top: FRAME.button.top, width: FRAME.button.width }}>
            <Button title={t('welcome.start')} icon="arrow-forward" testID="welcome-start"
              onPress={() => router.push(REGISTER_ROUTE)} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
