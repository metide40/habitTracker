# Tempo API

Django + DRF + PostgreSQL backend for the Tempo habit and focus app. JWT authentication (SimpleJWT).

## Setup (Windows PowerShell)

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env          # then set SECRET_KEY to a long random string

docker compose up -d db         # Postgres 16 on localhost:5432
# No Docker? Install Postgres, create a "tempo" database and user, then edit .env.
# For a quick try without Postgres, delete the POSTGRES_* lines in .env (uses SQLite).

python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver         # http://localhost:8000
python manage.py test              # 8 API tests
```

## Endpoints

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register/` | `{name, email, password}` -> `{user, access, refresh}` |
| POST | `/api/auth/login/` | `{email, password}` -> `{user, access, refresh}` |
| POST | `/api/auth/refresh/` | `{refresh}` -> new `access` and rotated `refresh` |
| POST | `/api/auth/logout/` | `{refresh}` blacklists the token |
| GET | `/api/auth/me/` | current user |
| GET | `/api/bootstrap/` | `{habits, completions, focusSessions, settings}` |
| POST, PATCH, DELETE | `/api/habits/`, `/api/habits/:id/` | create, update, delete |
| POST | `/api/habits/:id/toggle/` | `{date}` -> `{done}` |
| POST | `/api/sessions/` | `{mode, duration (seconds), habitId}` |
| PATCH | `/api/settings/` | any subset of the settings fields |
| POST | `/api/import/` | replaces the user's data; old ids are remapped |
| POST | `/api/reset/` | wipes the user's data |

All data endpoints need `Authorization: Bearer <access>`. Access tokens last 15 minutes, refresh tokens 7 days.
Every query is filtered by the logged-in user, so accounts never see each other's data.

## Frontend

Set `VITE_API_URL=http://localhost:8000` in the frontend's `.env`. The frontend then uses `src/api/remote.js`.
