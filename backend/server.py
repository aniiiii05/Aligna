from fastapi import FastAPI, APIRouter, Request, HTTPException, Response, Depends
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import hmac
import hashlib
import secrets
from urllib.parse import urlencode, urlparse, urlunsplit
from pathlib import Path
import re as _re
from pydantic import BaseModel, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import certifi
from collections import defaultdict, deque

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
# certifi provides the correct CA bundle for MongoDB Atlas TLS on Python 3.12 / cloud hosts
client = AsyncIOMotorClient(
    mongo_url,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000,
)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PLAN_GOAL_LIMITS = {"free": 1, "pro": 3, "premium": 10}
PLAN_PRICES = {"pro": 9.99, "premium": 19.99}
SESSION_COUNTS = {"morning": 3, "midday": 6, "night": 9}  # legacy fallback

# All supported techniques: technique_id → {session_id → expected_writings_count}
TECHNIQUE_SESSIONS = {
    "369":                  {"morning": 3, "midday": 6, "night": 9},
    "55x5":                 {"daily": 55},
    "scripting":            {"daily": 1},
    "gratitude":            {"morning": 5, "night": 5},
    "visualization":        {"daily": 1},
    "two-cup":              {"from": 1, "to": 1},
    "pillow":               {"night": 3},
    "mirror-work":          {"morning": 5, "midday": 5, "night": 5},
    "future-self":          {"daily": 1},
    "affirmation-stacking": {"morning": 5, "night": 5},
}
LEMONSQUEEZY_API_BASE = "https://api.lemonsqueezy.com"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

# Cookie security: production requires Secure + SameSite=None for cross-domain;
# local HTTP dev requires Secure=False + SameSite=Lax (localhost is same-site).
IS_PRODUCTION = os.environ.get("ENVIRONMENT", "development") == "production"
COOKIE_SECURE = IS_PRODUCTION
COOKIE_SAMESITE = "none" if IS_PRODUCTION else "lax"
RATE_LIMIT_BUCKETS: dict[str, deque] = defaultdict(deque)


def _strip_env(value: str | None) -> str:
    if not value:
        return ""
    # Remove invisible line-break/tab characters often introduced by copy-paste
    # in cloud env var UIs; these can break OAuth redirect_uri matching.
    cleaned = value.replace("\r", "").replace("\n", "").replace("\t", "")
    return cleaned.strip().strip('"').strip("'")


def _is_loopback_host(host: str) -> bool:
    if not host:
        return False
    h = host.lower()
    if h in ("localhost", "127.0.0.1", "::1"):
        return True
    return h.startswith("127.")


def _is_loopback_redirect_uri(uri: str) -> bool:
    """True if redirect URI clearly targets local development (not valid on production hosts)."""
    if not uri:
        return False
    try:
        p = urlparse(uri)
        return _is_loopback_host((p.hostname or "").lower())
    except Exception:
        return False


def _normalize_forwarded_host(host: str) -> str:
    h = host.strip().lower()
    if h.endswith(":443"):
        return h[:-4]
    if h.endswith(":80"):
        return h[:-3]
    return h


def _enforce_https_redirect_uri(uri: str) -> str:
    """Google requires HTTPS for non-localhost redirect URIs (RFC / OAuth validation rules)."""
    try:
        p = urlparse(uri)
        host = (p.hostname or "").lower()
        if not host or _is_loopback_host(host):
            return uri
        if p.scheme == "http":
            return urlunsplit(("https", p.netloc, p.path, p.query, ""))
        return uri
    except Exception:
        return uri


def _finalize_oauth_redirect_uri(uri: str) -> str:
    """Lowercase scheme/host, strip trailing slash on path — must match Google Console byte-for-byte."""
    try:
        p = urlparse(uri)
        path = (p.path or "").rstrip("/")
        if not path:
            path = "/"
        scheme = (p.scheme or "https").lower()
        netloc = (p.netloc or "").lower()
        return urlunsplit((scheme, netloc, path, "", ""))
    except Exception:
        return uri


