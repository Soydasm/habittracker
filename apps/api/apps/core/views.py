from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings

from apps.core.dto import ResponseDTO


class HealthView(APIView):
    """GET /healthz/ — liveness + database check. Used by the platform test gate."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            with connection.cursor() as cur:
                cur.execute('SELECT 1')
            db = 'ok'
        except Exception as exc:  # noqa: BLE001
            return Response({'status': 'degraded', 'database': str(exc)}, status=503)
        return Response({'status': 'ok', 'database': db})


class HelloView(APIView):
    """GET /api/v1/hello/ — the first vertical slice the scaffold ships with."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        name = getattr(settings, 'PROJECT_NAME', 'VibeKaizen')
        # Every /api/ response goes through the envelope: the web client unwraps
        # {success, data, ...} and treats anything else as an error. Returning the payload
        # bare made the home screen show the greeting inside its error box on every fresh
        # project — visibly wrong, and it cost a full container run to find.
        return ResponseDTO.success('ok', {
            'message': f'Merhaba {name}',
            'project': getattr(settings, 'PROJECT_SLUG', 'app'),
        })
