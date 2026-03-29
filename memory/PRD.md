# Aligna - PRD

## Project Overview
**App**: Aligna - Manifestation Tracker using the 3-6-9 Technique  
**Type**: Full-stack responsive web app (SaaS)  
**Stack**: React (frontend) + FastAPI (backend) + MongoDB  
**Date Started**: 2026-03-26

## Architecture
- **Frontend**: React (CRA + Craco), TailwindCSS, React Router v7, Axios, Lucide React  
- **Backend**: FastAPI + Motor (async MongoDB) + httpx  
- **Auth**: Google OAuth (session_token cookie, 7-day expiry)  
- **Payments**: Stripe Checkout
- **Assets**: SVG icons at /public/assets/icons/, illustrations at /public/assets/illustrations/

## User Personas
- **Primary**: Spiritual wellness seekers, manifestation practitioners (age 20-45, predominantly female)
- **Secondary**: People interested in mindfulness and law of attraction

## Core Features Implemented

### Authentication (2026-03-26)
- Google OAuth login
- Session token stored in httpOnly cookie (7-day expiry)
- Auth callback handles #session_id= hash fragment
- AuthContext provides global auth state
- ProtectedRoute redirects unauthenticated users to /login

### Goal Management (2026-03-26)
- CRUD for manifestation goals
- Plan limits enforced: Free=1 goal, Pro=3, Premium=10
- Goal categories: General, Abundance, Health, Love, Clarity, Peace
- 403 error returned if goal limit reached with upgrade prompt

### 3-6-9 Ritual System (2026-03-26)
- Morning ritual: write affirmation 3×
- Midday ritual: write affirmation 6×
- Evening ritual: write affirmation 9×
- Immersive distraction-free writing experience
- One session per goal per day (duplicate check)
- Celebration screen with completion animation

### Progress & Streaks (2026-03-26)
- Streak counter (consecutive days with any ritual)
- Longest streak tracking
- 60-day progress calendar with day status (none/partial/full)
- Session type breakdown bars (morning/midday/evening)
- Total sessions counter

### Subscription System (2026-03-26)
- Plans: Seed (Free/$0), Bloom (Pro/$9.99/mo), Radiance (Premium/$19.99/mo)
- Stripe Checkout integration
- Payment status polling after Stripe redirect
- Webhook handler at /api/webhook/stripe
- payment_transactions collection in MongoDB

### UI/UX (2026-03-26)
- Mobile-first design with bottom navigation (5 tabs)
- Desktop top navigation with Aligna logo
- Design system: Sage green (#879C93) + Sand (#FDFBF7) + Warm gold accent
- Fonts: Cormorant Garamond (headings) + Outfit (body) via Google Fonts
- Custom SVG icons from design assets (Lotus, Candle, Mindfulness, Hamsa, etc.)
- Micro-animations: float-up entrance, soft-pulse, glow
- Brand image (1255.png) on landing page

### Notifications (2026-03-26)
- In-app reminder banner on home page
- Browser Notification API permission request
- Toast notification when permission granted

## API Endpoints

### Auth
- POST /api/auth/session — exchange session_id → session_token + set cookie
- GET /api/auth/me — get current user
- POST /api/auth/logout — clear session + cookie

### Goals
- GET /api/goals — list user goals
- POST /api/goals — create goal (plan limit enforced)
- PUT /api/goals/{goal_id} — update goal
- DELETE /api/goals/{goal_id} — soft delete

### Rituals
- GET /api/rituals/today — today's ritual entries
- POST /api/rituals/entry — submit ritual session
- GET /api/rituals/history — recent ritual history

### Progress
- GET /api/progress/streak — streak stats
- GET /api/progress/calendar — 60-day calendar data

### Payments
- POST /api/payments/checkout — create Stripe checkout session
- GET /api/payments/status/{session_id} — poll payment status + upgrade user
- GET /api/payments/subscription — current plan info
- POST /api/webhook/stripe — Stripe webhook handler

## MongoDB Collections
- users
- user_sessions
- goals
- ritual_entries
- payment_transactions

## Test Results (2026-03-26)
- Backend: 100% (12/12 tests passing)
- Frontend: 95% (minor notifications API not available in headless browser)

## Backlog / Next Items

### P0 (Critical for next release)
- [ ] PWA support (service worker for offline + push notifications)
- [ ] Affirmation suggestion when creating goals
- [ ] Multiple goal ritual (ritual for any of N goals)

### P1 (High priority)
- [ ] Onboarding flow (first-time user walkthrough)
- [ ] Goal-specific ritual history view
- [ ] Export progress report (PDF)
- [ ] Social sharing of streak milestones

### P2 (Nice to have)
- [ ] Dark mode
- [ ] Ritual sound/ambient audio
- [ ] Custom notification times
- [ ] Repeat affirmation auto-fill mode
- [ ] Goal archiving (completed intentions)
- [ ] Email digest (weekly progress summary)
