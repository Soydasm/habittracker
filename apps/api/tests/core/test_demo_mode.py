import importlib

import pytest


@pytest.mark.parametrize('value, backend', [
    ('1', 'django.core.mail.backends.console.EmailBackend'),
    ('0', 'django.core.mail.backends.smtp.EmailBackend'),
])
def test_demo_mode_sends_no_e_mail(monkeypatch, value, backend):
    monkeypatch.setenv('DEMO_MODE', value)
    from config.settings import base
    monkeypatch.delattr(base, 'EMAIL_BACKEND', raising=False)  # reload keeps the module's old names
    settings = importlib.reload(base)
    assert getattr(settings, 'EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend') == backend
