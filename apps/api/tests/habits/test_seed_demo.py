import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from apps.habits.models import Habit
from apps.users.models import User


def _habits(email):
    client = APIClient()
    client.force_authenticate(User.objects.get(email=email))
    return client.get('/api/v1/habits/').json()['data']['results']


@pytest.mark.django_db
def test_seed_demo_creates_both_accounts_in_the_language_and_resets_them():
    call_command('seed_demo', '--lang', 'en')
    demo = User.objects.get(email='demo@vibekaizen.com')
    Habit.objects.create(owner=demo, name='added by a visitor')
    call_command('seed_demo', '--lang', 'tr')

    assert demo.__class__.objects.filter(email='demo@vibekaizen.com').count() == 1
    assert User.objects.get(email='demo@vibekaizen.com').check_password('demo1234')
    habits = _habits('demo@vibekaizen.com')
    assert len(habits) == 5
    assert 'Sabah yürüyüşü' in [habit['name'] for habit in habits]
    assert all(0 < habit['streak'] < 200 for habit in habits)

    streaks = [habit['streak'] for habit in _habits('demo200@vibekaizen.com')]
    assert max(streaks) == 200


@pytest.mark.django_db
def test_seed_demo_english_names():
    call_command('seed_demo', '--lang', 'en')
    names = [habit['name'] for habit in _habits('demo@vibekaizen.com')]
    assert 'Morning walk' in names
    assert 'Morning run' in [habit['name'] for habit in _habits('demo200@vibekaizen.com')]
