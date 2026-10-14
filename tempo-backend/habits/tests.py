from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()
DAILY = {"type": "daily"}
WEEKDAYS = {"type": "weekdays", "weekdays": [1, 2, 3, 4, 5]}


class ApiTests(APITestCase):
    def register(self, email="ada@example.com", name="Ada Lovelace", password="correct-horse-42"):
        res = self.client.post("/api/auth/register/", {"name": name, "email": email, "password": password}, format="json")
        return res

    def login_as(self, email="ada@example.com"):
        res = self.register(email=email)
        self.assertEqual(res.status_code, 201, res.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        return res.data

    def make_habit(self, **kw):
        body = {"name": "Stretch", "category": "body", "color": "coral", "frequency": DAILY,
                "timeOfDay": "morning", "target": 1, "reminder": "07:00", **kw}
        res = self.client.post("/api/habits/", body, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        return res.data

    # --- auth ---
    def test_register_login_me_and_duplicates(self):
        data = self.login_as()
        self.assertEqual(data["user"]["name"], "Ada Lovelace")
        self.assertEqual(self.client.get("/api/auth/me/").data["email"], "ada@example.com")
        self.assertEqual(self.register().status_code, 400)  # duplicate email
        self.client.credentials()
        bad = self.client.post("/api/auth/login/", {"email": "ada@example.com", "password": "nope"}, format="json")
        self.assertEqual(bad.status_code, 401)
        ok = self.client.post("/api/auth/login/", {"email": "ADA@example.com", "password": "correct-horse-42"}, format="json")
        self.assertEqual(ok.status_code, 200)

    def test_weak_password_rejected(self):
        self.assertEqual(self.register(password="12345678").status_code, 400)

    def test_requires_auth_and_refresh_and_logout(self):
        self.assertEqual(self.client.get("/api/bootstrap/").status_code, 401)
        data = self.login_as()
        refreshed = self.client.post("/api/auth/refresh/", {"refresh": data["refresh"]}, format="json")
        self.assertEqual(refreshed.status_code, 200)
        self.client.post("/api/auth/logout/", {"refresh": refreshed.data["refresh"]}, format="json")
        self.assertEqual(self.client.post("/api/auth/refresh/", {"refresh": refreshed.data["refresh"]}, format="json").status_code, 401)

    # --- habits ---
    def test_habit_shapes_match_frontend(self):
        self.login_as()
        h = self.make_habit()
        self.assertEqual(h["frequency"], DAILY)
        self.assertEqual(set(h), {"id", "name", "category", "color", "frequency", "timeOfDay", "target", "reminder", "archived", "createdAt"})
        w = self.make_habit(name="Run", frequency=WEEKDAYS, reminder=None)
        self.assertEqual(w["frequency"], WEEKDAYS)
        patched = self.client.patch(f"/api/habits/{w['id']}/", {"archived": True}, format="json")
        self.assertTrue(patched.data["archived"])
        bad = self.client.post("/api/habits/", {"name": "x", "frequency": {"type": "weekdays", "weekdays": []}}, format="json")
        self.assertEqual(bad.status_code, 400)

    def test_toggle_and_bootstrap(self):
        self.login_as()
        h = self.make_habit()
        url = f"/api/habits/{h['id']}/toggle/"
        self.assertTrue(self.client.post(url, {"date": "2026-10-04"}, format="json").data["done"])
        self.assertEqual(self.client.get("/api/bootstrap/").data["completions"], {h["id"]: ["2026-10-04"]})
        self.assertFalse(self.client.post(url, {"date": "2026-10-04"}, format="json").data["done"])
        self.assertEqual(self.client.get("/api/bootstrap/").data["completions"], {})
        self.assertEqual(self.client.post(url, {}, format="json").status_code, 400)

    def test_users_cannot_touch_each_others_data(self):
        self.login_as("a@example.com")
        h = self.make_habit()
        self.login_as("b@example.com")
        self.assertEqual(self.client.get("/api/bootstrap/").data["habits"], [])
        self.assertEqual(self.client.post(f"/api/habits/{h['id']}/toggle/", {"date": "2026-10-04"}, format="json").status_code, 404)
        self.assertEqual(self.client.delete(f"/api/habits/{h['id']}/").status_code, 404)
        bad = self.client.post("/api/sessions/", {"mode": "focus", "duration": 1500, "habitId": h["id"]}, format="json")
        self.assertEqual(bad.status_code, 400)

    # --- sessions & settings ---
    def test_sessions_and_settings(self):
        self.login_as()
        h = self.make_habit()
        s = self.client.post("/api/sessions/", {"mode": "focus", "duration": 1500, "habitId": h["id"]}, format="json")
        self.assertEqual(s.status_code, 201, s.data)
        self.assertEqual(s.data["habitId"], h["id"])
        none = self.client.post("/api/sessions/", {"mode": "focus", "duration": 600, "habitId": None}, format="json")
        self.assertIsNone(none.data["habitId"])
        self.assertEqual(len(self.client.get("/api/bootstrap/").data["focusSessions"]), 2)
        st = self.client.patch("/api/settings/", {"focusDuration": 50, "theme": "dark"}, format="json")
        self.assertEqual((st.data["focusDuration"], st.data["theme"], st.data["longBreakDuration"]), (50, "dark", 15))
        self.assertEqual(self.client.patch("/api/settings/", {"focusDuration": 0}, format="json").status_code, 400)

    # --- import / reset ---
    def test_import_remaps_old_ids_then_reset(self):
        self.login_as()
        payload = {
            "habits": [{"id": "habit-1", "name": "Morning run", "category": "health", "color": "sage", "frequency": WEEKDAYS,
                        "timeOfDay": "morning", "target": 1, "reminder": "06:30", "createdAt": "2026-06-06", "archived": False}],
            "completions": {"habit-1": ["2026-10-01", "2026-10-02"], "ghost": ["2026-10-01"]},
            "focusSessions": [{"id": "fs-1", "mode": "focus", "duration": 1500, "habitId": "habit-1", "completedAt": "2026-10-01T08:00:00Z"}],
            "settings": {"focusDuration": 30},
        }
        data = self.client.post("/api/import/", payload, format="json").data
        hid = data["habits"][0]["id"]
        self.assertNotEqual(hid, "habit-1")
        self.assertEqual(data["habits"][0]["createdAt"], "2026-06-06")
        self.assertEqual(data["completions"], {hid: ["2026-10-01", "2026-10-02"]})
        self.assertEqual(data["focusSessions"][0]["habitId"], hid)
        self.assertEqual(data["settings"]["focusDuration"], 30)
        wiped = self.client.post("/api/reset/").data
        self.assertEqual((wiped["habits"], wiped["completions"], wiped["focusSessions"]), ([], {}, []))
        self.assertEqual(wiped["settings"]["focusDuration"], 25)
