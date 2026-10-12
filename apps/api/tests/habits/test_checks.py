from datetime import timedelta

import pytest
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.test import APIClient

from apps.habits.models import Habit, HabitCheck
from apps.users.models import User

LIST = '/api/v1/habits/'


def check_url(habit):
    return f'{LIST}{habit.id}/check/'


def uncheck_url(habit):
    return f'{LIST}{habit.id}/uncheck/'


def client_for(user):
    client = APIClient()
    client.force_authenticate(user)
    return client


@pytest.fixture
def ada(db):
    return User.objects.create_user(username='ada@example.com', email='ada@example.com', password='correct-horse')


@pytest.fixture
def bob(db):
    return User.objects.create_user(username='bob@example.com', email='bob@example.com', password='correct-horse')


@pytest.fixture
def habit(ada):
    return Habit.objects.create(owner=ada, name='Kitap oku')


def mark(habit, days_ago):
    return HabitCheck.objects.create(habit=habit, day=timezone.localdate() - timedelta(days=days_ago))


@pytest.mark.django_db
def test_endpoints_reject_anonymous_requests(habit):
    anon = APIClient()
    assert anon.post(check_url(habit)).status_code == 401
    assert anon.post(uncheck_url(habit)).status_code == 401


@pytest.mark.django_db
def test_check_marks_today_and_streak_becomes_one(ada, habit):
    response = client_for(ada).post(check_url(habit))
    assert response.status_code == 200
    data = response.json()['data']
    assert data['id'] == str(habit.id)
    assert data['checked_today'] is True and data['streak'] == 1


@pytest.mark.django_db
def test_check_twice_is_idempotent(ada, habit):
    client = client_for(ada)
    client.post(check_url(habit))
    response = client.post(check_url(habit))
    assert response.status_code == 200
    assert response.json()['data']['streak'] == 1
    assert HabitCheck.objects.filter(habit=habit).count() == 1


@pytest.mark.django_db
def test_database_refuses_a_second_check_for_the_same_day(habit):
    mark(habit, 0)
    with pytest.raises(IntegrityError), transaction.atomic():
        mark(habit, 0)


@pytest.mark.django_db
def test_uncheck_removes_the_mark_and_streak_drops_by_one(ada, habit):
    mark(habit, 1)
    client = client_for(ada)
    assert client.post(check_url(habit)).json()['data']['streak'] == 2
    data = client.post(uncheck_url(habit)).json()['data']
    assert data['checked_today'] is False and data['streak'] == 1


@pytest.mark.django_db
def test_uncheck_without_a_mark_still_answers_200(ada, habit):
    response = client_for(ada).post(uncheck_url(habit))
    assert response.status_code == 200
    assert response.json()['data']['checked_today'] is False


@pytest.mark.django_db
def test_list_shows_two_day_streak_for_yesterday_and_today(ada, habit):
    mark(habit, 1)
    mark(habit, 0)
    item = client_for(ada).get(LIST).json()['data']['results'][0]
    assert item['checked_today'] is True and item['streak'] == 2


@pytest.mark.django_db
def test_streak_counts_from_yesterday_while_today_is_open_and_stops_at_a_gap(ada, habit):
    mark(habit, 1)
    mark(habit, 2)
    mark(habit, 4)
    item = client_for(ada).get(LIST).json()['data']['results'][0]
    assert item['checked_today'] is False and item['streak'] == 2


@pytest.mark.django_db
def test_a_streak_that_ended_before_yesterday_is_zero(ada, habit):
    mark(habit, 2)
    assert client_for(ada).get(LIST).json()['data']['results'][0]['streak'] == 0


@pytest.mark.django_db
def test_another_users_habit_answers_404_and_stays_untouched(bob, habit):
    client = client_for(bob)
    assert client.post(check_url(habit)).status_code == 404
    assert client.post(uncheck_url(habit)).status_code == 404
    assert HabitCheck.objects.count() == 0


@pytest.mark.django_db
def test_checking_does_not_unmark_or_touch_the_past(ada, habit):
    mark(habit, 3)
    client_for(ada).post(uncheck_url(habit))
    assert HabitCheck.objects.filter(habit=habit).count() == 1


@pytest.mark.django_db
def test_list_query_count_does_not_grow_with_habits(ada, django_assert_max_num_queries):
    for index in range(5):
        mark(Habit.objects.create(owner=ada, name=f'Alışkanlık {index}'), 0)
    with django_assert_max_num_queries(5):
        response = client_for(ada).get(LIST)
    assert response.status_code == 200
    assert len(response.json()['data']['results']) == 5


@pytest.mark.django_db
def test_today_follows_the_istanbul_calendar_after_midnight(ada, habit):
    from datetime import date, datetime, timezone as dt_timezone
    from unittest import mock

    just_after_istanbul_midnight = datetime(2026, 10, 11, 22, 30, tzinfo=dt_timezone.utc)  # 01:30 on 12 Oct in Istanbul
    with mock.patch('django.utils.timezone.now', return_value=just_after_istanbul_midnight):
        data = client_for(ada).post(check_url(habit)).json()['data']
    assert data['checked_today'] is True
    assert HabitCheck.objects.get(habit=habit).day == date(2026, 10, 12)


@pytest.mark.django_db
def test_streak_longer_than_the_list_window_stays_exact(ada, habit):
    from apps.habits.services import WINDOW_DAYS

    length = WINDOW_DAYS + 20
    HabitCheck.objects.bulk_create(HabitCheck(habit=habit, day=timezone.localdate() - timedelta(days=n)) for n in range(length))
    item = client_for(ada).get(LIST).json()['data']['results'][0]
    assert item['streak'] == length
