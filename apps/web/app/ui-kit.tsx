/**
 * The UI kit on one page, for the people building the app: open /ui-kit (or `vk shot /ui-kit`) to see every
 * component in the current theme. It is not a product screen: nothing in the app links here — no navigation
 * entry, no button on the home screen — and a production build sends the visitor home.
 * When you add a component to the kit, add it here too.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { AppText, Badge, Button, Card, EmptyState, Header, Input, Screen, type TextVariant } from '../src/components';
import { useI18n } from '../src/i18n';
import { useTheme } from '../src/theme';

const VARIANTS: TextVariant[] = ['display', 'title', 'heading', 'body', 'small', 'chip', 'caption', 'label', 'micro'];

export default function UiKitRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <UiKit />;
}

function Section({ title, testID, children }: { title: string; testID: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <Card testID={testID}>
      <AppText variant="label">{title}</AppText>
      <View style={{ gap: theme.spacing.cozy, paddingTop: theme.spacing.xs }}>{children}</View>
    </Card>
  );
}

function UiKit() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const wrap = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.cozy, alignItems: 'center' } as const;
  return (
    <Screen title={t('uiKit.title')} subtitle={t('uiKit.subtitle')} testID="ui-kit">
      <Section title={t('uiKit.colors')} testID="ui-kit-colors">
        <View style={wrap}>
          {Object.entries(theme.colors).map(([name, color]) => (
            <View key={name} style={{ alignItems: 'center', gap: theme.spacing.xxs, width: 72 }}>
              <View
                testID={`ui-kit-swatch-${name}`}
                style={{
                  width: 48, height: 48, borderRadius: theme.radius.pill, backgroundColor: color,
                  borderWidth: 1, borderColor: theme.colors.border,
                }}
              />
              <AppText variant="micro" muted numberOfLines={1}>{name}</AppText>
            </View>
          ))}
        </View>
      </Section>
      <Section title={t('uiKit.text')} testID="ui-kit-text">
        {VARIANTS.map((variant) => (
          <AppText key={variant} variant={variant} testID={`ui-kit-text-${variant}`}>
            {variant === 'display' ? t('uiKit.sampleNumber') : variant === 'label' ? t('uiKit.sampleLabel') : t('uiKit.sample')}
          </AppText>
        ))}
      </Section>
      <Section title={t('uiKit.headers')} testID="ui-kit-headers">
        <AppText variant="title" accessibilityRole="header">{t('uiKit.title')}</AppText>
        <View style={{ marginHorizontal: -theme.cardPadding.horizontal }}>
          <Header title={t('uiKit.headerSample')} note={t('uiKit.headerNote')} testID="ui-kit-header" />
        </View>
      </Section>
      <Section title={t('uiKit.buttons')} testID="ui-kit-buttons">
        <Button title={t('uiKit.start')} icon="arrow-forward" testID="ui-kit-button-primary" />
        <Button title={t('uiKit.sample')} variant="secondary" testID="ui-kit-button-secondary" />
        <Button title={t('uiKit.sample')} variant="ghost" />
        <Button title={t('uiKit.sample')} variant="danger" />
        <View style={wrap}>
          <Button title={t('uiKit.sample')} size="sm" icon="add" />
          <Button title={t('uiKit.sample')} size="sm" loading />
          <Button title={t('uiKit.sample')} size="sm" disabled />
        </View>
      </Section>
      <Section title={t('uiKit.inputs')} testID="ui-kit-inputs">
        <Input label={t('uiKit.sample')} hint={t('uiKit.sampleHint')} value={value} onChangeText={setValue} testID="ui-kit-input" />
        <Input label={t('uiKit.sample')} error={t('uiKit.sampleError')} value="" />
      </Section>
      <Section title={t('uiKit.badges')} testID="ui-kit-badges">
        <View style={wrap}>
          {(['neutral', 'primary', 'success', 'warning', 'danger'] as const).map((tone) => (
            <Badge key={tone} tone={tone} label={t('uiKit.sample')} />
          ))}
        </View>
      </Section>
      <Section title={t('uiKit.cards')} testID="ui-kit-cards">
        <Card testID="ui-kit-card">
          <AppText>{t('uiKit.sampleBody')}</AppText>
          <AppText variant="caption">{t('uiKit.sampleCaption')}</AppText>
        </Card>
        <EmptyState title={t('uiKit.sample')} body={t('uiKit.sampleHint')} />
      </Section>
    </Screen>
  );
}
