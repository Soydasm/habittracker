import { defineMessages } from '../define';

export default defineMessages({
  tr: {
    'habits.check.done': 'Yapıldı',
    'habits.check.mark': '{{name}} alışkanlığını bugün için işaretle',
    'habits.check.unmark': '{{name}} alışkanlığının bugünkü işaretini geri al',
    'habits.check.error': 'İşaret kaydedilemedi. Lütfen tekrar dene.',
    'habits.streak.one': '{{count}} gün',
    'habits.streak.other': '{{count}} gün',
  },
  en: {
    'habits.check.done': 'Done',
    'habits.check.mark': 'Mark {{name}} as done today',
    'habits.check.unmark': 'Undo today\'s mark for {{name}}',
    'habits.check.error': 'The mark couldn\'t be saved. Please try again.',
    'habits.streak.one': '{{count}} day',
    'habits.streak.other': '{{count}} days',
  },
});
