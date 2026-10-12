/**
 * Every feature's strings, merged. A new feature adds its own file next to these (`orders.ts` with
 * `orders.*` keys) and one line to `features` — it never puts its strings into another feature's file, so two
 * tasks building at the same time do not edit the same lines.
 */
import { LOCALES, type Locale } from '../config';
import auth from './auth';
import common from './common';
import habitChecks from './habit-checks';
import habits from './habits';
import nav from './nav';
import uiKit from './uiKit';
import welcome from './welcome';

const features = [
  auth,
  common,
  habitChecks,
  habits,
  nav,
  uiKit,
  welcome,
] as const;

type KeysOf<F> = F extends Record<Locale, Record<infer K, string>> ? K : never;
export type MessageKey = KeysOf<(typeof features)[number]>;

export const messages = Object.fromEntries(
  LOCALES.map((locale) => [locale, Object.assign({}, ...features.map((feature) => feature[locale]))]),
) as Record<Locale, Record<MessageKey, string>>;
