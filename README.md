<div align="center">

<img src="frontend/public/assets/icons/Lotus.svg" alt="Aligna" width="72" height="72" />

# Aligna

### *Manifest with intention.*

A full-stack mindfulness and manifestation web app built around the **3-6-9 method** — write your affirmation 3× in the morning, 6× at midday, and 9× in the evening to align your mindset with your goals.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

---

## What is Aligna?

Aligna is a **daily ritual tracking app** for people who practise manifestation and mindfulness. The core practice is the **3-6-9 method** — popularised by Nikola Tesla's belief in the sacred power of those numbers:

| Session | Time | Repetitions |
|---------|------|-------------|
| 🕯️ Morning | Before noon | Write your affirmation **3×** |
| 🌊 Midday | 12pm – 6pm | Write your affirmation **6×** |
| 🎵 Evening | After 6pm | Write your affirmation **9×** |

Completing all three sessions builds your daily streak and compounds the practice over time.

---

## Features

- **Google OAuth** — one-tap sign-in, no passwords ever stored
- **Manifestation Goals** — create goals with a title, category, and personal affirmation
- **Immersive Ritual Mode** — distraction-free writing screen that guides you through each session
- **Streak Tracking** — daily streak, personal best streak, and total practice days
- **Progress Calendar** — month-view calendar with full/partial completion indicators
- **Session Breakdown** — visualise which sessions you complete most consistently
- **Tiered Plans** — Seed (free · 1 goal), Bloom Pro ($9.99 · 3 goals), Radiance Premium ($19.99 · 10 goals)
- **Lemon Squeezy Payments** — merchant-of-record checkout, no tax complexity for the operator
- **Push Notification Reminders** — browser-based ritual nudges with user permission
- **Timezone-aware** — ritual dates use the user's local timezone, not UTC
- **PWA-ready** — installable on mobile home screen
- **Legal pages** — Terms of Service, Privacy Policy, and Contact/Support

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 (Vite 6) |
| Routing | React Router v7 |
| Styling | Tailwind CSS v3 + shadcn/ui primitives |
| Typography | Cormorant Garamond (headings) + Outfit (body) |
| Forms | React Hook Form + Zod |
| HTTP | Axios (with `withCredentials` for cookie auth) |
| Icons | Lucide React + 30+ custom spiritual SVG icons |

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (Python 3.11+) |
| Database Driver | Motor (async MongoDB) |
| Database | MongoDB Atlas M0 (free tier) |
| Authentication | Google OAuth 2.0 — direct implementation, no SDK |
| Sessions | httpOnly secure cookies with CSRF state validation |
| Payments | Lemon Squeezy (webhook-driven plan upgrade) |
| HTTP Client | httpx (async) |

### Infrastructure
| Service | Purpose | Cost |
|---------|---------|------|
| Vercel | Frontend hosting | Free |
| Render | Backend hosting | Free |
| MongoDB Atlas | Database | Free (M0) |
| Google Cloud Console | OAuth credentials | Free |
| Lemon Squeezy | Payments & subscriptions | 5% + $0.50/txn |

---

## Project Structure

