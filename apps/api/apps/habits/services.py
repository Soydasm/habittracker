from datetime import timedelta

from django.contrib.postgres.aggregates import ArrayAgg
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone

from .models import Habit, HabitCheck


def _with_check_days(queryset):
    """Each habit carries its checked days (`check_days`) from the same query: a list costs no query per habit."""
    return queryset.annotate(
        check_days=ArrayAgg('checks__day', filter=Q(checks__day__isnull=False), default=[]),
    )


def habits_of(user):
    """The user's own habits, newest first. Every read and write goes through here, so nobody sees another's."""
    return _with_check_days(Habit.objects.filter(owner=user, is_deleted=False)).order_by('-created_at', 'id')


def _days(habit):
    days = getattr(habit, 'check_days', None)
    if days is None:  # a habit that did not come through `habits_of` (just created)
        days = list(habit.checks.values_list('day', flat=True))
    return set(days)


def checked_today(habit):
    return timezone.localdate() in _days(habit)


def streak_of(habit):
    """Consecutive checked days ending today — or ending yesterday while today is still open."""
    days = _days(habit)
    day = timezone.localdate()
    if day not in days:
        day -= timedelta(days=1)
    count = 0
    while day in days:
        count += 1
        day -= timedelta(days=1)
    return count


def check_habit(habit):
    """Marks today as done. Idempotent: a second call (or a racing one) changes nothing. Returns the fresh habit."""
    try:
        with transaction.atomic():
            HabitCheck.objects.create(habit=habit, day=timezone.localdate())
    except IntegrityError:
        pass  # already checked today: the unique (habit, day) pair held, the state is what the caller asked for
    return _fresh(habit)


def uncheck_habit(habit):
    """Takes today's mark back. Idempotent: nothing to take back still answers with the habit."""
    HabitCheck.objects.filter(habit=habit, day=timezone.localdate()).delete()
    return _fresh(habit)


def _fresh(habit):
    return _with_check_days(Habit.objects.filter(pk=habit.pk)).get()


def create_habit(user, name):
    return Habit.objects.create(owner=user, name=name)


def rename_habit(habit, name):
    habit.name = name
    habit.save(update_fields=['name', 'updated_at'])
    return habit


def delete_habit(habit):
    habit.is_deleted = True
    habit.save(update_fields=['is_deleted', 'updated_at'])