def _public_oauth_origin_from_env() -> str | None:
    """Optional fixed public origin — set on Railway to avoid bad X-Forwarded-Proto (e.g. http)."""
    raw = _strip_env(os.environ.get("PUBLIC_OAUTH_ORIGIN") or os.environ.get("OAUTH_PUBLIC_ORIGIN"))
    if not raw:
        return None
    raw = raw.rstrip("/")
    parsed = urlparse(raw if "://" in raw else f"https://{raw}")
    if not parsed.netloc:
        return None
    host = (parsed.hostname or "").lower()
    if _is_loopback_host(host):
        scheme = parsed.scheme if parsed.scheme in ("http", "https") else "http"
    else:
        scheme = "https"
    return f"{scheme}://{parsed.netloc}".rstrip("/")


def _forwarded_public_origin(request: Request) -> str | None:
    """Browser-facing origin when the API is behind a reverse proxy (e.g. Vercel → Railway)."""
    fh_raw = request.headers.get("x-forwarded-host", "").split(",")[0].strip()
    if not fh_raw:
        return None
    fh = _normalize_forwarded_host(fh_raw)
    ph = urlparse(f"https://{fh}")
    host = (ph.hostname or "").lower()
    netloc = ph.netloc or fh
    proto = request.headers.get("x-forwarded-proto", "").split(",")[0].strip().lower()
    # Google rejects non-HTTPS redirect URIs for real domains. Proxies sometimes send
    # X-Forwarded-Proto: http incorrectly — always use https for non-loopback hosts.
    if _is_loopback_host(host):
        if proto not in ("http", "https"):
            proto = "http"
    else:
        proto = "https"
    return f"{proto}://{netloc}".rstrip("/")


def _google_oauth_redirect_uri(request: Request) -> str:
    """OAuth redirect_uri — must match Google Cloud Console and the token exchange request."""
    fixed = _public_oauth_origin_from_env()
    if fixed:
        return _finalize_oauth_redirect_uri(
            _enforce_https_redirect_uri(f"{fixed}/api/auth/google/callback")
        )

    explicit = _strip_env(os.environ.get("GOOGLE_REDIRECT_URI"))
    explicit = _enforce_https_redirect_uri(explicit) if explicit else ""
    pub = _forwarded_public_origin(request)

    if explicit and not _is_loopback_redirect_uri(explicit):
        return _finalize_oauth_redirect_uri(explicit)

    if pub:
        return _finalize_oauth_redirect_uri(
            _enforce_https_redirect_uri(f"{pub}/api/auth/google/callback")
        )

    if explicit:
        return _finalize_oauth_redirect_uri(explicit)

    fe = _strip_env(os.environ.get("FRONTEND_URL")).rstrip("/")
    if fe:
        parsed = urlparse(fe if "://" in fe else f"https://{fe}")
        if parsed.scheme and parsed.netloc:
            origin = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
            origin = _enforce_https_redirect_uri(origin)
            return _finalize_oauth_redirect_uri(f"{origin}/api/auth/google/callback")

    raise HTTPException(status_code=500, detail="Google OAuth not configured")


def _frontend_browser_base(request: Request) -> str:
    """Absolute base URL for redirects back to the SPA (fixes mis-set FRONTEND_URL behind Vercel)."""
    fixed = _public_oauth_origin_from_env()
    if fixed:
        return fixed
    pub = _forwarded_public_origin(request)
    if pub:
        return pub
    fe = _strip_env(os.environ.get("FRONTEND_URL")).rstrip("/")
    base = fe.split("#")[0].rstrip("/") if fe else ""
    return _enforce_https_redirect_uri(base) if base else ""


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limit_or_429(key: str, max_requests: int, window_seconds: int) -> None:
    now = datetime.now(timezone.utc).timestamp()
    bucket = RATE_LIMIT_BUCKETS[key]

    while bucket and (now - bucket[0]) > window_seconds:
        bucket.popleft()

    if len(bucket) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again shortly.")

    bucket.append(now)


