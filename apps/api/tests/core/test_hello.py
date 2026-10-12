import pytest
from django.test import Client


@pytest.mark.django_db
def test_healthz_ok():
    resp = Client().get('/healthz/')
    assert resp.status_code == 200
    assert resp.json()['status'] == 'ok'


@pytest.mark.django_db
def test_hello_returns_project_name_inside_the_envelope():
    """The web client unwraps {success, data}; a bare payload reads as an error to it.

    This test used to assert the bare shape, which is how the mismatch survived: the API test
    was green and only the browser knew the home screen was showing its error box.
    """
    resp = Client().get('/api/v1/hello/')
    assert resp.status_code == 200
    body = resp.json()
    assert body['success'] is True
    assert body['data']['message'].startswith('Merhaba')
