import React from 'react';
import { Pressable, View } from 'react-native';
import { LOCALE_NAMES, LOCALES, useI18n } from '../i18n';
import { useTheme } from '../theme';
import { AppText } from './AppText';

/** The language choice: one pill per language of `LOCALES`, the current one filled. The choice is saved. */
export function LanguageSwitcher() {
  const { theme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  return (
    <View testID="language-switcher" accessibilityRole="radiogroup" accessibilityLabel={t('language.label')}
      style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <Pressable key={option} accessibilityRole="radio" accessibilityState={{ selected: active }}
            testID={`language-${option}`} onPress={() => setLocale(option)}
            style={{
              minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.spacing.lg,
              borderRadius: theme.radius.pill,
              backgroundColor: active ? theme.colors.primaryStrong : theme.colors.surfaceMuted,
            }}>
            <AppText variant="chip" style={{ color: active ? theme.colors.onPrimary : theme.colors.text }}>
              {LOCALE_NAMES[option]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
