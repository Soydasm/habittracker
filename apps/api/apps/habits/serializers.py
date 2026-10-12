from rest_framework import serializers

from . import services
from .models import Habit


class HabitSerializer(serializers.ModelSerializer):
    """The owner is never in the payload: the view takes it from the signed-in user."""
    name = serializers.CharField(max_length=100)  # trims, and refuses blank with the stable code `blank`
    checked_today = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = ('id', 'name', 'created_at', 'checked_today', 'streak')
        read_only_fields = ('id', 'created_at', 'checked_today', 'streak')

    def get_checked_today(self, habit) -> bool:
        return services.checked_today(habit)

    def get_streak(self, habit) -> int:
        return services.streak_of(habit)
