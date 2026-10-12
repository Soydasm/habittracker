from datetime import timedelta

from django.contrib.postgres.aggregates import ArrayAgg
from django.db import IntegrityError, transaction
from django.db.models import Prefetch, Q
from django.utils import timezone

from .models import Habit, HabitCheck


# The list query carries only the last WINDOW_DAYS of marks; a streak that reaches the window's edge is
# counted again from the full history (see `streak_of`), so long streaks stay exact.
WINDOW_DAYS = 45


def _window_start():
    return timezone.localdate() - timedelta(days=WINDOW_DAYS)


def _with_check_days(queryset):
    """Each habit carries its recently checked days (`check_days`) from the same query: no query per habit."""
    return queryset.annotate(
        check_days=ArrayAgg('checks__day', filter=Q(checks__day__gte=_window_start()), default=[]),
    )


def habits_of(user):
    """The user's own habits, newest first. Every read and write goes through here, so nobody sees another's."""
    return _with_check_days(Habit.objects.filter(owner=user, is_deleted=False)).order_by('-created_at', 'id')


def _all_days(habit):
    return set(habit.checks.values_list('day', flat=True))


def _days(habit):
    days = getattr(habit, 'check_days', None)
    if days is None:  # a habit that did not come through `habits_of` (just created)
        return _all_days(habit)
    return set(days)


def checked_today(habit):
    return timezone.localdate() in _days(habit)


def streak_of(habit):
    """Consecutive checked days ending today — or ending yesterday while today is still open."""
    days = _days(habit)
    count = _run_length(days)
    if count >= WINDOW_DAYS:  # the run may continue before the window: count it from the full history
        count = _run_length(_all_days(habit))
    return count


def _run_length(days):
    day = timezone.localdate()
    if day not in days:
        day -= timedelta(days=1)
    count = 0
    while day in days:
        count += 1
        day -= timedelta(days=1)
    return count


def weekly_summary(user):
    """This week (Monday to Sunday, in the user's calendar): per habit, which of the 7 days are marked.

    Two queries however many habits there are; marks outside the week are never read, so last week's do not count.
    """
    today = timezone.localdate()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    week_checks = HabitCheck.objects.filter(day__range=(monday, sunday))
    habits = (
        Habit.objects.filter(owner=user, is_deleted=False)
        .prefetch_related(Prefetch('checks', queryset=week_checks, to_attr='week_checks'))
        .order_by('-created_at', 'id')
    )
    rows = []
    for habit in habits:
        marked = {check.day for check in habit.week_checks}
        days = [(monday + timedelta(days=offset)) in marked for offset in range(7)]
        rows.append({'id': habit.id, 'name': habit.name, 'days': days, 'done_count': sum(days)})
    return {'week_start': monday, 'week_end': sunday, 'today': today, 'habits': rows}


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
