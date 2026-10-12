/**
 * Every user-visible string, number, price and date goes through here. A screen never contains prose and never
 * formats a number itself: `t(key, params)` for text, `tn(key, count)` for "1 item / 3 items", `format.money`,
 * `format.number`, `format.date`, `format.time` for values. The language is the user's saved choice, else the
 * device's, else `DEFAULT_LOCALE`; `LanguageSwitcher` (src/components) changes it.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setApiLocale } from '../api/client';
import { CURRENCY, DEFAULT_LOCALE, LOCALES, type Locale } from './config';
import { messages, type MessageKey } from './messages';

export { CURRENCY, DEFAULT_LOCALE, LOCALE_NAMES, LOCALES, type Locale } from './config';
export type { MessageKey } from './messages';

/** Keys that have plural forms: `cart.items.one` + `cart.items.other` make `cart.items` usable with `tn`. */
export type PluralKey = { [K in MessageKey]: K extends `${infer Base}.other` ? Base : never }[MessageKey];
type Params = Record<string, string | number>;

const STORAGE_KEY = 'app.locale';

function supported(tag: string | undefined | null): Locale | null {
  const base = (tag ?? '').toLowerCase().split(/[-_]/)[0];
  return (LOCALES as readonly string[]).includes(base) ? (base as Locale) : null;
}

function deviceLocale(): Locale {
  const tags = Platform.OS === 'web' && typeof navigator !== 'undefined'
    ? [...(navigator.languages ?? []), navigator.language]
    : [Intl.DateTimeFormat().resolvedOptions().locale];
  for (const tag of tags) {
    const locale = supported(tag);
    if (locale) return locale;
  }
  return DEFAULT_LOCALE;
}

function fill(text: string, params?: Params) {
  if (!params) return text;
  let out = text;
  for (const [name, value] of Object.entries(params)) out = out.split(`{{${name}}}`).join(String(value));
  return out;
}

function makeFormat(locale: Locale) {
  return {
    number: (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options).format(value),
    /** A price. The API sends money as a decimal string ("120.50"); pass it as it came. */
    money: (amount: number | string, currency: string = CURRENCY) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(amount)),
    date: (value: Date | string | number, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
      new Intl.DateTimeFormat(locale, options).format(new Date(value)),
    time: (value: Date | string | number) =>
      new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(new Date(value)),
    dateTime: (value: Date | string | number) =>
      new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)),
  };
}

type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Params) => string;
  tn: (key: PluralKey, count: number, params?: Params) => string;
  format: ReturnType<typeof makeFormat>;
};

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(deviceLocale);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        const choice = supported(saved);
        if (choice) setLocaleState(choice);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setApiLocale(locale);
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: Params) => fill(messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key, params),
    [locale],
  );

  const tn = useCallback(
    (key: PluralKey, count: number, params?: Params) => {
      const form = `${key}.${new Intl.PluralRules(locale).select(count)}` as MessageKey;
      const text = messages[locale][form] ?? messages[locale][`${key}.other` as MessageKey];
      return fill(text ?? key, { count: makeFormat(locale).number(count), ...params });
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, tn, format: makeFormat(locale) }),
    [locale, setLocale, t, tn],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
