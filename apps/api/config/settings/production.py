from .base import *  # noqa: F401, F403
import environ

env = environ.Env()
DEBUG = False
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])
SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
# TLS ends at the reverse proxy (Caddy) in front of gunicorn: trust its X-Forwarded-Proto, or every request
# looks like http and is redirected. CORS_ALLOWED_ORIGINS / CSRF_TRUSTED_ORIGINS come from env (base.py).
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_REDIRECT_EXEMPT = [r'^healthz/$']  # the proxy's health check speaks plain http
STATIC_ROOT = BASE_DIR / 'staticfiles'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# One JSON object per line, because that is what a log collector can search. A human reading the container
# log still sees the message; a machine can filter by level and request id.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            'format': '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s",'
                      '"message":"%(message)s"}',
        },
    },
    'handlers': {'console': {'class': 'logging.StreamHandler', 'formatter': 'json'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
    'loggers': {
        'django.request': {'level': 'ERROR', 'handlers': ['console'], 'propagate': False},
        'apps': {'level': 'INFO'},
    },
}
