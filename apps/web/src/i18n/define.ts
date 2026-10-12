import type { Locale } from './config';

/**
 * One feature's strings in every language. TypeScript rejects the file when a language misses a key the
 * others have, so a string cannot exist in Turkish only.
 */
export function defineMessages<K extends string>(messages: Record<Locale, Record<K, string>>) {
  return messages;
}
