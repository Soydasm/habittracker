from django.conf import settings
from django.db import models

from apps.core.models import AbstractModel


class Habit(AbstractModel):
    """One habit of one user. Soft deleted: `is_deleted` hides it, the row stays (its checks will hang on it)."""
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['owner', 'is_deleted', '-created_at'], name='habit_owner_list_idx')]

    def __str__(self):
        return self.name


class HabitCheck(AbstractModel):
    """Habit done on `day`. Un-checking deletes the row (the one hard delete here), so a plain unique pair is enough."""
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='checks')
    day = models.DateField()

    class Meta:
        ordering = ['-day']
        constraints = [models.UniqueConstraint(fields=['habit', 'day'], name='habitcheck_one_per_day')]

    def __str__(self):
        return f'{self.habit_id} {self.day}'