# --- Lemon Squeezy API Helper ---
async def ls_request(method: str, path: str, **kwargs) -> dict:
    api_key = os.environ.get("LEMONSQUEEZY_API_KEY", "")
    if not api_key or api_key.startswith("your_"):
        raise HTTPException(status_code=503, detail="Payments are not configured yet. Please contact support.")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
    }
    async with httpx.AsyncClient(timeout=30.0) as http:
        resp = await http.request(
            method,
            f"{LEMONSQUEEZY_API_BASE}{path}",
            headers=headers,
            **kwargs
        )
        if not resp.is_success:
            logger.error(f"Lemon Squeezy API error {resp.status_code}: {resp.text}")
            raise HTTPException(status_code=502, detail="Payment provider error. Please try again.")
        return resp.json()


# --- Models ---
class GoalCreate(BaseModel):
    title: str
    affirmation: str
    category: Optional[str] = "general"
    technique_id: Optional[str] = "369"

    model_config = {"str_strip_whitespace": True}

    def model_post_init(self, __context):
        if len(self.title) > 200:
            raise ValueError("title must be 200 characters or fewer")
        if len(self.affirmation) > 1000:
            raise ValueError("affirmation must be 1000 characters or fewer")
        if not self.title.strip():
            raise ValueError("title cannot be blank")
        if not self.affirmation.strip():
            raise ValueError("affirmation cannot be blank")
        if self.technique_id and self.technique_id not in TECHNIQUE_SESSIONS:
            raise ValueError(f"Unknown technique: {self.technique_id}")

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    affirmation: Optional[str] = None
    category: Optional[str] = None
    technique_id: Optional[str] = None
    is_active: Optional[bool] = None

    model_config = {"str_strip_whitespace": True}

    def model_post_init(self, __context):
        if self.title is not None and len(self.title) > 200:
            raise ValueError("title must be 200 characters or fewer")
        if self.affirmation is not None and len(self.affirmation) > 1000:
            raise ValueError("affirmation must be 1000 characters or fewer")
        if self.technique_id is not None and self.technique_id not in TECHNIQUE_SESSIONS:
            raise ValueError(f"Unknown technique: {self.technique_id}")

class RitualEntryCreate(BaseModel):
    goal_id: str
    session_type: str
    writings: List[str]
    local_date: Optional[str] = None  # Client sends YYYY-MM-DD in their local timezone

class CheckoutRequest(BaseModel):
    plan: str
    origin_url: str

class WaitlistSignup(BaseModel):
    email: str

    model_config = {"str_strip_whitespace": True}

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.lower().strip()
        if len(v) > 254:
            raise ValueError("Email address is too long")
        if not _re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', v):
            raise ValueError("Invalid email address")
        return v


# --- Auth Helper ---
async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc.get("expires_at")
    if expires_at:
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return user_doc


# --- AUTH HELPERS ---
def _oauth_state_secret() -> bytes:
    """Return a stable signing secret for stateless OAuth state tokens."""
    raw = (
        os.environ.get("OAUTH_STATE_SECRET")
        or os.environ.get("GOOGLE_CLIENT_SECRET")
        or os.environ.get("WAITLIST_ADMIN_KEY")
    )
    if not raw:
        # Dev fallback only; production should always configure one of the secrets above.
        raw = "aligna-dev-oauth-secret"
    return raw.encode()

def _make_oauth_state() -> str:
    """Generate a self-contained, HMAC-signed state token — no cookie needed.
    Format: <nonce>.<timestamp>.<signature>
    Valid for 15 minutes. Works on all mobile browsers (no cookie required).
    """
    nonce = secrets.token_urlsafe(12)
    ts    = str(int(datetime.now(timezone.utc).timestamp()))
    body  = f"{nonce}.{ts}"
    sig   = hmac.new(_oauth_state_secret(), body.encode(), hashlib.sha256).hexdigest()[:24]
    return f"{body}.{sig}"

def _verify_oauth_state(state: str) -> bool:
    """Verify HMAC signature and expiry (15 min window)."""
    try:
        parts = state.rsplit(".", 1)
        if len(parts) != 2:
            return False
        body, sig = parts
        expected = hmac.new(_oauth_state_secret(), body.encode(), hashlib.sha256).hexdigest()[:24]
        if not hmac.compare_digest(sig, expected):
            return False
        ts = int(body.split(".")[1])
        age = int(datetime.now(timezone.utc).timestamp()) - ts
        return 0 <= age <= 900          # valid for 15 minutes
    except Exception:
        return False


