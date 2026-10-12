from django.contrib import admin
from django.urls import path, include

from apps.core.views import HealthView, HelloView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('healthz/', HealthView.as_view(), name='healthz'),
    path('api/v1/hello/', HelloView.as_view(), name='hello'),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/habits/', include('apps.habits.urls')),
]
