/**
 * The UI kit on one page, for the people building the app: open /ui-kit (or `vk shot /ui-kit`) to see every
 * component in the current theme and language. It is not a product screen: nothing in the app links here —
 * no navigation entry, no button on the home screen — and a production build sends the visitor home.
 * When you add a component to the kit, add it here too.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { AppText, Badge, Button, Card, EmptyState, Input, LanguageSwitcher, Screen } from '../src/components';
import { useI18n } from '../src/i18n';
import { useTheme } from '../src/theme';

export default function UiKitRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <UiKit />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <Card>
      <AppText variant="label">{title}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, alignItems: 'center' }}>
        {children}
      </View>
    </Card>
  );
}

function UiKit() {
  const { theme } = useTheme();
  const { t, tn, format } = useI18n();
  const [value, setValue] = useState('');
  return (
    <Screen title={t('uiKit.title')} subtitle={t('uiKit.subtitle')} actions={<LanguageSwitcher />} testID="ui-kit">
      <Section title={t('uiKit.colors')}>
        {Object.entries(theme.colors).map(([name, color]) => (
          <View key={name} style={{ alignItems: 'center', gap: theme.spacing.xxs, width: 88 }}>
            <View style={{
              width: 48, height: 48, borderRadius: theme.radius.md, backgroundColor: color,
              borderWidth: 1, borderColor: theme.colors.border,
            }} />
            <AppText variant="caption">{name}</AppText>
          </View>
        ))}
      </Section>
      <Section title={t('uiKit.text')}>
        <View style={{ gap: theme.spacing.xs }}>
          {(['display', 'title', 'heading', 'body', 'caption', 'label'] as const).map((variant) => (
            <AppText key={variant} variant={variant}>{t('uiKit.sample')}</AppText>
          ))}
        </View>
      </Section>
      <Section title={t('uiKit.buttons')}>
        <Button title={t('uiKit.sample')} />
        <Button title={t('uiKit.sample')} variant="secondary" />
        <Button title={t('uiKit.sample')} variant="ghost" />
        <Button title={t('uiKit.sample')} variant="danger" />
        <Button title={t('uiKit.sample')} size="sm" icon="add" />
        <Button title={t('uiKit.sample')} loading />
        <Button title={t('uiKit.sample')} disabled />
      </Section>
      <Section title={t('uiKit.inputs')}>
        <View style={{ flexGrow: 1, flexBasis: 260, gap: theme.spacing.sm }}>
          <Input label={t('uiKit.sample')} hint={t('uiKit.sampleHint')} value={value} onChangeText={setValue} />
          <Input label={t('uiKit.sample')} error={t('uiKit.sampleError')} value="" />
        </View>
      </Section>
      <Section title={t('uiKit.badges')}>
        {(['neutral', 'primary', 'success', 'warning', 'danger'] as const).map((tone) => (
          <Badge key={tone} tone={tone} label={t('uiKit.sample')} />
        ))}
      </Section>
      <Section title={t('uiKit.cards')}>
        <View style={{ flexGrow: 1, flexBasis: 260 }}>
          <EmptyState title={t('uiKit.sample')} body={t('uiKit.sampleHint')} />
        </View>
      </Section>
      <Section title={t('uiKit.formats')}>
        <View style={{ gap: theme.spacing.xs }}>
          <AppText>{format.money('1249.90')}</AppText>
          <AppText>{format.number(1234567.5)}</AppText>
          <AppText>{format.dateTime(new Date())}</AppText>
          <AppText>{tn('uiKit.sampleItems', 1)} · {tn('uiKit.sampleItems', 3)}</AppText>
        </View>
      </Section>
    </Screen>
  );
}
