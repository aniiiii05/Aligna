from fastapi import FastAPI, APIRouter, Request, HTTPException, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PLAN_GOAL_LIMITS = {"free": 1, "pro": 3, "premium": 10}
PLAN_PRICES = {"pro": 9.99, "premium": 19.99}
SESSION_COUNTS = {"morning": 3, "midday": 6, "night": 9}


# --- Models ---
class SessionExchange(BaseModel):
    session_id: str

class GoalCreate(BaseModel):
    title: str
    affirmation: str
    category: Optional[str] = "general"

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    affirmation: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class RitualEntryCreate(BaseModel):
    goal_id: str
    session_type: str
    writings: List[str]

class CheckoutRequest(BaseModel):
    plan: str
    origin_url: str


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


# --- AUTH ROUTES ---
@api_router.post("/auth/session")
async def exchange_session(body: SessionExchange, response: Response):
    async with httpx.AsyncClient() as http:
        resp = await http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": body.session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid session ID")
        data = resp.json()

    email = data["email"]
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})

    if not user_doc:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "plan": "free",
            "subscription_status": "inactive",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(dict(user_doc))
    else:
        # Update name/picture if changed
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": data.get("name", user_doc.get("name", "")),
                      "picture": data.get("picture", user_doc.get("picture", ""))}}
        )

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    await db.user_sessions.delete_many({"user_id": user_doc["user_id"]})
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/",
        max_age=7 * 24 * 3600
    )

    fresh = await db.users.find_one({"email": email}, {"_id": 0})
    return {"user": fresh}


@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
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
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.goals.insert_one(dict(goal_doc))
    return goal_doc


@api_router.put("/goals/{goal_id}")
async def update_goal(goal_id: str, goal_data: GoalUpdate, user=Depends(get_current_user)):
    update_dict = {k: v for k, v in goal_data.model_dump().items() if v is not None}
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
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

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

    expected = SESSION_COUNTS.get(entry_data.session_type, 3)
    if len(entry_data.writings) != expected:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {expected} writings for {entry_data.session_type} session"
        )

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

    # Calculate longest streak
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
async def create_checkout(body: CheckoutRequest, request: Request, user=Depends(get_current_user)):
    if body.plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan")

    amount = float(PLAN_PRICES[body.plan])
    stripe_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_co = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

    success_url = f"{body.origin_url}/upgrade?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{body.origin_url}/upgrade"

    checkout_req = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": user["user_id"], "plan": body.plan, "email": user["email"]}
    )

    session = await stripe_co.create_checkout_session(checkout_req)

    txn_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "session_id": session.session_id,
        "amount": amount,
        "currency": "usd",
        "plan": body.plan,
        "payment_status": "pending",
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(txn_doc)
    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request, user=Depends(get_current_user)):
    txn = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if txn.get("payment_status") == "paid":
        return txn

    stripe_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_co = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

    status = await stripe_co.get_checkout_status(session_id)
    update_data = {"status": status.status, "payment_status": status.payment_status}

    if status.payment_status == "paid":
        plan = txn.get("plan", "pro")
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"plan": plan, "subscription_status": "active"}}
        )

    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update_data})
    return await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    try:
        stripe_key = os.environ.get("STRIPE_API_KEY")
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_co = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)
        webhook_response = await stripe_co.handle_webhook(body, signature)

        if webhook_response.payment_status == "paid":
            txn = await db.payment_transactions.find_one(
                {"session_id": webhook_response.session_id}, {"_id": 0}
            )
            if txn and txn.get("payment_status") != "paid":
                plan = txn.get("plan", "pro")
                await db.users.update_one(
                    {"user_id": txn["user_id"]},
                    {"$set": {"plan": plan, "subscription_status": "active"}}
                )
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete"}}
                )
    except Exception as e:
        logger.error(f"Webhook error: {e}")
    return {"received": True}


@api_router.get("/")
async def root():
    return {"message": "Aligna API"}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
