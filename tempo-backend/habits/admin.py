from django.contrib import admin

from .models import Completion, FocusSession, Habit, UserSettings

admin.site.register([Habit, Completion, FocusSession, UserSettings])
