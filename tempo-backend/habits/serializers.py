import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import FocusSession, Habit, UserSettings

User = get_user_model()


class FrequencyField(serializers.Field):
    """Maps {type, weekdays?} <-> frequency_type + weekdays columns."""

    def to_representation(self, habit):
        out = {"type": habit.frequency_type}
        if habit.frequency_type == Habit.Frequency.WEEKDAYS:
            out["weekdays"] = habit.weekdays
        return out

    def to_internal_value(self, data):
        if not isinstance(data, dict) or data.get("type") not in ("daily", "weekdays"):
            raise serializers.ValidationError("frequency.type must be 'daily' or 'weekdays'.")
        if data["type"] == "daily":
            return {"frequency_type": "daily", "weekdays": []}
        days = data.get("weekdays")
        if not isinstance(days, list) or not days or any(not isinstance(d, int) or not 0 <= d <= 6 for d in days):
            raise serializers.ValidationError("Pick at least one weekday (0-6).")
        return {"frequency_type": "weekdays", "weekdays": sorted(set(days))}


class HabitSerializer(serializers.ModelSerializer):
    frequency = FrequencyField(source="*")
    timeOfDay = serializers.ChoiceField(source="time_of_day", choices=Habit.TimeOfDay.choices, required=False)
    createdAt = serializers.DateField(source="created_at", read_only=True)
    target = serializers.IntegerField(min_value=1, max_value=99, required=False)
    reminder = serializers.CharField(max_length=5, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Habit
        fields = ["id", "name", "category", "color", "frequency", "timeOfDay", "target", "reminder", "archived", "createdAt"]
        read_only_fields = ["id"]

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Give the habit a name.")
        return value

    def validate_reminder(self, value):
        if value and not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", value):
            raise serializers.ValidationError("Use HH:MM.")
        return value or None


class UserHabitField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self):
        return Habit.objects.filter(user=self.context["request"].user)


class FocusSessionSerializer(serializers.ModelSerializer):
    habitId = UserHabitField(source="habit", required=False, allow_null=True)
    completedAt = serializers.DateTimeField(source="completed_at", read_only=True)

    class Meta:
        model = FocusSession
        fields = ["id", "mode", "duration", "habitId", "completedAt"]
        read_only_fields = ["id"]

    def to_representation(self, obj):
        data = super().to_representation(obj)
        data["habitId"] = str(obj.habit_id) if obj.habit_id else None
        return data


class SettingsSerializer(serializers.ModelSerializer):
    focusDuration = serializers.IntegerField(source="focus_duration", min_value=1, max_value=180, required=False)
    shortBreakDuration = serializers.IntegerField(source="short_break_duration", min_value=1, max_value=60, required=False)
    longBreakDuration = serializers.IntegerField(source="long_break_duration", min_value=1, max_value=120, required=False)
    autoStartBreaks = serializers.BooleanField(source="auto_start_breaks", required=False)
    soundEnabled = serializers.BooleanField(source="sound_enabled", required=False)
    weekStartsOn = serializers.ChoiceField(source="week_starts_on", choices=[0, 1], required=False)
    theme = serializers.ChoiceField(choices=["light", "dark", "system"], required=False)

    class Meta:
        model = UserSettings
        fields = ["theme", "focusDuration", "shortBreakDuration", "longBreakDuration", "autoStartBreaks", "soundEnabled", "weekStartsOn"]


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=80)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        validate_password(attrs["password"], User(username=attrs["email"], first_name=attrs["name"]))
        return attrs

    def create(self, data):
        return User.objects.create_user(username=data["email"], email=data["email"], first_name=data["name"].strip(), password=data["password"])


def user_payload(user):
    return {"id": user.id, "name": user.first_name, "email": user.email}
