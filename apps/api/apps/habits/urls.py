from django.urls import path

from .views import HabitCheckView, HabitDetailView, HabitListView, HabitUncheckView, WeeklySummaryView

urlpatterns = [
    path('', HabitListView.as_view(), name='habit-list'),
    path('weekly-summary/', WeeklySummaryView.as_view(), name='habit-weekly-summary'),
    path('<uuid:pk>/', HabitDetailView.as_view(), name='habit-detail'),
    path('<uuid:pk>/check/', HabitCheckView.as_view(), name='habit-check'),
    path('<uuid:pk>/uncheck/', HabitUncheckView.as_view(), name='habit-uncheck'),
]
