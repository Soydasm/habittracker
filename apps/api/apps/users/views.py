from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.core.dto import ResponseDTO
from .serializers import UserRegistrationSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return ResponseDTO.error('Validation failed', serializer.errors)
        user = serializer.save()
        return ResponseDTO.success(
            'Registered',
            UserSerializer(user).data,
            status_code=status.HTTP_201_CREATED,
        )
