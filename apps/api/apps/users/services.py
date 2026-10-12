from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer


def session_for(user):
    """The signed-in session the web app keeps: the user and a token pair."""
    refresh = RefreshToken.for_user(user)
    return {'user': UserSerializer(user).data, 'access': str(refresh.access_token), 'refresh': str(refresh)}


def authenticate_by_email(email, password):
    """The active user with this e-mail and password, or None. Same answer for 'no such user' and 'wrong
    password', so the endpoint does not tell who has an account."""
    user = User.objects.filter(email__iexact=email.strip(), is_active=True).first()
    if user is None:
        User().set_password(password)  # spend the same time as a real check
        return None
    return user if user.check_password(password) else None
