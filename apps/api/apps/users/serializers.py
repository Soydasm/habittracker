from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import User


def coded_errors(serializer):
    """`serializer.errors` as {field: [{message, code}]}: the web app translates the stable code, not the text."""
    return {
        field: [{'message': str(error), 'code': error.code} for error in errors]
        for field, errors in serializer.errors.items()
    }


class UserRegistrationSerializer(serializers.Serializer):
    """E-mail + password only. The account is always a plain user: the role fields are never read from the
    payload. The e-mail doubles as the username, so login can reuse the standard user table."""
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(_('This e-mail is already in use.'), code='email_taken')
        return value

    def create(self, validated_data):
        email = validated_data['email']
        return User.objects.create_user(username=email, email=email, password=validated_data['password'])


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
