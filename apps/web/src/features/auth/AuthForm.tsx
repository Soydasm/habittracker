/**
 * The one form behind both the sign-in and the sign-up screen: e-mail + password, field errors under the
 * fields (mirrored in the browser, and mapped from the server's coded errors), a form-level error for a wrong
 * password, and the link to the other screen. On success the shell's guard moves the user on.
 */
import React, { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { ApiError } from '../../api/client';
import { AppText, Button, Card, Input } from '../../components';
import { useI18n, type MessageKey } from '../../i18n';
import { DEMO, DemoCredentials } from '../demo';
import { useTheme } from '../../theme';
import { useAuth } from './AuthContext';
import { LOGIN_ROUTE, REGISTER_ROUTE } from './guard';
import type { FieldError, FieldErrors } from './types';

type Mode = 'login' | 'register';
type Errors = { email?: MessageKey; password?: MessageKey; form?: MessageKey };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const EMAIL_CODES: Record<string, MessageKey> = {
  email_taken: 'auth.error.emailTaken',
  invalid: 'auth.error.emailInvalid',
  required: 'auth.error.emailRequired',
  blank: 'auth.error.emailRequired',
};
const PASSWORD_CODES: Record<string, MessageKey> = {
  min_length: 'auth.error.passwordShort',
  required: 'auth.error.passwordRequired',
  blank: 'auth.error.passwordRequired',
};

const firstCode = (errors?: FieldError[]) => errors?.[0]?.code ?? '';

/** What the browser can check before the request. The server stays the authority. */
function check(mode: Mode, email: string, password: string): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = 'auth.error.emailRequired';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'auth.error.emailInvalid';
  if (!password) errors.password = 'auth.error.passwordRequired';
  else if (mode === 'register' && password.length < MIN_PASSWORD) errors.password = 'auth.error.passwordShort';
  return errors;
}

/** What the server said, as strings of ours. */
function fromServer(cause: unknown): Errors {
  if (!(cause instanceof ApiError)) return { form: 'auth.error.generic' };
  if (cause.status === 401) return { form: 'auth.error.invalidCredentials' };
  if (cause.status === 429) return { form: 'auth.error.tooMany' };
  if (cause.status === 400 && cause.details && typeof cause.details === 'object') {
    const fields = cause.details as FieldErrors;
    const errors: Errors = {};
    if (fields.email) errors.email = EMAIL_CODES[firstCode(fields.email)] ?? 'auth.error.emailInvalid';
    if (fields.password) errors.password = PASSWORD_CODES[firstCode(fields.password)] ?? 'auth.error.passwordShort';
    if (errors.email || errors.password) return errors;
  }
  return { form: 'auth.error.generic' };
}

export function AuthForm({ mode }: { mode: Mode }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const register = mode === 'register';

  const submit = async () => {
    if (busy) return;
    const local = check(mode, email, password);
    if (local.email || local.password) {
      setErrors(local);
      (local.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      await (register ? signUp : signIn)({ email: email.trim(), password });
    } catch (cause) {
      const server = fromServer(cause);
      setErrors(server);
      (server.email ? emailRef : passwordRef).current?.focus();
      setBusy(false);
    }
  };

  const message = (key?: MessageKey) => (key ? t(key) : null);
  return (
    <Card testID={`${mode}-form`} style={{ gap: theme.spacing.md }}>
      {DEMO && !register ? (
        <DemoCredentials onFill={(demoEmail, demoPassword) => {
          setEmail(demoEmail);
          setPassword(demoPassword);
          setErrors({});
        }} />
      ) : null}
      <Input
        label={t('auth.email.label')} placeholder={t('auth.email.placeholder')} value={email}
        onChangeText={setEmail} error={message(errors.email)} inputRef={emailRef} testID={`${mode}-email-input`}
        errorTestID={`${mode}-email-error`} keyboardType="email-address" autoComplete="email"
        autoCapitalize="none" autoCorrect={false} returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <Input
        label={t('auth.password.label')} value={password} onChangeText={setPassword}
        hint={register ? t('auth.password.hint') : undefined} error={message(errors.password)}
        inputRef={passwordRef} testID={`${mode}-password-input`} errorTestID={`${mode}-password-error`}
        secureTextEntry autoComplete={register ? 'new-password' : 'current-password'} autoCapitalize="none"
        returnKeyType="go" onSubmitEditing={submit}
      />
      {errors.form ? (
        <AppText variant="small" accessibilityRole="alert" testID={`${mode}-form-error`}
          style={{ color: theme.colors.danger }}>
          {t(errors.form)}
        </AppText>
      ) : null}
      <Button title={t(register ? 'auth.register.submit' : 'auth.login.submit')} onPress={submit} loading={busy}
        testID={`${mode}-submit`} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.xs }}>
        <AppText variant="small" muted>{t(register ? 'auth.register.switchPrompt' : 'auth.login.switchPrompt')}</AppText>
        <Link href={register ? LOGIN_ROUTE : REGISTER_ROUTE} asChild>
          <Pressable accessibilityRole="link" testID={`${mode}-switch-link`} style={{ minHeight: 24 }}>
            <AppText variant="chip" style={{ color: theme.colors.primary }}>
              {t(register ? 'auth.register.switchLink' : 'auth.login.switchLink')}
            </AppText>
          </Pressable>
        </Link>
      </View>
    </Card>
  );
}
