from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle

from apps.core.dto import ResponseDTO
from .serializers import LoginSerializer, coded_errors, UserRegistrationSerializer, UserSerializer
from .services import authenticate_by_email, session_for


class RegisterView(APIView):
    """Public by nature (nobody is signed in yet); rate limited. Answers with the new session."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            # get_full_details keeps each error's stable code ("email_taken") next to its message
            return ResponseDTO.error('Validation failed', coded_errors(serializer))
        user = serializer.save()
        return ResponseDTO.success('Registered', session_for(user), status_code=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Public by nature; rate limited. Answers with the session, or 401 `invalid_credentials`."""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return ResponseDTO.error('Validation failed', coded_errors(serializer))
        user = authenticate_by_email(serializer.validated_data['email'], serializer.validated_data['password'])
        if user is None:
            return ResponseDTO.error(
                'Invalid credentials',
                {'non_field_errors': [{'message': 'Invalid credentials', 'code': 'invalid_credentials'}]},
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        return ResponseDTO.success('Logged in', session_for(user))


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return ResponseDTO.success('Current user', UserSerializer(request.user).data)
