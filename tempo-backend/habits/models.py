import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Habit(models.Model):
    class Frequency(models.TextChoices):
        DAILY = "daily"
        WEEKDAYS = "weekdays"

    class TimeOfDay(models.TextChoices):
        MORNING = "morning"
        AFTERNOON = "afternoon"
        EVENING = "evening"
        ANYTIME = "anytime"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="habits")
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=32, default="health")
    color = models.CharField(max_length=16, default="sage")
    frequency_type = models.CharField(max_length=10, choices=Frequency.choices, default=Frequency.DAILY)
    weekdays = models.JSONField(default=list, blank=True)  # 0 = Sunday ... 6 = Saturday
    time_of_day = models.CharField(max_length=10, choices=TimeOfDay.choices, default=TimeOfDay.MORNING)
    target = models.PositiveSmallIntegerField(default=1)
    reminder = models.CharField(max_length=5, blank=True, null=True)  # "HH:MM"
    archived = models.BooleanField(default=False)
    created_at = models.DateField(default=timezone.localdate)

    class Meta:
        ordering = ["created_at", "name"]

    def __str__(self):
        return self.name


class Completion(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="completions")
    date = models.DateField()

    class Meta:
        constraints = [models.UniqueConstraint(fields=["habit", "date"], name="one_completion_per_day")]
        ordering = ["date"]


class FocusSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="focus_sessions")
    habit = models.ForeignKey(Habit, null=True, blank=True, on_delete=models.SET_NULL, related_name="sessions")
    mode = models.CharField(max_length=16, default="focus")
    duration = models.PositiveIntegerField(help_text="Seconds")
    completed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["completed_at"]


class UserSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="settings")
    theme = models.CharField(max_length=10, default="system")
    focus_duration = models.PositiveSmallIntegerField(default=25)
    short_break_duration = models.PositiveSmallIntegerField(default=5)
    long_break_duration = models.PositiveSmallIntegerField(default=15)
    auto_start_breaks = models.BooleanField(default=False)
    sound_enabled = models.BooleanField(default=True)
    week_starts_on = models.PositiveSmallIntegerField(default=1)

    class Meta:
        verbose_name_plural = "user settings"
