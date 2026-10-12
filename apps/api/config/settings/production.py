from .base import *  # noqa: F401, F403
import environ

env = environ.Env()
DEBUG = False
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])
SECURE_SSL_REDIRECT = True
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
