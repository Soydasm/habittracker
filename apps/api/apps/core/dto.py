from rest_framework.response import Response
from rest_framework import status as drf_status


class ResponseDTO:
    @staticmethod
    def success_response(message='', data=None):
        return {'success': True, 'message': message, 'data': data or {}}

    @staticmethod
    def success(message='', data=None, status_code=drf_status.HTTP_200_OK):
        return Response(ResponseDTO.success_response(message, data), status=status_code)

    @staticmethod
    def error(message='', errors=None, status_code=drf_status.HTTP_400_BAD_REQUEST):
        return Response(
            {'success': False, 'message': message, 'errors': errors or {}},
            status=status_code,
        )
