from django.conf import settings


def test_the_product_speaks_turkish_and_english():
    # in step with LOCALES / DEFAULT_LOCALE in apps/web/src/i18n/config.ts
    assert settings.LANGUAGE_CODE == 'en'
    assert [code for code, _ in settings.LANGUAGES] == ['tr', 'en']