# --- AUTH ROUTES ---
@api_router.get("/auth/google/login")
async def google_login(request: Request):
    """Redirect browser directly to Google OAuth with a stateless HMAC state token.
    No cookie required — works on all browsers including iOS Safari and Android Chrome.
    """
    _rate_limit_or_429(f"oauth_login:{_client_ip(request)}", max_requests=30, window_seconds=60)

    client_id = _strip_env(os.environ.get("GOOGLE_CLIENT_ID"))
    redirect_uri = _google_oauth_redirect_uri(request)
    if not client_id:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    state = _make_oauth_state()
    logger.info("OAuth authorize redirect_uri=%s", redirect_uri)
    params = {
        "client_id":     client_id,
        "redirect_uri":  redirect_uri,
        "response_type": "code",
        "scope":         "openid email profile",
        "access_type":   "online",
        "prompt":        "select_account",
        "state":         state,
    }
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@api_router.get("/auth/google/config-check")
async def google_oauth_config_check(request: Request):
    """Public diagnostics: client_id and redirect_uri your server uses (compare in Google Cloud Console)."""
    out: dict = {
        "client_id": _strip_env(os.environ.get("GOOGLE_CLIENT_ID")) or None,
        "x_forwarded_host": request.headers.get("x-forwarded-host"),
        "x_forwarded_proto": request.headers.get("x-forwarded-proto"),
        "PUBLIC_OAUTH_ORIGIN": _strip_env(os.environ.get("PUBLIC_OAUTH_ORIGIN")) or None,
        "GOOGLE_REDIRECT_URI_env": _strip_env(os.environ.get("GOOGLE_REDIRECT_URI")) or None,
        "FRONTEND_URL": _strip_env(os.environ.get("FRONTEND_URL")) or None,
    }
    try:
        out["redirect_uri_used"] = _google_oauth_redirect_uri(request)
    except HTTPException as exc:
        out["redirect_uri_used"] = None
        out["redirect_uri_error"] = exc.detail
    out["google_console_hint"] = (
        "In Google Cloud → APIs & Services → Credentials → your Web client → "
        "Authorized redirect URIs: add redirect_uri_used exactly (same client_id)."
    )
    return out


@api_router.get("/auth/google/callback")
async def google_callback(request: Request, code: str = None, error: str = None, state: str = None):
    """Handle Google OAuth callback, create session, redirect to frontend."""
    _rate_limit_or_429(f"oauth_callback:{_client_ip(request)}", max_requests=60, window_seconds=300)

    frontend_base = _frontend_browser_base(request)
    oauth_redirect_uri = _google_oauth_redirect_uri(request)

    # Verify stateless HMAC state — no cookie dependency
    if not state or not _verify_oauth_state(state):
        logger.warning("OAuth state verification failed")
        return RedirectResponse(url=f"{frontend_base}/login?error=auth_failed")

    if error or not code:
        return RedirectResponse(url=f"{frontend_base}/login?error=auth_cancelled")

    # Exchange authorization code for tokens
    async with httpx.AsyncClient() as http:
        token_resp = await http.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": _strip_env(os.environ.get("GOOGLE_CLIENT_ID")),
            "client_secret": _strip_env(os.environ.get("GOOGLE_CLIENT_SECRET")),
            "redirect_uri": oauth_redirect_uri,
            "grant_type": "authorization_code",
        })
        if token_resp.status_code != 200:
            logger.error(
                "Google token exchange failed: %s (redirect_uri used: %s)",
                token_resp.text,
                oauth_redirect_uri,
            )
            return RedirectResponse(url=f"{frontend_base}/login?error=auth_failed")

        access_token = token_resp.json().get("access_token")

        # Fetch user profile
        user_resp = await http.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_resp.status_code != 200:
            return RedirectResponse(url=f"{frontend_base}/login?error=auth_failed")

        google_user = user_resp.json()

    email = google_user.get("email")
    if not email:
        return RedirectResponse(url=f"{frontend_base}/login?error=auth_failed")

    # Create or update user record
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not user_doc:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": google_user.get("name", ""),
            "picture": google_user.get("picture", ""),
            "plan": "free",
            "subscription_status": "inactive",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(dict(user_doc))
    else:
        await db.users.update_one(
            {"email": email},
            {"$set": {
                "name": google_user.get("name", user_doc.get("name", "")),
                "picture": google_user.get("picture", user_doc.get("picture", ""))
            }}
        )
        user_doc = await db.users.find_one({"email": email}, {"_id": 0})

    # Create session token
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    await db.user_sessions.delete_many({"user_id": user_doc["user_id"]})
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # Encode minimal user data into the redirect URL so the frontend can hydrate
    # the auth state without making a second /api/auth/me round-trip.
    # This eliminates the race condition on mobile (iOS Safari ITP, Android Chrome)
    # where the Bearer token wasn't yet applied when the me-check fired.
    import base64
    user_summary = json.dumps({
        "user_id": user_doc["user_id"],
        "email": user_doc.get("email", ""),
        "name": user_doc.get("name", ""),
        "picture": user_doc.get("picture", ""),
        "plan": user_doc.get("plan", "free"),
    }, separators=(',', ':'))
    user_b64 = base64.urlsafe_b64encode(user_summary.encode()).decode().rstrip('=')

    redirect = RedirectResponse(url=f"{frontend_base}/auth/callback?token={session_token}&ud={user_b64}")
    redirect.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE, path="/",
        max_age=7 * 24 * 3600
    )
    return redirect


