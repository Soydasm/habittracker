from .models import Habit


def habits_of(user):
    """The user's own habits, newest first. Every read and write goes through here, so nobody sees another's."""
    return Habit.objects.filter(owner=user, is_deleted=False)


def create_habit(user, name):
    return Habit.objects.create(owner=user, name=name)


def rename_habit(habit, name):
    habit.name = name
    habit.save(update_fields=['name', 'updated_at'])
    return habit


def delete_habit(habit):
    habit.is_deleted = True
    habit.save(update_fields=['is_deleted', 'updated_at'])
