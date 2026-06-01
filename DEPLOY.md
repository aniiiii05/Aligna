# Deploy Aligna (Flutter + FastAPI on Vercel)

Railway is **no longer used**. The API must run on Vercel (`/api/*`).

## Why alignaa.org can look “stuck on Railway”

| What you see | Cause |
|--------------|--------|
| Old React landing (“Continue with Google”) | Vercel **Root Directory** is still `frontend` and the last successful deploy was the React build — Flutter was never built in production. |
| Login/API broken, or “Application not found” | Older `frontend/vercel.json` proxied `/api` to `practical-healing-production-bb7a.up.railway.app`, but that Railway service is **gone**. Newer config pointed at `../api/index.py`, which Vercel does **not** deploy when the root is `frontend`. |
| Code on GitHub is updated but site is not | Pushing to GitHub does nothing until Vercel **redeploys** and env vars are set on the **Vercel project**. |

**All migration code is on `main` (commit `bfd45e7`+).** The gap is Vercel project settings + env vars + a successful deploy.

## 1. Vercel project settings

In [Vercel Dashboard](https://vercel.com) → **alignaa.org** project → **Settings** → **General**:

### Option A — Quick fix (React UI + Vercel API, works with Root = `frontend`)

| Setting | Value |
|--------|--------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Other |
| Build / Output | From `frontend/vercel.json` (`npm run build` → `build/`) |

Redeploy. `/api/*` uses `frontend/api/index.py` (no Railway).

### Option B — Full Flutter web (recommended when ready)

| Setting | Value |
|--------|--------|
| **Root Directory** | *(empty — repository root)* |
| **Framework Preset** | Other |
| Build / Output | From root `vercel.json` (Flutter web + `api/index.py`) |

Clear any custom Install/Build/Output overrides in the Vercel UI so `vercel.json` controls the build.

## 2. Environment variables

Copy from Railway (or `backend/.env`) into **Vercel → Settings → Environment Variables** for **Production**:

```
ENVIRONMENT=production
MONGO_URL=...
DB_NAME=aligna_db
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://alignaa.org/api/auth/google/callback
FRONTEND_URL=https://alignaa.org
PUBLIC_OAUTH_ORIGIN=https://alignaa.org
CORS_ORIGINS=https://alignaa.org
WAITLIST_ADMIN_KEY=...
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_VARIANT_ID_PRO=...
LEMONSQUEEZY_VARIANT_ID_PREMIUM=...
```

**Important:** `GOOGLE_REDIRECT_URI` must have **no trailing spaces or newlines**.

In **Google Cloud Console** → OAuth client → Authorized redirect URIs, keep exactly:

`https://alignaa.org/api/auth/google/callback`

## 3. Deploy

```bash
cd Aligna
vercel login
vercel link
vercel deploy --prod
```

Or push to `main` if the Git integration is connected.

## 4. Verify production

- `https://alignaa.org/` — Flutter web UI
- `https://alignaa.org/api/` — API health
- `https://alignaa.org/api/auth/google/config-check` — OAuth diagnostics
- Sign in with Google → lands on `/auth/callback?token=...` → home

## 5. Shut down Railway

After Vercel serves `/api` correctly, delete or pause the Railway service so traffic and secrets are not duplicated.

## 6. Mobile (iOS / Android)

On a machine with [Flutter](https://flutter.dev) installed:

```bash
cd aligna_app
flutter create . --project-name aligna_app
flutter pub get
flutter run -d android   # or ios
```

Configure **App Links** / **Universal Links** for `https://alignaa.org/auth/callback` in the generated `android/` and `ios/` projects.

Mobile builds call `https://alignaa.org/api` by default (`lib/core/config/api_config.dart`).

## 7. Lemon Squeezy webhook

Point the webhook URL to:

`https://alignaa.org/api/webhook/lemonsqueezy`
