from django.contrib import admin

from .models import Habit, HabitCheck


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_deleted', 'created_at')


@admin.register(HabitCheck)
class HabitCheckAdmin(admin.ModelAdmin):
    list_display = ('habit', 'day')