@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", samesite=COOKIE_SAMESITE, secure=COOKIE_SECURE)
    return {"message": "Logged out"}


# --- GOALS ROUTES ---
@api_router.get("/goals")
async def get_goals(user=Depends(get_current_user)):
    goals = await db.goals.find(
        {"user_id": user["user_id"], "is_active": True}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return goals


@api_router.post("/goals")
async def create_goal(goal_data: GoalCreate, user=Depends(get_current_user)):
    limit = PLAN_GOAL_LIMITS.get(user["plan"], 1)
    count = await db.goals.count_documents({"user_id": user["user_id"], "is_active": True})
    if count >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Goal limit reached for {user['plan']} plan. Upgrade to add more goals."
        )

    goal_id = f"goal_{uuid.uuid4().hex[:12]}"
    goal_doc = {
        "goal_id": goal_id,
        "user_id": user["user_id"],
        "title": goal_data.title,
        "affirmation": goal_data.affirmation,
        "category": goal_data.category or "general",
        "technique_id": goal_data.technique_id or "369",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.goals.insert_one(dict(goal_doc))
    return goal_doc


@api_router.put("/goals/{goal_id}")
async def update_goal(goal_id: str, goal_data: GoalUpdate, user=Depends(get_current_user)):
    update_dict = goal_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data")
    result = await db.goals.update_one(
        {"goal_id": goal_id, "user_id": user["user_id"]},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return await db.goals.find_one({"goal_id": goal_id}, {"_id": 0})


@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user=Depends(get_current_user)):
    result = await db.goals.update_one(
        {"goal_id": goal_id, "user_id": user["user_id"]},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal removed"}


# --- RITUAL ROUTES ---
@api_router.get("/rituals/today")
async def get_today_rituals(request: Request, user=Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    goal_id = request.query_params.get("goal_id")
    query = {"user_id": user["user_id"], "date": today}
    if goal_id:
        query["goal_id"] = goal_id
    entries = await db.ritual_entries.find(query, {"_id": 0}).to_list(100)
    return entries


@api_router.post("/rituals/entry")
async def create_ritual_entry(entry_data: RitualEntryCreate, user=Depends(get_current_user)):
    utc_today = datetime.now(timezone.utc).date()
    if entry_data.local_date:
        try:
            local_dt = datetime.strptime(entry_data.local_date, "%Y-%m-%d").date()
            # Accept if within 1 calendar day of UTC (covers all real timezones)
            if abs((local_dt - utc_today).days) <= 1:
                today = entry_data.local_date
            else:
                today = utc_today.strftime("%Y-%m-%d")
        except ValueError:
            today = utc_today.strftime("%Y-%m-%d")
    else:
        today = utc_today.strftime("%Y-%m-%d")

    existing = await db.ritual_entries.find_one({
        "user_id": user["user_id"],
        "goal_id": entry_data.goal_id,
        "date": today,
        "session_type": entry_data.session_type
    })
    if existing:
        raise HTTPException(status_code=400, detail="Session already completed today")

    goal = await db.goals.find_one(
        {"goal_id": entry_data.goal_id, "user_id": user["user_id"], "is_active": True},
        {"_id": 0}
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Validate session_type and writings count against the goal's technique
    technique_id = goal.get("technique_id", "369") or "369"
    valid_sessions = TECHNIQUE_SESSIONS.get(technique_id, SESSION_COUNTS)
    if entry_data.session_type not in valid_sessions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid session '{entry_data.session_type}' for technique '{technique_id}'"
        )
    expected = valid_sessions[entry_data.session_type]
    if len(entry_data.writings) != expected:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {expected} writings for '{entry_data.session_type}' session"
        )
    for w in entry_data.writings:
        if not w.strip():
            raise HTTPException(status_code=400, detail="Writings cannot be blank")
        if len(w) > 1000:
            raise HTTPException(status_code=400, detail="Each writing must be 1000 characters or fewer")

    entry_id = f"entry_{uuid.uuid4().hex[:12]}"
    entry_doc = {
        "entry_id": entry_id,
        "user_id": user["user_id"],
        "goal_id": entry_data.goal_id,
        "date": today,
        "session_type": entry_data.session_type,
        "writings": entry_data.writings,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ritual_entries.insert_one(dict(entry_doc))
    return entry_doc


@api_router.get("/rituals/history")
async def get_ritual_history(user=Depends(get_current_user), limit: int = 30):
    limit = min(max(1, limit), 100)  # cap between 1 and 100
    entries = await db.ritual_entries.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("completed_at", -1).to_list(limit)
    return entries


# --- PROGRESS ROUTES ---
@api_router.get("/progress/streak")
async def get_streak(user=Depends(get_current_user)):
    today = datetime.now(timezone.utc).date()
    entries = await db.ritual_entries.find(
        {"user_id": user["user_id"]}, {"date": 1, "_id": 0}
    ).to_list(2000)

    dates_with_activity = set(e["date"] for e in entries)
    total_days = len(dates_with_activity)

    streak = 0
    current_date = today
    while True:
        date_str = current_date.strftime("%Y-%m-%d")
        if date_str not in dates_with_activity:
            break
        streak += 1
        current_date = current_date - timedelta(days=1)

    sorted_dates = sorted(dates_with_activity)
    longest = 0
    run = 0
    prev = None
    for d in sorted_dates:
        dt = datetime.strptime(d, "%Y-%m-%d").date()
        if prev and (dt - prev).days == 1:
            run += 1
        else:
            run = 1
        longest = max(longest, run)
        prev = dt

    return {"streak": streak, "longest_streak": longest, "total_days": total_days}


@api_router.get("/progress/calendar")
async def get_calendar(user=Depends(get_current_user)):
    sixty_days_ago = (datetime.now(timezone.utc) - timedelta(days=60)).strftime("%Y-%m-%d")
    entries = await db.ritual_entries.find(
        {"user_id": user["user_id"], "date": {"$gte": sixty_days_ago}},
        {"date": 1, "session_type": 1, "_id": 0}
    ).to_list(1000)

    calendar = {}
    for entry in entries:
        date = entry["date"]
        if date not in calendar:
            calendar[date] = []
        if entry["session_type"] not in calendar[date]:
            calendar[date].append(entry["session_type"])

    total_sessions = await db.ritual_entries.count_documents({"user_id": user["user_id"]})
    return {"calendar": calendar, "total_sessions": total_sessions}


# --- PAYMENT ROUTES ---
@api_router.get("/payments/subscription")
async def get_subscription(user=Depends(get_current_user)):
    return {
        "plan": user["plan"],
        "subscription_status": user.get("subscription_status", "inactive"),
        "goal_limit": PLAN_GOAL_LIMITS.get(user["plan"], 1)
    }


@api_router.post("/payments/checkout")
async def create_checkout(body: CheckoutRequest, user=Depends(get_current_user)):
    allowed_origin = urlparse(os.environ.get("FRONTEND_URL", "")).netloc
    provided_origin = urlparse(body.origin_url).netloc
    if not allowed_origin or not provided_origin or provided_origin != allowed_origin:
        raise HTTPException(status_code=400, detail="Invalid checkout origin")

    if body.plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan")

    variant_id = os.environ.get(f"LEMONSQUEEZY_VARIANT_ID_{body.plan.upper()}")
    store_id = os.environ.get("LEMONSQUEEZY_STORE_ID")
    if not variant_id or not store_id or variant_id.startswith("your_"):
        raise HTTPException(status_code=500, detail=f"Payment not configured for {body.plan} plan")

    # Redirect after payment: our own URL with plan query param so frontend knows which plan was bought
    success_url = f"{body.origin_url}/upgrade?checkout=success&plan={body.plan}"

    checkout_payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "checkout_data": {
                    "email": user["email"],
                    "name": user.get("name", ""),
                    "custom": {
                        "user_id": user["user_id"],
                        "plan": body.plan
                    }
                },
                "product_options": {
                    "redirect_url": success_url,
                    "enabled_variants": [int(variant_id)]
                },
                "expires_at": None
            },
            "relationships": {
                "store": {"data": {"type": "stores", "id": str(store_id)}},
                "variant": {"data": {"type": "variants", "id": str(variant_id)}}
            }
        }
    }

    try:
        checkout = await ls_request("POST", "/v1/checkouts", json=checkout_payload)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    checkout_id = checkout["data"]["id"]
    checkout_url = checkout["data"]["attributes"]["url"]

    txn_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "checkout_id": checkout_id,
        "amount": float(PLAN_PRICES[body.plan]),
        "currency": "usd",
        "plan": body.plan,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(txn_doc)
    return {"url": checkout_url, "checkout_id": checkout_id}


