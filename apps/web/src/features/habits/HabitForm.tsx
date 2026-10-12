/**
 * The one form behind adding and editing a habit: just the name. The browser checks it first (blank, too
 * long), and a refusal from the server (coded field errors) lands under the same field. `onSubmit` does the
 * request; the form disables itself while it runs so a double click cannot save twice.
 */
import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { ApiError } from '../../api/client';
import { AppText, Button, Card, Input } from '../../components';
import { useI18n, type MessageKey } from '../../i18n';
import { useTheme } from '../../theme';

export const NAME_MAX = 100;

type Errors = { name?: MessageKey; form?: MessageKey };

type FieldErrors = { name?: { code?: string }[] };

function checkName(name: string): Errors {
  if (!name.trim()) return { name: 'habits.error.nameRequired' };
  if (name.trim().length > NAME_MAX) return { name: 'habits.error.nameTooLong' };
  return {};
}

function fromServer(cause: unknown): Errors {
  if (cause instanceof ApiError && cause.status === 400 && cause.details && typeof cause.details === 'object') {
    const code = (cause.details as FieldErrors).name?.[0]?.code;
    if (code === 'max_length') return { name: 'habits.error.nameTooLong' };
    if (code) return { name: 'habits.error.nameRequired' };
  }
  return { form: 'habits.error.generic' };
}

export function HabitForm({ initialName = '', submitTestID, onSubmit, onCancel }: {
  initialName?: string; submitTestID: string; onSubmit: (name: string) => Promise<void>; onCancel: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [name, setName] = useState(initialName);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<TextInput>(null);

  const submit = async () => {
    if (busy) return;
    const local = checkName(name);
    if (local.name) {
      setErrors(local);
      nameRef.current?.focus();
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      await onSubmit(name.trim());
    } catch (cause) {
      const server = fromServer(cause);
      setErrors(server);
      if (server.name) nameRef.current?.focus();
      setBusy(false);
    }
  };

  return (
    <Card testID="habit-form" style={{ gap: theme.spacing.md }}>
      <Input
        label={t('habits.form.name.label')} placeholder={t('habits.form.name.placeholder')} value={name}
        onChangeText={setName} error={errors.name ? t(errors.name) : null} inputRef={nameRef}
        testID="habit-form-name-input" errorTestID="habit-form-name-error" returnKeyType="done"
        onSubmitEditing={submit} autoCapitalize="sentences"
      />
      {errors.form ? (
        <AppText variant="small" accessibilityRole="alert" testID="habit-form-error" style={{ color: theme.colors.danger }}>
          {t(errors.form)}
        </AppText>
      ) : null}
      <View style={{ gap: theme.spacing.sm }}>
        <Button title={t('habits.form.save')} onPress={submit} loading={busy} testID={submitTestID} />
        <Button title={t('habits.form.cancel')} variant="ghost" onPress={onCancel} disabled={busy} testID="habit-form-cancel" />
      </View>
    </Card>
  );
}
