import os
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env()

SECRET_KEY = env('SECRET_KEY', default='dev-secret-not-for-production')
DEBUG = env.bool('DEBUG', default=False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'apps.core',
    'apps.users',
    'apps.habits',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

# Two ways in, because both are used: the dev container and staging pass DB_* separately, while CI and
# docker-compose pass a single DATABASE_URL. Reading only one of them left the other on the defaults.
if env('DATABASE_URL', default=''):
    DATABASES = {'default': env.db('DATABASE_URL')}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('DB_NAME', default='dev_db'),
            'USER': env('DB_USER', default='dev_user'),
            'PASSWORD': env('DB_PASSWORD', default='dev_password'),
            'HOST': env('DB_HOST', default='localhost'),
            'PORT': env('DB_PORT', default='5432'),
        }
    }

AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Europe/Istanbul'  # "today" for habit checks is the user's calendar day (timezone.localdate())
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Error tracking. Without this a production error is a line in a log file nobody is reading; with it the
# first person who hits a bug tells you before they tell their friends. It lives in the base settings so the
# sandboxes report too: VibeKaizen hands its task containers and the test environment the development DSN
# from Settings -> Monitoring as SENTRY_DSN. Production reads SENTRY_DSN from its own environment. With no
# DSN set nothing is sent and nothing breaks.
SENTRY_DSN = env('SENTRY_DSN', default='')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        environment=env('ENVIRONMENT', default='development' if DEBUG else 'production'),
        release=env('RELEASE_VERSION', default=''),
        # A sample of traces is enough to see what is slow; 100% would cost more than it tells you.
        traces_sample_rate=env.float('SENTRY_TRACES_SAMPLE_RATE', default=0.1),
        # Errors carry request data, and request data carries users' personal data.
        send_default_pii=False,
    )

# --- scaffold: project identity (used by /api/v1/hello/) ---
PROJECT_NAME = 'Alışkanlık Takipçisi'
PROJECT_SLUG = 'alskanlk-takipcisi'

# --- scaffold: languages. The web app sends Accept-Language (apps/web/src/i18n); LocaleMiddleware answers
# in it, so validation messages and e-mails reach the user in their language. Keep LANGUAGES and
# LANGUAGE_CODE in step with LOCALES and DEFAULT_LOCALE in apps/web/src/i18n/config.ts.
LANGUAGE_CODE = 'en'
LANGUAGES = [('tr', 'Türkçe'), ('en', 'English')]
MIDDLEWARE.insert(MIDDLEWARE.index('django.contrib.sessions.middleware.SessionMiddleware') + 1,
                  'django.middleware.locale.LocaleMiddleware')

# --- auth: a session lasts a week (the web app keeps the access token; there is no silent refresh yet), and
# the pre-login endpoints (register, login) are rate limited per client address.
from datetime import timedelta  # noqa: E402

SIMPLE_JWT = {'ACCESS_TOKEN_LIFETIME': timedelta(days=7)}
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {'auth': '60/minute'}

# --- deployment: the API on its own hostname behind a reverse proxy. The web app's origin(s) go in
# CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS (comma separated, with scheme: https://app.example.com).
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[])
if env.bool('CORS_ALLOW_ALL_ORIGINS', default=False):
    CORS_ALLOW_ALL_ORIGINS = True

# --- demo: the public demo (DEMO_MODE=1) never sends an e-mail; seed_demo resets its accounts.
DEMO_MODE = env.bool('DEMO_MODE', default=False)
if DEMO_MODE:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
