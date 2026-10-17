"""The public demo's accounts, in one language: run it again (e.g. every hour) and they are back to this state."""
import random
from datetime import datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.habits import services
from apps.habits.models import Habit, HabitCheck
from apps.users.models import User

PASSWORD = 'demo1234'
DEMO_EMAIL = 'demo@vibekaizen.com'
DEMO_200_EMAIL = 'demo200@vibekaizen.com'
STREAK_200 = 200  # the home screen's "200 days" state and its celebration (MAIN_STATE_DAYS in the web app)

# Each habit: its name per language, how many days ago it was added, how likely a day is marked, whether today
# is already marked, and the run of marked days that ends today (or yesterday while today is open).
DEMO_HABITS = [
    ({'tr': 'Kitap oku (20 sayfa)', 'en': 'Read 20 pages'}, 41, 0.8, True, 12),
    ({'tr': 'Sabah yürüyüşü', 'en': 'Morning walk'}, 38, 0.7, True, 6),
    ({'tr': '2 litre su iç', 'en': 'Drink 2 liters of water'}, 34, 0.85, False, 9),
    ({'tr': '10 dakika meditasyon', 'en': 'Meditate for 10 minutes'}, 27, 0.6, False, 3),
    ({'tr': 'İngilizce kelime çalış', 'en': 'Practice Spanish vocabulary'}, 19, 0.65, True, 4),
]
DEMO_200_HABITS = [
    ({'tr': 'Sabah koşusu', 'en': 'Morning run'}, STREAK_200 - 1, 1.0, True, STREAK_200),
    ({'tr': 'Kitap oku', 'en': 'Read a book'}, 90, 0.75, True, 15),
    ({'tr': 'Şekersiz gün', 'en': 'No sugar today'}, 45, 0.6, False, 5),
]


def _days(today, age, rate, checked_today, run, rng):
    """The days one habit is marked: a run ending today/yesterday, and a realistic scatter before it."""
    last = today if checked_today else today - timedelta(days=1)
    days = {last - timedelta(days=offset) for offset in range(min(run, age + 1))}
    gap = last - timedelta(days=run)  # the day the run starts after stays unmarked, so the streak is exact
    for offset in range(age + 1):
        day = today - timedelta(days=offset)
        if day < gap and rng.random() < rate:
            days.add(day)
    return days


def _seed(email, habits, lang, today):
    User.objects.filter(email__iexact=email).delete()
    user = User.objects.create_user(username=email, email=email, password=PASSWORD)
    rng = random.Random(email)
    # oldest first, so the list (newest first) shows them in the order they were added
    for names, age, rate, checked_today, run in sorted(habits, key=lambda habit: -habit[1]):
        habit = services.create_habit(user, names[lang])
        added = timezone.make_aware(datetime.combine(today - timedelta(days=age), time(9, 0)))
        Habit.objects.filter(pk=habit.pk).update(created_at=added)
        HabitCheck.objects.bulk_create(
            HabitCheck(habit=habit, day=day) for day in sorted(_days(today, age, rate, checked_today, run, rng))
        )
    return user


class Command(BaseCommand):
    help = (
        'Wipes and recreates the public demo accounts in one language: demo@vibekaizen.com (five habits marked '
        'over the last weeks) and demo200@vibekaizen.com (a 200-day streak: the celebration). Safe to run again.'
    )

    def add_arguments(self, parser):
        parser.add_argument('--lang', choices=['tr', 'en'], default='tr', help='Language of the seeded habit names.')

    @transaction.atomic
    def handle(self, *args, **options):
        lang = options['lang']
        today = timezone.localdate()
        _seed(DEMO_EMAIL, DEMO_HABITS, lang, today)
        _seed(DEMO_200_EMAIL, DEMO_200_HABITS, lang, today)
        self.stdout.write(f'Demo data ({lang}) ready:')
        self.stdout.write(f'  {DEMO_EMAIL} / {PASSWORD} — {len(DEMO_HABITS)} habits')
        self.stdout.write(f'  {DEMO_200_EMAIL} / {PASSWORD} — {STREAK_200}-day streak')
