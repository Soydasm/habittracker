import React from 'react';
import { Pressable, View } from 'react-native';
import { LOCALE_NAMES, LOCALES, useI18n } from '../i18n';
import { useTheme } from '../theme';
import { AppText } from './AppText';

/** The user's language, each named in its own words. Renders nothing while the app speaks one language. */
export function LanguageSwitcher({ testID = 'language-switcher' }: { testID?: string }) {
  const { theme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  if (LOCALES.length < 2) return null;
  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('app.language')}
      style={{
        flexDirection: 'row', alignSelf: 'flex-start', gap: theme.spacing.xxs, padding: theme.spacing.xxs,
        borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <Pressable
            key={option}
            testID={`${testID}-${option}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => setLocale(option)}
            style={{
              paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xxs, borderRadius: theme.radius.pill,
              backgroundColor: active ? theme.colors.primary : 'transparent',
            }}
          >
            <AppText style={{
              fontSize: theme.font.sm, fontWeight: theme.weight.semibold,
              color: active ? theme.colors.onPrimary : theme.colors.textMuted,
            }}>
              {LOCALE_NAMES[option]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
