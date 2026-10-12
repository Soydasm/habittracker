# Alışkanlık Takipçisi — agent guide

Giriş/kayıt, ana liste, alışkanlık ekleme, günlük işaretleme, haftalık özet, ayarlar gibi sayfaları olan, genel olarak kullanıcıların alıskanlıklarını ekleyip takip edebileceği bir uygulama olacak.

## Layout
- `apps/api` — Django 5 + DRF. Auth (`apps/users`), `GET /healthz/`, `GET /api/v1/hello/`.
- `apps/web` — Expo web (React Native Web) with expo-router. Routes in `apps/web/app/` (`app/index.tsx` is `/`),
  shared layers in `apps/web/src/`: `theme/` (light + dark tokens), `components/` (the UI kit; `/ui-kit` shows
  it), `i18n/` (languages in `config.ts`, each feature's strings in `messages/<feature>.ts`), `api/client.ts` (the only place that calls the API; unwraps the response envelope). Playwright e2e in `apps/web/e2e`.
- `.vibekaizen/project.yaml` — commands the platform runs (install / migrate / start / test / e2e). Keep it valid YAML.

## Where to look before you build
- `PRODUCT_STATE.md` — what the product currently *is*: every route and what it builds on, the shared
  components and which screens use them, the API surface, and the decisions earlier tasks settled. The
  platform regenerates it after each task; never hand-edit it. This file is how you avoid adding a second
  version of a screen that already exists.
- `.vibekaizen/memory/project/` — what earlier tasks wrote down for you (gotchas, where things live).

## Conventions
- Backend: one Django app per domain under `apps/api/apps/<domain>/`; DRF `APIView`/`ViewSet`; every endpoint under `/api/v1/`.
- Every backend endpoint ships with a pytest in `apps/api/tests/<domain>/`. `pytest -q` must pass.
- Frontend: TypeScript strict. A new screen is a route file under `apps/web/app/`. Read colors, spacing and
  typography from `useTheme()`, text from `useI18n().t`, data through `api` — never a hardcoded color, a
  literal sentence, or a `fetch` inside a component. Render all four states: loading, error, empty, content.
- Strings: a feature keeps its strings in its own `apps/web/src/i18n/messages/<feature>.ts`, every language
  of `LOCALES` side by side, and adds the file to `messages/index.ts`. `npx tsc --noEmit` fails on a language
  that misses a key and on a `t('…')` key that does not exist. Plurals are `x.one` / `x.other` keys read with
  `tn('x', count)`. Prices, numbers and dates go through `useI18n().format` (`money`, `number`, `date`,
  `time`) — never `toFixed`, a hardcoded currency sign or a hand-built date string.
- The backend answers in the request's language (`LocaleMiddleware`); errors carry a stable `error_code` the
  web app translates. Data the user enters is stored as entered.
- `/ui-kit` is the kit's preview for the people building the app, not a product screen: nothing in the app
  links to it, and no task adds a "design system" or "components" screen to the navigation.
- Every user-visible feature ships with a Playwright e2e in `apps/web/e2e/` that asserts the acceptance criteria.
- Migrations must be backward compatible (no column drops/renames in the same release as the code change).

## Do not touch
- `PRODUCT_STATE.md` — the platform writes it from the code after every task.
- `.vibekaizen/project.yaml` `parts.*.dir` and ports.
- `apps/api/config/settings/*` beyond adding app-specific settings at the bottom.
- `apps/api/apps/core/dto.py` (response envelope) and `apps/api/apps/users` auth flow.
- The shape of `apps/web/src/theme`, `apps/web/src/i18n` and `apps/web/src/api/client.ts`: extend them
  (add tokens, keys, endpoints) rather than replacing them or working around them.

## Definition of done
- Acceptance criteria satisfied and covered by tests (api pytest + web e2e).
- `pytest -q` (api), `npx tsc --noEmit` (web) pass locally.
- No secrets in code; new env vars are declared in `.vibekaizen/project.yaml` `env`.

## Lessons (updated by the platform after each sprint retro)
- (none yet)

## Lessons — Retro — Sprint 1
- Her kabul kriterindeki 'Then' ifadesi ekranda görünen bir öğeye (metin, liste satırı, hata mesajı) bağlanmalı. Sprint 1'deki UAT reddi bu kuralı güçlendirmek için bir uyarıdır; nedeni ölçümde yok.
- Bir görev review'a gönderilmeden önce Developer, görevin her kabul kriterini önizlemede tek tek elle doğrulamalı. Review turu ortalaması 1,67 olduğu için ilk turda geçme oranı artırılmalı.
