from django.urls import path

from .views import HabitDetailView, HabitListView

urlpatterns = [
    path('', HabitListView.as_view(), name='habit-list'),
    path('<uuid:pk>/', HabitDetailView.as_view(), name='habit-detail'),
]
