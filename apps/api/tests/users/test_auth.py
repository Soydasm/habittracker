import pytest
from rest_framework.test import APIClient

from apps.users.models import User

REGISTER = '/api/v1/auth/register/'
LOGIN = '/api/v1/auth/login/'
ME = '/api/v1/auth/me/'


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(username='ada@example.com', email='ada@example.com', password='correct-horse')


@pytest.mark.django_db
def test_register_creates_a_plain_user_and_returns_a_session(client):
    response = client.post(REGISTER, {'email': 'New@Example.com', 'password': 'longenough'}, format='json')
    assert response.status_code == 201
    body = response.json()
    assert body['success'] is True
    assert body['data']['user']['email'] == 'new@example.com'
    assert body['data']['access']
    created = User.objects.get(email='new@example.com')
    assert created.check_password('longenough')
    assert not created.is_staff and not created.is_superuser


@pytest.mark.django_db
def test_register_ignores_role_fields_in_the_payload(client):
    payload = {'email': 'sneaky@example.com', 'password': 'longenough', 'is_staff': True, 'is_superuser': True}
    assert client.post(REGISTER, payload, format='json').status_code == 201
    created = User.objects.get(email='sneaky@example.com')
    assert not created.is_staff and not created.is_superuser


@pytest.mark.django_db
def test_register_with_a_taken_email_names_the_email_field(client, user):
    response = client.post(REGISTER, {'email': 'ADA@example.com', 'password': 'longenough'}, format='json')
    assert response.status_code == 400
    body = response.json()
    assert body['success'] is False
    assert body['errors']['email'][0]['code'] == 'email_taken'
    assert User.objects.filter(email__iexact='ada@example.com').count() == 1


@pytest.mark.django_db
@pytest.mark.parametrize('payload,field', [
    ({'email': 'not-an-email', 'password': 'longenough'}, 'email'),
    ({'email': 'a@example.com', 'password': 'short'}, 'password'),
    ({'password': 'longenough'}, 'email'),
])
def test_register_validation_errors_name_the_field(client, payload, field):
    response = client.post(REGISTER, payload, format='json')
    assert response.status_code == 400
    assert field in response.json()['errors']


@pytest.mark.django_db
def test_login_returns_a_session_that_opens_me(client, user):
    response = client.post(LOGIN, {'email': 'Ada@example.com', 'password': 'correct-horse'}, format='json')
    assert response.status_code == 200
    access = response.json()['data']['access']
    me = client.get(ME, HTTP_AUTHORIZATION=f'Bearer {access}')
    assert me.status_code == 200
    assert me.json()['data']['email'] == 'ada@example.com'


@pytest.mark.django_db
def test_login_with_a_wrong_password_is_401_and_says_why(client, user):
    response = client.post(LOGIN, {'email': 'ada@example.com', 'password': 'wrong-password'}, format='json')
    assert response.status_code == 401
    assert response.json()['errors']['non_field_errors'][0]['code'] == 'invalid_credentials'


@pytest.mark.django_db
def test_login_with_an_unknown_email_answers_like_a_wrong_password(client):
    response = client.post(LOGIN, {'email': 'nobody@example.com', 'password': 'whatever1'}, format='json')
    assert response.status_code == 401
    assert response.json()['errors']['non_field_errors'][0]['code'] == 'invalid_credentials'


@pytest.mark.django_db
def test_login_requires_both_fields(client):
    response = client.post(LOGIN, {'email': 'ada@example.com'}, format='json')
    assert response.status_code == 400
    assert 'password' in response.json()['errors']


@pytest.mark.django_db
def test_me_requires_a_token(client):
    assert client.get(ME).status_code == 401


@pytest.mark.django_db
def test_me_returns_only_the_signed_in_user(client, user):
    other = User.objects.create_user(username='bob@example.com', email='bob@example.com', password='correct-horse')
    token = client.post(LOGIN, {'email': other.email, 'password': 'correct-horse'}, format='json').json()['data']['access']
    data = client.get(ME, HTTP_AUTHORIZATION=f'Bearer {token}').json()['data']
    assert data['email'] == 'bob@example.com'
    assert 'password' not in data and 'is_staff' not in data
