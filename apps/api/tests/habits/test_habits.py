import pytest
from rest_framework.test import APIClient

from apps.habits.models import Habit
from apps.users.models import User

LIST = '/api/v1/habits/'


def detail(habit):
    return f'{LIST}{habit.id}/'


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


@pytest.mark.django_db
def test_endpoints_reject_anonymous_requests(ada):
    habit = Habit.objects.create(owner=ada, name='Kitap oku')
    anon = APIClient()
    assert anon.get(LIST).status_code == 401
    assert anon.post(LIST, {'name': 'x'}, format='json').status_code == 401
    assert anon.get(detail(habit)).status_code == 401
    assert anon.patch(detail(habit), {'name': 'x'}, format='json').status_code == 401
    assert anon.delete(detail(habit)).status_code == 401


@pytest.mark.django_db
def test_list_is_empty_for_a_user_without_habits(ada):
    response = client_for(ada).get(LIST)
    assert response.status_code == 200
    data = response.json()['data']
    assert data['results'] == [] and data['count'] == 0


@pytest.mark.django_db
def test_create_returns_201_and_the_habit_shows_first_in_the_list(ada):
    client = client_for(ada)
    Habit.objects.create(owner=ada, name='Eski')
    response = client.post(LIST, {'name': '  Kitap oku  '}, format='json')
    assert response.status_code == 201
    body = response.json()
    assert body['success'] is True and body['data']['name'] == 'Kitap oku'
    names = [h['name'] for h in client.get(LIST).json()['data']['results']]
    assert names == ['Kitap oku', 'Eski']


@pytest.mark.django_db
def test_create_ignores_an_owner_in_the_payload(ada, bob):
    response = client_for(ada).post(LIST, {'name': 'Su iç', 'owner': str(bob.id)}, format='json')
    assert response.status_code == 201
    assert Habit.objects.get(name='Su iç').owner == ada


@pytest.mark.django_db
@pytest.mark.parametrize('payload', [{}, {'name': ''}, {'name': '   '}])
def test_create_with_an_empty_name_is_400_with_the_field_error(ada, payload):
    response = client_for(ada).post(LIST, payload, format='json')
    assert response.status_code == 400
    errors = response.json()['errors']
    assert errors['name'][0]['code'] in ('blank', 'required')
    assert Habit.objects.count() == 0


@pytest.mark.django_db
def test_create_with_a_too_long_name_is_400(ada):
    response = client_for(ada).post(LIST, {'name': 'a' * 101}, format='json')
    assert response.status_code == 400
    assert response.json()['errors']['name'][0]['code'] == 'max_length'


@pytest.mark.django_db
def test_a_user_only_sees_their_own_habits(ada, bob):
    Habit.objects.create(owner=ada, name='Ada nın')
    Habit.objects.create(owner=bob, name='Bob un')
    names = [h['name'] for h in client_for(bob).get(LIST).json()['data']['results']]
    assert names == ['Bob un']


@pytest.mark.django_db
def test_another_users_habit_is_404_to_read_rename_and_delete(ada, bob):
    habit = Habit.objects.create(owner=ada, name='Ada nın')
    client = client_for(bob)
    assert client.get(detail(habit)).status_code == 404
    assert client.patch(detail(habit), {'name': 'ele geçti'}, format='json').status_code == 404
    assert client.delete(detail(habit)).status_code == 404
    habit.refresh_from_db()
    assert habit.name == 'Ada nın' and habit.is_deleted is False


@pytest.mark.django_db
def test_rename_changes_the_name(ada):
    habit = Habit.objects.create(owner=ada, name='Kitap oku')
    response = client_for(ada).patch(detail(habit), {'name': 'Roman oku'}, format='json')
    assert response.status_code == 200
    assert response.json()['data']['name'] == 'Roman oku'
    habit.refresh_from_db()
    assert habit.name == 'Roman oku'


@pytest.mark.django_db
def test_rename_to_blank_is_400_and_keeps_the_name(ada):
    habit = Habit.objects.create(owner=ada, name='Kitap oku')
    response = client_for(ada).patch(detail(habit), {'name': ' '}, format='json')
    assert response.status_code == 400
    assert response.json()['errors']['name'][0]['code'] == 'blank'
    habit.refresh_from_db()
    assert habit.name == 'Kitap oku'


@pytest.mark.django_db
def test_delete_soft_deletes_and_the_habit_leaves_the_list(ada):
    habit = Habit.objects.create(owner=ada, name='Kitap oku')
    client = client_for(ada)
    assert client.delete(detail(habit)).status_code == 200
    habit.refresh_from_db()
    assert habit.is_deleted is True
    assert client.get(LIST).json()['data']['results'] == []
    assert client.get(detail(habit)).status_code == 404


@pytest.mark.django_db
def test_list_is_paginated_and_uses_a_constant_number_of_queries(ada, django_assert_num_queries):
    Habit.objects.bulk_create([Habit(owner=ada, name=f'Alışkanlık {i}') for i in range(25)])
    client = client_for(ada)
    with django_assert_num_queries(2):  # the page and its count
        data = client.get(LIST).json()['data']
    assert data['count'] == 25 and len(data['results']) == 20 and data['next']
    assert len(client.get(LIST, {'page_size': 100}).json()['data']['results']) == 25
