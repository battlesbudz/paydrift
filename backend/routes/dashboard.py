"""
PayDrift Dashboard — Stats and overview.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional

from database import Client, Invoice, User, get_db
from routes.auth import get_current_user

router = APIRouter()


class DashboardStats(BaseModel):
    total_clients: int
    total_invoices: int
    pending_amount: int
    overdue_amount: int
    overdue_count: int
    paid_this_month: int
    plan: str
    plan_display: str
    reminders_sent_total: int


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    # Total clients
    clients_result = await db.execute(
        select(func.count(Client.id)).where(Client.user_id == user.id)
    )
    total_clients = clients_result.scalar() or 0

    # Total invoices
    inv_result = await db.execute(
        select(func.count(Invoice.id), func.coalesce(func.sum(Invoice.amount), 0))
        .where(Invoice.user_id == user.id)
    )
    inv_row = inv_result.one()
    total_invoices = inv_row[0] or 0

    # Pending amount
    pending_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.amount), 0))
        .where(Invoice.user_id == user.id, Invoice.status == "pending")
    )
    pending_amount = pending_result.scalar() or 0

    # Overdue amount + count
    overdue_result = await db.execute(
        select(func.count(Invoice.id), func.coalesce(func.sum(Invoice.amount), 0))
        .where(Invoice.user_id == user.id, Invoice.status == "overdue")
    )
    overdue_row = overdue_result.one()
    overdue_count = overdue_row[0] or 0
    overdue_amount = overdue_row[1] or 0

    # Paid this month
    paid_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.amount), 0))
        .where(Invoice.user_id == user.id, Invoice.status == "paid")
        .where(Invoice.paid_at >= month_start)
    )
    paid_this_month = paid_result.scalar() or 0

    # Total reminders
    rem_result = await db.execute(
        select(func.coalesce(func.sum(Invoice.reminders_sent), 0))
        .where(Invoice.user_id == user.id)
    )
    reminders_sent_total = rem_result.scalar() or 0

    plan_display = {"free": "Free", "pro": "Pro ($19/mo)", "agency": "Agency ($49/mo)"}.get(user.plan, user.plan)

    return DashboardStats(
        total_clients=total_clients,
        total_invoices=total_invoices,
        pending_amount=pending_amount,
        overdue_amount=overdue_amount,
        overdue_count=overdue_count,
        paid_this_month=paid_this_month,
        plan=user.plan,
        plan_display=plan_display,
        reminders_sent_total=reminders_sent_total,
    )