# Tempo

A habit tracker with a focus timer and insights.

- **Backend:** Django REST Framework, JWT auth, PostgreSQL (`tempo-backend`)
- **Frontend:** React, Vite, Tailwind CSS (`tempo-frontend`)

## Run locally

Start the backend first.

```powershell
cd tempo-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
docker compose up -d db
python manage.py migrate
python manage.py runserver
```

Then start the frontend in a second terminal.

```powershell
cd tempo-frontend
npm install
copy .env.example .env
npm run dev
```

Open the address that `npm run dev` prints (usually http://localhost:5173).

See `tempo-backend/README.md` for more backend details.
