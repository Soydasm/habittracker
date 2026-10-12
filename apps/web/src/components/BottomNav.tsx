import React from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n, type MessageKey } from '../i18n';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export type NavItem = { href: string; label: MessageKey; icon: IconName; testID: string };

/**
 * The bottom navigation of a signed-in user, drawn like the design's sheet: the surface band with the soft
 * shadow and rounded top corners. Each tab is an icon with its name; the current one is violet.
 */
export function BottomNav({ items }: { items: readonly NavItem[] }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  return (
    <View
      accessibilityRole="tablist" accessibilityLabel={t('nav.label')} testID="app-nav"
      style={{
        backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg,
        paddingTop: theme.spacing.sm, paddingBottom: insets.bottom + theme.spacing.sm, ...theme.shadow.sm,
      }}
    >
      <View style={{
        width: '100%', maxWidth: theme.maxContentWidth, alignSelf: 'center', flexDirection: 'row',
        justifyContent: 'space-around',
      }}>
        {items.map((item) => {
          const selected = pathname === item.href;
          const ink = selected ? theme.colors.primary : theme.colors.textMuted;
          return (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={t(item.label)}
                testID={item.testID}
                style={{ minHeight: 56, minWidth: 88, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xxs }}
              >
                <Ionicons name={item.icon} size={24} color={ink} />
                <AppText variant="caption" style={{ color: ink }}>{t(item.label)}</AppText>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
