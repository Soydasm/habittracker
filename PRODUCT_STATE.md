# What this product is right now

_Everything above `## Decisions` is generated from the code by the platform after each task —
do not hand-edit it, it will be overwritten. Read it before you build: extend what is here
instead of adding a second way to do the same thing._

## Part `api` (`apps/api`)

### API surface
| method | path | view | permission | file |
|---|---|---|---|---|
| — |  | HabitListView.as_view | IsAuthenticated | `apps/api/apps/habits/urls.py` |
| — | <uuid:pk>/ | HabitDetailView.as_view | IsAuthenticated | `apps/api/apps/habits/urls.py` |
| — | <uuid:pk>/check/ | HabitCheckView.as_view | IsAuthenticated | `apps/api/apps/habits/urls.py` |
| — | <uuid:pk>/uncheck/ | HabitUncheckView.as_view | IsAuthenticated | `apps/api/apps/habits/urls.py` |
| — | register/ | RegisterView.as_view | AllowAny | `apps/api/apps/users/urls.py` |
| — | login/ | LoginView.as_view | AllowAny | `apps/api/apps/users/urls.py` |
| — | me/ | MeView.as_view | IsAuthenticated | `apps/api/apps/users/urls.py` |
| — | refresh/ | TokenRefreshView.as_view | — | `apps/api/apps/users/urls.py` |
| — | admin/ | admin.site.urls | — | `apps/api/config/urls.py` |
| — | healthz/ | HealthView.as_view | AllowAny | `apps/api/config/urls.py` |
| — | api/v1/hello/ | HelloView.as_view | AllowAny | `apps/api/config/urls.py` |
| — | api/v1/auth/ | include | — | `apps/api/config/urls.py` |
| — | api/v1/habits/ | include | — | `apps/api/config/urls.py` |

### Data models
- `AbstractModel` (4 fields) — `apps/api/apps/core/models.py`
- `Habit` (2 fields) — `apps/api/apps/habits/models.py`
- `HabitCheck` (2 fields) — `apps/api/apps/habits/models.py`

### Tests
- 6 python test files, 0 spec files

## Part `web` (`apps/web`)

### Routes
| url | file | builds on | auth |
|---|---|---|---|
| /habits/:id | `apps/web/app/habits/[id].tsx` | DeleteHabit, EmptyState, HabitForm, Screen, useAuth, useHabit, useI18n, useTheme | yes |
| /habits/new | `apps/web/app/habits/new.tsx` | HabitForm, Screen, useI18n | no |
| / | `apps/web/app/index.tsx` | HabitList, Screen, useAuth | yes |
| /login | `apps/web/app/login.tsx` | AuthForm, Screen, useI18n | no |
| /register | `apps/web/app/register.tsx` | AuthForm, Screen, useI18n | no |
| /settings | `apps/web/app/settings.tsx` | AppText, Button, Card, EmptyState, Screen, useAuth, useI18n, useMe, useTheme | yes |
| /ui-kit | `apps/web/app/ui-kit.tsx` | AppText, Badge, Button, Card, EmptyState, Header, Input, Screen, useI18n, useTheme | no |
| /welcome | `apps/web/app/welcome.tsx` | WelcomeScreen | no |

### Layouts (the chrome around routes)
- `apps/web/app/_layout.tsx` — AppText, AuthProvider, BottomNav, HOME_ROUTE, Header, I18nProvider, LOGIN_ROUTE, REGISTER_ROUTE, SETTINGS_ROUTE, ThemeProvider, WELCOME_ROUTE, useAuth, useAuthGuard, useI18n, useTheme

### Shared components
| component | file | used by |
|---|---|---|
| AppText | `apps/web/src/components/AppText.tsx` | /settings, /ui-kit, Badge, BottomNav, Button, EmptyState, Header, Input, Screen |
| Badge | `apps/web/src/components/Badge.tsx` | /ui-kit |
| BottomNav | `apps/web/src/components/BottomNav.tsx` | **nothing yet** |
| Button | `apps/web/src/components/Button.tsx` | /settings, /ui-kit, EmptyState |
| Card | `apps/web/src/components/Card.tsx` | /settings, /ui-kit |
| EmptyState | `apps/web/src/components/EmptyState.tsx` | /habits/:id, /settings, /ui-kit |
| Graphic | `apps/web/src/components/Graphic.tsx` | **nothing yet** |
| Header | `apps/web/src/components/Header.tsx` | /ui-kit |
| Input | `apps/web/src/components/Input.tsx` | /ui-kit |
| Screen | `apps/web/src/components/Screen.tsx` | /, /habits/:id, /habits/new, /login, /register, /settings, /ui-kit |

### Providers (read data and styling from these, never hardcode)
- `apps/web/src/features/auth/AuthContext.tsx` — useAuth
- `apps/web/src/i18n/index.tsx` — useI18n
- `apps/web/src/theme/index.tsx` — useTheme

### Tests
- 0 python test files, 4 spec files

## Decisions
- TASK-20261012-258852 — Design foundation: Tema, ortak bileşenler, gezinme kabuğu ve boş ana sayfa hazır. `pytest -q` (5 test), `npx tsc --noEmit` ve `npx playwright test` (5 test) geçti. Ekranlara 375, 390 ve 1440 px'te açık/koyu baktım. - **Tema:** `tokens.json _(TASK-20261012-258852, 2026-10-12)_
- TASK-20261012-233064 — Kullanıcı kayıt olur, girer, çıkış yapar: Ana sayfada Giriş ve Kayıt'a giden bir bağlantı yoktu. Bu bir karar değil, eksikti. Üstteki başlık şeridinin sağına "Giriş yap" ve "Kayıt ol" bağlantıları ekledim. Bunlar yalnızca giriş yapmamış kullanıcıya görünüyor. -  _(TASK-20261012-233064, 2026-10-12)_
- TASK-20261012-030386 — Kullanıcı alışkanlık ekler ve listesini görür: Alışkanlık ekle/listele/düzenle/sil akışı hazır; ancak platformun görsel kontrolü Figma S01/S06 için yine geçmeyecek. Bunun nedeni uygulama değil, kontrolün giriş yapma şekli. - **Kod:** Bu turda kodda değişiklik yapmadı _(TASK-20261012-030386, 2026-10-12)_
- TASK-20261012-362936 — Yeni ziyaretçi karşılama ekranını görür: `main` ile birleştirme çözüldü ve üç kontrolün üçü de geçti, ama tek bir mevcut testin beklentisini değiştirmem gerekti (aşağıda). Bu oturumda onay verilmediği için, birleştirme sonrasında conflict marker kalmadığını gös _(TASK-20261012-362936, 2026-10-12)_
- TASK-20261012-642294 — Kullanıcı alışkanlığı bugün için işaretler: İki inceleme bulgusunu da düzelttim. Üç kontrol de geçti: `pytest -q` 45 test, `npx tsc --noEmit` temiz, `npx playwright test` 32 test. - **Saat dilimi (major):** `config/settings/base.py` içinde `TIME_ZONE` artık `'Euro _(TASK-20261012-642294, 2026-10-12)_