@api_router.get("/payments/status/{checkout_id}")
async def get_payment_status(checkout_id: str, user=Depends(get_current_user)):
    """Returns the stored transaction record. Plan upgrade is handled by webhook."""
    txn = await db.payment_transactions.find_one(
        {"checkout_id": checkout_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


@api_router.post("/webhook/lemonsqueezy")
async def lemonsqueezy_webhook(request: Request):
    """Lemon Squeezy sends this when a payment is confirmed. Updates user plan."""
    payload = await request.body()
    webhook_secret = os.environ.get("LEMONSQUEEZY_WEBHOOK_SECRET", "")

    # Verify signature (HMAC-SHA256 of raw body with secret)
    if webhook_secret and not webhook_secret.startswith("your_"):
        signature = request.headers.get("X-Signature", "")
        expected = hmac.new(
            webhook_secret.encode(), payload, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            logger.warning("Lemon Squeezy webhook: invalid signature")
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        event = json.loads(payload)
        event_name = event.get("meta", {}).get("event_name", "")

        # Both one-time orders and subscriptions trigger plan upgrade
        if event_name in ("order_created", "subscription_created"):
            custom_data = event.get("meta", {}).get("custom_data", {})
            user_id = custom_data.get("user_id")
            plan = custom_data.get("plan", "pro")

            if user_id and plan in PLAN_GOAL_LIMITS:
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"plan": plan, "subscription_status": "active"}}
                )
                # Mark the most recent pending transaction as paid
                txn = await db.payment_transactions.find_one(
                    {"user_id": user_id, "payment_status": "pending"},
                    sort=[("created_at", -1)]
                )
                if txn:
                    order_id = str(event.get("data", {}).get("id", ""))
                    await db.payment_transactions.update_one(
                        {"_id": txn["_id"]},
                        {"$set": {"payment_status": "paid", "order_id": order_id}}
                    )
                logger.info(f"Plan upgraded: user={user_id} plan={plan}")

    except Exception as e:
        logger.error(f"Lemon Squeezy webhook error: {e}")

    return {"received": True}


