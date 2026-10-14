from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register("habits", views.HabitViewSet, basename="habit")

urlpatterns = [
    path("auth/register/", views.RegisterView.as_view()),
    path("auth/login/", views.LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("auth/logout/", views.LogoutView.as_view()),
    path("auth/me/", views.MeView.as_view()),
    path("bootstrap/", views.BootstrapView.as_view()),
    path("sessions/", views.SessionListCreate.as_view()),
    path("settings/", views.SettingsView.as_view()),
    path("import/", views.import_all),
    path("reset/", views.reset_all),
    path("", include(router.urls)),
]
