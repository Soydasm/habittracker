from rest_framework import serializers

from .models import Habit


class HabitSerializer(serializers.ModelSerializer):
    """The owner is never in the payload: the view takes it from the signed-in user."""
    name = serializers.CharField(max_length=100)  # trims, and refuses blank with the stable code `blank`

    class Meta:
        model = Habit
        fields = ('id', 'name', 'created_at')
        read_only_fields = ('id', 'created_at')