# --- WAITLIST ROUTES ---
@api_router.post("/waitlist")
async def join_waitlist(body: WaitlistSignup, request: Request):
    """Save an email to the waitlist. Idempotent — returns count either way."""
    _rate_limit_or_429(f"waitlist:{_client_ip(request)}", max_requests=10, window_seconds=600)
    existing = await db.waitlist.find_one({"email": body.email})
    if existing:
        count = await db.waitlist.count_documents({})
        return {"already_joined": True, "count": count}

    await db.waitlist.insert_one({
        "email": body.email,
        "joined_at": datetime.now(timezone.utc).isoformat(),
        "source": "waitlist_page",
    })
    count = await db.waitlist.count_documents({})
    logger.info(f"Waitlist signup: {body.email} (total: {count})")
    return {"success": True, "count": count}


@api_router.get("/waitlist/count")
async def get_waitlist_count():
    """Public endpoint — returns total waitlist signups."""
    count = await db.waitlist.count_documents({})
    return {"count": count}


@api_router.get("/waitlist/admin")
async def get_waitlist_admin(request: Request):
    """Protected analytics endpoint. Requires X-Admin-Key header matching WAITLIST_ADMIN_KEY env var."""
    admin_key = os.environ.get("WAITLIST_ADMIN_KEY", "")
    provided_key = request.headers.get("x-admin-key", "")
    if not admin_key or not provided_key or not hmac.compare_digest(admin_key, provided_key):
        raise HTTPException(status_code=403, detail="Forbidden")

    total = await db.waitlist.count_documents({})
    signups = await db.waitlist.find({}, {"_id": 0}).sort("joined_at", -1).to_list(500)

    # Aggregate by day (last 30 days)
    from collections import Counter
    daily: Counter = Counter()
    for s in signups:
        day = (s.get("joined_at") or "")[:10]
        if day:
            daily[day] += 1

    return {
        "total": total,
        "recent": signups[:100],
        "daily_breakdown": dict(sorted(daily.items(), reverse=True)[:30]),
    }


