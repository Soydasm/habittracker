from datetime import date, datetime, timezone as dt_timezone
from unittest import mock

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.habits.models import Habit, HabitCheck
from apps.users.models import User

URL = '/api/v1/habits/weekly-summary/'

# Wednesday 14 Oct 2026, noon in Istanbul: the week is Mon 12 – Sun 18 Oct.
WEDNESDAY = datetime(2026, 10, 14, 9, 0, tzinfo=dt_timezone.utc)


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


def mark(habit, day):
    return HabitCheck.objects.create(habit=habit, day=day)


@pytest.fixture
def wednesday():
    with mock.patch('django.utils.timezone.now', return_value=WEDNESDAY):
        yield


@pytest.mark.django_db
def test_endpoint_rejects_anonymous_requests():
    assert APIClient().get(URL).status_code == 401


@pytest.mark.django_db
def test_three_marked_days_give_a_count_of_three_and_three_true_days(ada, wednesday):
    habit = Habit.objects.create(owner=ada, name='Kitap oku')
    for day in (date(2026, 10, 12), date(2026, 10, 14), date(2026, 10, 17)):
        mark(habit, day)
    response = client_for(ada).get(URL)
    assert response.status_code == 200
    data = response.json()['data']
    assert (data['week_start'], data['week_end'], data['today']) == ('2026-10-12', '2026-10-18', '2026-10-14')
    [row] = data['habits']
    assert row['name'] == 'Kitap oku' and row['done_count'] == 3
    assert row['days'] == [True, False, True, False, False, True, False]


@pytest.mark.django_db
def test_last_weeks_marks_are_not_counted(ada, wednesday):
    habit = Habit.objects.create(owner=ada, name='Kitap oku')
    mark(habit, date(2026, 10, 11))  # Sunday of last week
    mark(habit, date(2026, 10, 5))
    mark(habit, date(2026, 10, 12))
    [row] = client_for(ada).get(URL).json()['data']['habits']
    assert row['done_count'] == 1
    assert row['days'][0] is True and row['days'].count(True) == 1


@pytest.mark.django_db
def test_the_week_follows_the_istanbul_calendar_on_sunday_night(ada):
    habit = Habit.objects.create(owner=ada, name='Su iç')
    mark(habit, date(2026, 10, 19))  # next Monday
    sunday_night_utc = datetime(2026, 10, 18, 21, 30, tzinfo=dt_timezone.utc)  # 00:30 Monday 19 Oct in Istanbul
    with mock.patch('django.utils.timezone.now', return_value=sunday_night_utc):
        data = client_for(ada).get(URL).json()['data']
    assert data['week_start'] == '2026-10-19'
    assert data['habits'][0]['days'][0] is True


@pytest.mark.django_db
def test_another_users_habits_do_not_appear(ada, bob, wednesday):
    mine = Habit.objects.create(owner=ada, name='Benimki')
    theirs = Habit.objects.create(owner=bob, name='Onunki')
    mark(mine, timezone.localdate())
    mark(theirs, timezone.localdate())
    names = [row['name'] for row in client_for(ada).get(URL).json()['data']['habits']]
    assert names == ['Benimki']


@pytest.mark.django_db
def test_deleted_habits_are_left_out_and_no_habits_gives_an_empty_list(ada, wednesday):
    assert client_for(ada).get(URL).json()['data']['habits'] == []
    Habit.objects.create(owner=ada, name='Silinmiş', is_deleted=True)
    assert client_for(ada).get(URL).json()['data']['habits'] == []


@pytest.mark.django_db
def test_query_count_does_not_grow_with_habits(ada, wednesday, django_assert_max_num_queries):
    for index in range(5):
        mark(Habit.objects.create(owner=ada, name=f'Alışkanlık {index}'), timezone.localdate())
    with django_assert_max_num_queries(3):
        response = client_for(ada).get(URL)
    assert len(response.json()['data']['habits']) == 5
