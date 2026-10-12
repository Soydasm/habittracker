# What this product is right now

_Everything above `## Decisions` is generated from the code by the platform after each task —
do not hand-edit it, it will be overwritten. Read it before you build: extend what is here
instead of adding a second way to do the same thing._

## Part `api` (`apps/api`)

### API surface
| method | path | view | permission | file |
|---|---|---|---|---|
| — | register/ | RegisterView.as_view | AllowAny | `apps/api/apps/users/urls.py` |
| — | login/ | TokenObtainPairView.as_view | — | `apps/api/apps/users/urls.py` |
| — | refresh/ | TokenRefreshView.as_view | — | `apps/api/apps/users/urls.py` |
| — | admin/ | admin.site.urls | — | `apps/api/config/urls.py` |
| — | healthz/ | HealthView.as_view | AllowAny | `apps/api/config/urls.py` |
| — | api/v1/hello/ | HelloView.as_view | AllowAny | `apps/api/config/urls.py` |
| — | api/v1/auth/ | include | — | `apps/api/config/urls.py` |

### Data models
- `AbstractModel` (4 fields) — `apps/api/apps/core/models.py`

### Tests
- 3 python test files, 0 spec files

## Part `web` (`apps/web`)

### Routes
| url | file | builds on | auth |
|---|---|---|---|
| / | `apps/web/app/index.tsx` | Screen | no |
| /ui-kit | `apps/web/app/ui-kit.tsx` | AppText, Badge, Button, Card, EmptyState, Header, Input, Screen, useI18n, useTheme | no |

### Layouts (the chrome around routes)
- `apps/web/app/_layout.tsx` — AppText, Header, I18nProvider, ThemeProvider, useI18n, useTheme

### Shared components
| component | file | used by |
|---|---|---|
| AppText | `apps/web/src/components/AppText.tsx` | /ui-kit, Badge, Button, EmptyState, Header, Input, Screen |
| Badge | `apps/web/src/components/Badge.tsx` | /ui-kit |
| Button | `apps/web/src/components/Button.tsx` | /ui-kit, EmptyState |
| Card | `apps/web/src/components/Card.tsx` | /ui-kit |
| EmptyState | `apps/web/src/components/EmptyState.tsx` | /ui-kit |
| Header | `apps/web/src/components/Header.tsx` | /ui-kit |
| Input | `apps/web/src/components/Input.tsx` | /ui-kit |
| Screen | `apps/web/src/components/Screen.tsx` | /, /ui-kit |

### Providers (read data and styling from these, never hardcode)
- `apps/web/src/i18n/index.tsx` — useI18n
- `apps/web/src/theme/index.tsx` — useTheme

### Tests
- 0 python test files, 1 spec files

## Decisions
- TASK-20261012-258852 — Design foundation: Tema, ortak bileşenler, gezinme kabuğu ve boş ana sayfa hazır. `pytest -q` (5 test), `npx tsc --noEmit` ve `npx playwright test` (5 test) geçti. Ekranlara 375, 390 ve 1440 px'te açık/koyu baktım. - **Tema:** `tokens.json _(TASK-20261012-258852, 2026-10-12)_
