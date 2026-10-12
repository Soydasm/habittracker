# Alışkanlık Takipçisi

Giriş/kayıt, ana liste, alışkanlık ekleme, günlük işaretleme, haftalık özet, ayarlar gibi sayfaları olan, genel olarak kullanıcıların alıskanlıklarını ekleyip takip edebileceği bir uygulama olacak.

Monorepo scaffolded by VibeKaizen (`django-expo@1.0`).

| Part | Path | Run |
|---|---|---|
| API (Django) | `apps/api` | `pip install -r requirements/development.txt && python manage.py migrate && python manage.py runserver` |
| Web (Expo) | `apps/web` | `npm install && npm start` |
| Everything | `infra/docker-compose.yml` | `docker compose -f infra/docker-compose.yml up` |

See `AGENTS.md` for conventions.