@api_router.get("/")
async def root(request: Request):
    """GET /api — add ?oauth_debug=1 for OAuth diagnostics (same data as /api/auth/google/config-check)."""
    payload: dict = {"message": "Aligna API"}
    if request.query_params.get("oauth_debug") == "1":
        oauth: dict = {
            "client_id": _strip_env(os.environ.get("GOOGLE_CLIENT_ID")) or None,
            "x_forwarded_host": request.headers.get("x-forwarded-host"),
            "x_forwarded_proto": request.headers.get("x-forwarded-proto"),
            "PUBLIC_OAUTH_ORIGIN": _strip_env(os.environ.get("PUBLIC_OAUTH_ORIGIN")) or None,
            "GOOGLE_REDIRECT_URI_env": _strip_env(os.environ.get("GOOGLE_REDIRECT_URI")) or None,
            "FRONTEND_URL": _strip_env(os.environ.get("FRONTEND_URL")) or None,
        }
        try:
            oauth["redirect_uri_used"] = _google_oauth_redirect_uri(request)
        except HTTPException as exc:
            oauth["redirect_uri_used"] = None
            oauth["redirect_uri_error"] = exc.detail
        oauth["hint"] = (
            "Authorized redirect URIs (Google Cloud → Credentials → this Web client) "
            "must include redirect_uri_used exactly."
        )
        payload["oauth"] = oauth
    return payload


app.include_router(api_router)
_cors_origins_raw = os.environ.get('CORS_ORIGINS', '').strip()
_cors_origins = [o.strip() for o in _cors_origins_raw.split(',') if o.strip()] if _cors_origins_raw else []
if not _cors_origins:
    # Fallback: use FRONTEND_URL if CORS_ORIGINS is not set
    _frontend = os.environ.get('FRONTEND_URL', '').strip()
    if _frontend:
        _cors_origins = [_frontend]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