```
Aligna/
├── backend/
│   ├── server.py              # FastAPI app — all API routes
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (not committed)
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       ├── 1255.png           # Hero image
│   │       ├── icons/             # 30+ custom SVG wellness icons
│   │       └── illustrations/     # Mental health illustration set
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorBoundary.js   # App-level crash handler
│   │   │   ├── Navigation.js      # Mobile bottom nav + desktop top nav
│   │   │   └── ProtectedRoute.js  # Auth guard component
│   │   ├── contexts/
│   │   │   └── AuthContext.js     # Global auth state + session management
│   │   ├── pages/
│   │   │   ├── Landing.js         # Marketing / Google sign-in page
│   │   │   ├── Home.js            # Dashboard — streak, today's sessions, CTA
│   │   │   ├── Goals.js           # Create / edit / delete manifestation goals
│   │   │   ├── Ritual.js          # Immersive writing session (select → write → done)
│   │   │   ├── Progress.js        # Calendar view + streak statistics
│   │   │   ├── Upgrade.js         # Subscription plan cards + Lemon Squeezy checkout
│   │   │   ├── Settings.js        # Profile, notification toggle, plan info
│   │   │   ├── Terms.js           # Terms of Service
│   │   │   ├── Privacy.js         # Privacy Policy
│   │   │   ├── Contact.js         # Support contact page
│   │   │   └── NotFound.js        # 404 page
│   │   ├── App.js                 # Router + layout
│   │   ├── index.js               # React entry point
│   │   └── index.css              # Tailwind base + custom keyframe animations
│   ├── index.html                 # Vite HTML entry
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## Local Development

### Prerequisites

- **Node.js** v18 or v20+ (LTS recommended)
- **Python** 3.11+
- **yarn** — `npm install -g yarn`
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free M0 cluster)
- [Google Cloud Console](https://console.cloud.google.com) project with OAuth 2.0 credentials

---

### 1 — Clone the repo

```bash
git clone https://github.com/aniiiii05/Aligna.git
cd Aligna
```

---

### 2 — Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS / Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env` with the values from the [Environment Variables](#environment-variables) table below.

```bash
# Start the dev server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

- API base: `http://localhost:8001/api/`
- Interactive docs: `http://localhost:8001/docs`

---

### 3 — Frontend setup

```bash
cd frontend
yarn install
yarn start
# Opens http://localhost:3000
```

---

### 4 — Google OAuth (local)

In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → your OAuth 2.0 client:

| Field | Value |
|-------|-------|
| Authorised JavaScript origins | `http://localhost:3000` |
| Authorised redirect URIs | `http://localhost:8001/api/auth/google/callback` |

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Database name | `aligna_db` |
| `ENVIRONMENT` | `development` or `production` | `development` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `981849...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:8001/api/auth/google/callback` |
| `FRONTEND_URL` | Frontend origin — no trailing slash | `http://localhost:3000` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `LEMONSQUEEZY_API_KEY` | LS → Settings → API | `eyJ...` |
| `LEMONSQUEEZY_STORE_ID` | LS store ID (number) | `12345` |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | LS webhook signing secret | `whsec_...` |
| `LEMONSQUEEZY_VARIANT_ID_PRO` | Variant ID of Bloom ($9.99/mo) | `98765` |
| `LEMONSQUEEZY_VARIANT_ID_PREMIUM` | Variant ID of Radiance ($19.99/mo) | `98766` |

### `frontend/.env.local`

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend URL, no trailing slash — e.g. `http://localhost:8001` |

---

## Deployment

### Frontend → Vercel

1. Import this GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** → `frontend`
3. Add environment variable: `VITE_BACKEND_URL` = your Render backend URL
4. Deploy — Vercel auto-deploys on every push to `main`

### Backend → Render

1. New Web Service at [render.com](https://render.com)
2. Connect this GitHub repo, **Root Directory** → `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from the table above
6. Deploy

### Post-deployment checklist

- [ ] Set `ENVIRONMENT=production` on Render
- [ ] Update `GOOGLE_REDIRECT_URI` to `https://<render-url>/api/auth/google/callback`
- [ ] Add Render URL to Google OAuth → Authorised redirect URIs
- [ ] Add Vercel URL to Google OAuth → Authorised JavaScript origins
- [ ] Set `FRONTEND_URL` + `CORS_ORIGINS` to your Vercel URL on Render
- [ ] Set `VITE_BACKEND_URL` to your Render URL on Vercel
- [ ] Add Lemon Squeezy webhook: `https://<render-url>/api/webhook/lemonsqueezy`

---

## Payments — Lemon Squeezy Setup

Lemon Squeezy is the **merchant of record** — they collect and remit sales tax globally, so you don't need a business entity to start selling.

1. Sign up free at [app.lemonsqueezy.com](https://app.lemonsqueezy.com)
2. Settings → Store → set store slug (e.g. `aligna`) and connect payout method
3. Create two **Subscription** products:
   - **Bloom** — $9.99/month → copy Variant ID → `LEMONSQUEEZY_VARIANT_ID_PRO`
   - **Radiance** — $19.99/month → copy Variant ID → `LEMONSQUEEZY_VARIANT_ID_PREMIUM`
4. Settings → API → create key → `LEMONSQUEEZY_API_KEY`
5. Settings → Store ID number → `LEMONSQUEEZY_STORE_ID`
6. Settings → Webhooks → add endpoint → enable `order_created` + `subscription_created` → copy secret → `LEMONSQUEEZY_WEBHOOK_SECRET`

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/auth/google/login` | — | Returns Google OAuth URL |
| `GET` | `/api/auth/google/callback` | — | OAuth callback — sets session cookie, redirects to app |
| `GET` | `/api/auth/me` | ✅ | Returns authenticated user profile |
| `POST` | `/api/auth/logout` | ✅ | Clears session cookie |
| `GET` | `/api/goals` | ✅ | List user's active goals |
| `POST` | `/api/goals` | ✅ | Create a new goal |
| `PUT` | `/api/goals/:id` | ✅ | Update a goal |
| `DELETE` | `/api/goals/:id` | ✅ | Soft-delete a goal |
| `GET` | `/api/rituals/today` | ✅ | Today's completed sessions |
| `POST` | `/api/rituals/entry` | ✅ | Submit a completed ritual session |
| `GET` | `/api/rituals/history` | ✅ | Recent ritual history (max 100) |
| `GET` | `/api/progress/streak` | ✅ | Current streak + longest streak + total days |
| `GET` | `/api/progress/calendar` | ✅ | 60-day calendar completion data |
| `GET` | `/api/payments/subscription` | ✅ | Current plan + goal limit |
| `POST` | `/api/payments/checkout` | ✅ | Create Lemon Squeezy checkout session |
| `POST` | `/api/webhook/lemonsqueezy` | — | LS payment webhook (upgrades user plan) |

---

## Security

- **No passwords** — Google OAuth only, no credential storage
- **CSRF protection** — OAuth state parameter verified via httpOnly cookie
- **httpOnly cookies** — session tokens inaccessible to JavaScript
- **Input validation** — title ≤200 chars, affirmation ≤1000 chars, writings validated server-side
- **Ownership enforcement** — every data endpoint checks `user_id` matches the session
- **CORS locked** — no wildcard; restricted to the configured `CORS_ORIGINS` value
- **Webhook HMAC verification** — `X-Signature` header verified on all Lemon Squeezy webhook calls
- **Rate-limited inputs** — history endpoint capped at 100 records

---

## Subscription Plans

| Plan | Price | Goals | Features |
|------|-------|-------|---------|
| **Seed** | Free forever | 1 | 3-6-9 ritual, streak tracking, calendar |
| **Bloom** | $9.99/month | 3 | All Seed features + priority support |
| **Radiance** | $19.99/month | 10 | All Bloom features + early access |

---

## Roadmap

- [ ] Android app (React Native)
- [ ] iOS app (React Native)
- [ ] Scheduled push notifications (service worker + cron)
- [ ] Affirmation audio playback (text-to-speech)
- [ ] Community goals and shared intentions
- [ ] Weekly reflection journal entry
- [ ] Dark / night mode

---

## Design System

The palette is warm, grounded, and intentional:

| Token | Hex | Usage |
|-------|-----|-------|
| `aligna-bg` | `#FDFBF7` | Page background — warm cream |
| `aligna-surface` | `#FFFFFF` | Card background |
| `aligna-primary` | `#879C93` | Sage green — buttons, active states, streaks |
| `aligna-accent` | `#D4A373` | Warm gold — ritual counts, highlights |
| `aligna-text` | `#2C3531` | Primary text |
| `aligna-text-secondary` | `#6E7A75` | Muted labels |
| `aligna-border` | `#E6E2D8` | Subtle dividers |

**Fonts:** Cormorant Garamond (serif headings) + Outfit (sans body text)

**Icons:** 30+ hand-selected spiritual / wellness SVGs — Lotus, Hamsa, Ajna, Yin Yang, Singing Bowl, Candle, Mindfulness, and more.

---

## Contact

Questions, bugs, or feedback → **alignaa.io@gmail.com**

---

<div align="center">

*Built with intention.*

</div>
