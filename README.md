# Alışkanlık Takipçisi

> **Built with [VibeKaizen](https://vibekaizen.com/en/demo/habit/)** — the application code was written by VibeKaizen's AI agents (10 tasks, ~$16.85 model cost, Claude Sonnet 5.5, on the founder's own key). Live demo: https://habit.demo.vibekaizen.com
>
> **[VibeKaizen](https://vibekaizen.com/demo/habit/) ile geliştirildi** — uygulamanın kodunu VibeKaizen'in yapay zekâ ajanları yazdı (10 görev, ~$16,85 model ücreti, Claude Sonnet 5.5, kurucunun kendi anahtarıyla).

Giriş/kayıt, ana liste, alışkanlık ekleme, günlük işaretleme, haftalık özet, ayarlar gibi sayfaları olan, genel olarak kullanıcıların alıskanlıklarını ekleyip takip edebileceği bir uygulama olacak.

Monorepo scaffolded by VibeKaizen (`django-expo@1.0`).

| Part | Path | Run |
|---|---|---|
| API (Django) | `apps/api` | `pip install -r requirements/development.txt && python manage.py migrate && python manage.py runserver` |
| Web (Expo) | `apps/web` | `npm install && npm start` |
| Everything | `infra/docker-compose.yml` | `docker compose -f infra/docker-compose.yml up` |

See `AGENTS.md` for conventions.
