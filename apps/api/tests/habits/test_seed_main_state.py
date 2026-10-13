import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from apps.habits.models import HabitCheck
from apps.users.models import User


@pytest.mark.django_db
def test_seed_main_state_gives_the_design_user_a_200_day_streak_and_is_idempotent():
    call_command('seed_main_state')
    call_command('seed_main_state')
    user = User.objects.get(email='design@example.com')
    client = APIClient()
    client.force_authenticate(user)
    habits = client.get('/api/v1/habits/').json()['data']['results']
    assert len(habits) == 1
    assert habits[0]['streak'] == 200
    assert habits[0]['checked_today'] is True
    assert HabitCheck.objects.filter(habit_id=habits[0]['id']).count() == 200
