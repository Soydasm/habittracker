from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.core.dto import ResponseDTO
from apps.core.pagination import StandardPagination
from apps.users.serializers import coded_errors
from . import services
from .serializers import HabitSerializer


def _not_found():
    return ResponseDTO.error('Not found', status_code=status.HTTP_404_NOT_FOUND)


class HabitListView(APIView):
    """The signed-in user's habits (paginated, newest first) and the way to add one."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        paginator = StandardPagination()
        page = paginator.paginate_queryset(services.habits_of(request.user), request)
        return ResponseDTO.success('Habits', {
            'results': HabitSerializer(page, many=True).data,
            'count': paginator.page.paginator.count,
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
        })

    def post(self, request):
        serializer = HabitSerializer(data=request.data)
        if not serializer.is_valid():
            return ResponseDTO.error('Validation failed', coded_errors(serializer))
        habit = services.create_habit(request.user, serializer.validated_data['name'])
        return ResponseDTO.success('Habit created', HabitSerializer(habit).data, status_code=status.HTTP_201_CREATED)


class HabitDetailView(APIView):
    """One habit of the signed-in user. Someone else's habit answers 404, as if it did not exist."""
    permission_classes = [IsAuthenticated]

    def _habit(self, request, pk):
        return services.habits_of(request.user).filter(pk=pk).first()

    def get(self, request, pk):
        habit = self._habit(request, pk)
        if habit is None:
            return _not_found()
        return ResponseDTO.success('Habit', HabitSerializer(habit).data)

    def patch(self, request, pk):
        habit = self._habit(request, pk)
        if habit is None:
            return _not_found()
        serializer = HabitSerializer(habit, data=request.data, partial=True)
        if not serializer.is_valid():
            return ResponseDTO.error('Validation failed', coded_errors(serializer))
        habit = services.rename_habit(habit, serializer.validated_data.get('name', habit.name))
        return ResponseDTO.success('Habit updated', HabitSerializer(habit).data)

    def delete(self, request, pk):
        habit = self._habit(request, pk)
        if habit is None:
            return _not_found()
        services.delete_habit(habit)
        return ResponseDTO.success('Habit deleted')
