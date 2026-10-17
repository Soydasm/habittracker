/**
 * Which languages the app speaks, which one it falls back to, and the currency its prices are in. The design
 * foundation task sets these from the brief's localization; nothing else in the app names a language or a
 * currency. Adding a language: add it here, then add its strings to every file in `messages/` (TypeScript
 * lists each one that is missing), and add it to `LANGUAGES` in the API settings.
 */
export const LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** The language of a device that speaks none of `LOCALES`. */
export const DEFAULT_LOCALE: Locale = 'en';

/** Each language in its own words, for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = { tr: 'Türkçe', en: 'English' };

/** ISO 4217 code of the currency prices are stored in. */
export const CURRENCY = 'TRY';
