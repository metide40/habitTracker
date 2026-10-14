from datetime import date

from django.contrib.auth import authenticate
from django.db import transaction
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Completion, FocusSession, Habit, UserSettings
from .serializers import (FocusSessionSerializer, HabitSerializer, RegisterSerializer,
                          SettingsSerializer, user_payload)

MAX_IMPORT_HABITS, MAX_IMPORT_DATES = 200, 5000


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def user_settings(user):
    return UserSettings.objects.get_or_create(user=user)[0]


def snapshot(user):
    completions = {}
    for habit_id, day in Completion.objects.filter(habit__user=user).values_list("habit_id", "date"):
        completions.setdefault(str(habit_id), []).append(day.isoformat())
    for dates in completions.values():
        dates.sort()
    return {
        "habits": HabitSerializer(Habit.objects.filter(user=user), many=True).data,
        "completions": completions,
        "focusSessions": FocusSessionSerializer(FocusSession.objects.filter(user=user), many=True).data,
        "settings": SettingsSerializer(user_settings(user)).data,
    }


# ---------- Auth ----------
class AuthThrottled(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class RegisterView(AuthThrottled):
    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response({"user": user_payload(user), **tokens_for(user)}, status=status.HTTP_201_CREATED)


class LoginView(AuthThrottled):
    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        user = authenticate(request, username=email, password=request.data.get("password", ""))
        if not user:
            return Response({"detail": "Incorrect email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"user": user_payload(user), **tokens_for(user)})


class LogoutView(APIView):
    def post(self, request):
        try:
            RefreshToken(request.data.get("refresh")).blacklist()
        except Exception:
            pass  # already invalid or expired: nothing to revoke
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    def get(self, request):
        return Response(user_payload(request.user))


# ---------- Data ----------
class BootstrapView(APIView):
    def get(self, request):
        return Response(snapshot(request.user))


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        habit = self.get_object()
        day = serializers.DateField().run_validation(request.data.get("date"))
        _, created = Completion.objects.get_or_create(habit=habit, date=day)
        if not created:
            Completion.objects.filter(habit=habit, date=day).delete()
        return Response({"done": created})


class SessionListCreate(ListCreateAPIView):
    serializer_class = FocusSessionSerializer

    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SettingsView(RetrieveUpdateAPIView):
    serializer_class = SettingsSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return user_settings(self.request.user)


def wipe(user):
    Habit.objects.filter(user=user).delete()  # cascades completions
    FocusSession.objects.filter(user=user).delete()


@api_view(["POST"])
def reset_all(request):
    with transaction.atomic():
        wipe(request.user)
        UserSettings.objects.filter(user=request.user).delete()
    return Response(snapshot(request.user))


@api_view(["POST"])
def import_all(request):
    """Replace this user's data with an export from the app (ids are remapped)."""
    data = request.data
    habits = data.get("habits") or []
    completions = data.get("completions") or {}
    if len(habits) > MAX_IMPORT_HABITS or any(len(v) > MAX_IMPORT_DATES for v in completions.values() if isinstance(v, list)):
        return Response({"detail": "Import too large."}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        wipe(request.user)
        id_map = {}
        for item in habits:
            ser = HabitSerializer(data=item)
            ser.is_valid(raise_exception=True)
            created_at = parse_date(str(item.get("createdAt", ""))) or date.today()
            id_map[str(item.get("id"))] = ser.save(user=request.user, created_at=created_at)
        rows = []
        for old_id, dates in completions.items():
            habit = id_map.get(str(old_id))
            if habit and isinstance(dates, list):
                rows += [Completion(habit=habit, date=d) for d in {parse_date(str(x)) for x in dates} if d]
        Completion.objects.bulk_create(rows)
        for s in data.get("focusSessions") or []:
            duration = s.get("duration")
            if isinstance(duration, int) and duration > 0:
                when = parse_datetime(str(s.get("completedAt", "")))
                FocusSession.objects.create(
                    user=request.user, habit=id_map.get(str(s.get("habitId"))),
                    mode=str(s.get("mode", "focus"))[:16], duration=duration,
                    **({"completed_at": when} if when else {}),
                )
        if isinstance(data.get("settings"), dict):
            ser = SettingsSerializer(user_settings(request.user), data=data["settings"], partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
    return Response(snapshot(request.user))
