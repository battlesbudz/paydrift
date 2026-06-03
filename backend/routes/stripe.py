"""
PayDrift Stripe — Checkout, portal, and webhook handler.
"""
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import stripe
import os

from database import User, get_db
from routes.auth import get_current_user

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

PLANS = {
    "pro": {"name": "PayDrift Pro", "price": 1900, "interval": "month"},
    "agency": {"name": "PayDrift Agency", "price": 4900, "interval": "month"},
}


class CheckoutRequest(BaseModel):
    plan: str  # pro | agency


class PortalRequest(BaseModel):
    return_url: str | None = None


@router.post("/create-checkout")
async def create_checkout(
    data: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan.")

    plan_info = PLANS[data.plan]

    if not user.stripe_customer_id:
        customer = stripe.Customer.create(email=user.email, name=user.name or "")
        user.stripe_customer_id = customer.id
        await db.commit()

    checkout_session = stripe.checkout.Session.create(
        customer=user.stripe_customer_id,
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": plan_info["name"]},
                "unit_amount": plan_info["price"],
                "recurring": {"interval": plan_info["interval"]},
            },
            "quantity": 1,
        }],
        mode="subscription",
        success_url=f"{FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/settings?cancelled=true",
        metadata={"user_id": user.id, "plan": data.plan},
    )

    return {"url": checkout_session.url}


@router.post("/portal")
async def customer_portal(
    data: PortalRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found.")

    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url=data.return_url or f"{FRONTEND_URL}/dashboard",
    )
    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    event = None

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload.")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature.")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("user_id")
        plan = session.get("metadata", {}).get("plan")
        if user_id and plan:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                user.stripe_subscription_id = session.get("subscription")
                user.plan = plan
                await db.commit()

    elif event["type"] == "customer.subscription.updated":
        sub = event["data"]["object"]
        customer_id = sub.get("customer")
        result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
        user = result.scalar_one_or_none()
        if user:
            user.stripe_subscription_id = sub.get("id")
            user.plan = "free" if sub.get("status") != "active" else user.plan
            await db.commit()

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        customer_id = sub.get("customer")
        result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
        user = result.scalar_one_or_none()
        if user:
            user.stripe_subscription_id = None
            user.plan = "free"
            await db.commit()

    return {"received": True}