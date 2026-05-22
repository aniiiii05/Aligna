# Deploy Aligna (Flutter + FastAPI on Vercel)

Aligna runs as a **single Vercel project**: Flutter web at `/` and the Python API at `/api/*`. Railway is no longer used.

## 1. Vercel project settings

In [Vercel Dashboard](https://vercel.com) → your **alignaa.org** project:

| Setting | Value |
|--------|--------|
| **Root Directory** | `Aligna` (folder that contains this `vercel.json`) |
| **Framework Preset** | Other |
| Install / Build / Output | From `vercel.json` (do not override unless debugging) |

If Root Directory is still `frontend`, production will keep serving the old React app.

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
