import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';

/** A slim strip above every screen of the demo build. */
export function DemoBanner() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <View testID="demo-banner" accessibilityRole="alert" style={{
      backgroundColor: theme.colors.primaryStrong, paddingTop: insets.top + theme.spacing.xxs,
      paddingBottom: theme.spacing.xxs, paddingHorizontal: theme.spacing.md, alignItems: 'center',
    }}>
      <AppText variant="caption" numberOfLines={1} style={{ color: theme.colors.onPrimary, textAlign: 'center' }}>
        {t('demo.banner')}
      </AppText>
    </View>
  );
}
