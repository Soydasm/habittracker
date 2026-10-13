from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.habits.models import Habit, HabitCheck
from apps.users.models import User

EMAIL = 'design@example.com'
PASSWORD = 'correct-horse-9'
HABIT = 'English'
DAYS = 200


class Command(BaseCommand):
    help = (
        'Seeds the design review user (design@example.com) with one habit marked on each of the last 200 days, '
        'today included: the home screen in its "200 days" state. Safe to run again.'
    )

    def handle(self, *args, **options):
        user, _ = User.objects.get_or_create(username=EMAIL, defaults={'email': EMAIL})
        user.set_password(PASSWORD)
        user.save()
        habit = Habit.objects.filter(owner=user, name=HABIT, is_deleted=False).first() or Habit.objects.create(
            owner=user, name=HABIT,
        )
        today = timezone.localdate()
        for offset in range(DAYS):
            HabitCheck.objects.get_or_create(habit=habit, day=today - timedelta(days=offset))
        self.stdout.write(f'{EMAIL}: "{HABIT}" marked on the last {DAYS} days')
