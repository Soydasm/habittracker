from django.conf import settings


def test_the_product_speaks_turkish_only():
    assert settings.LANGUAGE_CODE == 'tr'
    assert [code for code, _ in settings.LANGUAGES] == ['tr']
