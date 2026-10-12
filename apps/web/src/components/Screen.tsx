import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

/**
 * The frame of every page: the title, the actions beside it, and the content — centred and capped at
 * `maxContentWidth` on a desktop, edge to edge on a phone. Use it so no page is a stretched phone layout.
 */
export function Screen({ title, subtitle, actions, children, scroll = true, testID }: {
  title?: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; scroll?: boolean;
  testID?: string;
}) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= theme.breakpoint;
  const pad = wide ? theme.spacing.xl : theme.spacing.md;
  const body = (
    <View style={{ width: '100%', maxWidth: theme.maxContentWidth, alignSelf: 'center', padding: pad, gap: theme.spacing.lg }}>
      {title ? (
        <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start',
          justifyContent: 'space-between', gap: theme.spacing.md }}>
          <View style={{ gap: theme.spacing.xs, flexShrink: 1 }}>
            <AppText variant="title" accessibilityRole="header">{title}</AppText>
            {subtitle ? <AppText muted>{subtitle}</AppText> : null}
          </View>
          {actions ? <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>{actions}</View> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
  return (
    <View testID={testID} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{body}</ScrollView> : body}
    </View>
  );
}
