"""
PayDrift Invoices — CRUD + status management.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
import os

from database import Invoice, Client, User, get_db, generate_id
from routes.auth import get_current_user
from email_service import send_reminder_email

router = APIRouter()


class InvoiceCreate(BaseModel):
    client_id: str
    amount: int  # cents
    currency: str = "USD"
    description: str
    due_date: str  # ISO date string YYYY-MM-DD


class InvoiceUpdate(BaseModel):
    amount: Optional[int] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None


class InvoiceResponse(BaseModel):
    id: str
    client_id: str
    client_name: str
    client_email: str
    amount: int
    currency: str
    description: str
    due_date: str
    status: str
    paid_at: Optional[str]
    reminders_sent: int
    created_at: str
    updated_at: str


@router.get("", response_model=list[InvoiceResponse])
async def list_invoices(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Invoice).where(Invoice.user_id == user.id)
    if status:
        query = query.where(Invoice.status == status)
    if client_id:
        query = query.where(Invoice.client_id == client_id)
    query = query.order_by(Invoice.created_at.desc())

    result = await db.execute(query)
    invoices = result.scalars().all()

    response = []
    for inv in invoices:
        client_result = await db.execute(select(Client).where(Client.id == inv.client_id))
        client = client_result.scalar_one_or_none()
        if client:
            response.append(InvoiceResponse(
                id=inv.id,
                client_id=inv.client_id,
                client_name=client.name,
                client_email=client.email,
                amount=inv.amount,
                currency=inv.currency,
                description=inv.description,
                due_date=inv.due_date.isoformat(),
                status=inv.status,
                paid_at=inv.paid_at.isoformat() if inv.paid_at else None,
                reminders_sent=inv.reminders_sent,
                created_at=inv.created_at.isoformat(),
                updated_at=inv.updated_at.isoformat(),
            ))
    return response


@router.post("", response_model=InvoiceResponse)
async def create_invoice(
    data: InvoiceCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify client belongs to user
    client_result = await db.execute(
        select(Client).where(Client.id == data.client_id, Client.user_id == user.id)
    )
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    # Check plan limits
    from sqlalchemy import func
    if user.plan == "free":
        count_result = await db.execute(
            select(func.count(Invoice.id)).where(Invoice.user_id == user.id)
        )
        if count_result.scalar() >= 5:
            raise HTTPException(status_code=403, detail="Free plan limited to 5 invoices. Upgrade to Pro.")

    due_date = datetime.fromisoformat(data.due_date)
    invoice = Invoice(
        id=generate_id(),
        client_id=data.client_id,
        user_id=user.id,
        amount=data.amount,
        currency=data.currency,
        description=data.description,
        due_date=due_date,
        status="pending",
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    return InvoiceResponse(
        id=invoice.id,
        client_id=invoice.client_id,
        client_name=client.name,
        client_email=client.email,
        amount=invoice.amount,
        currency=invoice.currency,
        description=invoice.description,
        due_date=invoice.due_date.isoformat(),
        status=invoice.status,
        paid_at=None,
        reminders_sent=0,
        created_at=invoice.created_at.isoformat(),
        updated_at=invoice.updated_at.isoformat(),
    )


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.user_id == user.id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    client_result = await db.execute(select(Client).where(Client.id == invoice.client_id))
    client = client_result.scalar_one_or_none()

    return InvoiceResponse(
        id=invoice.id,
        client_id=invoice.client_id,
        client_name=client.name if client else "Unknown",
        client_email=client.email if client else "",
        amount=invoice.amount,
        currency=invoice.currency,
        description=invoice.description,
        due_date=invoice.due_date.isoformat(),
        status=invoice.status,
        paid_at=invoice.paid_at.isoformat() if invoice.paid_at else None,
        reminders_sent=invoice.reminders_sent,
        created_at=invoice.created_at.isoformat(),
        updated_at=invoice.updated_at.isoformat(),
    )


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    data: InvoiceUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.user_id == user.id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    for field in ["amount", "currency", "description", "status"]:
        val = getattr(data, field, None)
        if val is not None:
            setattr(invoice, field, val)

    if data.due_date:
        invoice.due_date = datetime.fromisoformat(data.due_date)

    await db.commit()
    await db.refresh(invoice)

    client_result = await db.execute(select(Client).where(Client.id == invoice.client_id))
    client = client_result.scalar_one_or_none()

    return InvoiceResponse(
        id=invoice.id,
        client_id=invoice.client_id,
        client_name=client.name if client else "Unknown",
        client_email=client.email if client else "",
        amount=invoice.amount,
        currency=invoice.currency,
        description=invoice.description,
        due_date=invoice.due_date.isoformat(),
        status=invoice.status,
        paid_at=invoice.paid_at.isoformat() if invoice.paid_at else None,
        reminders_sent=invoice.reminders_sent,
        created_at=invoice.created_at.isoformat(),
        updated_at=invoice.updated_at.isoformat(),
    )


@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.user_id == user.id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    await db.delete(invoice)
    await db.commit()
    return {"message": "Invoice deleted"}


@router.post("/{invoice_id}/mark-paid")
async def mark_paid(
    invoice_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.user_id == user.id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    invoice.status = "paid"
    invoice.paid_at = datetime.utcnow()
    await db.commit()

    return {"message": "Invoice marked as paid"}


@router.post("/{invoice_id}/send-now")
async def send_reminder_now(
    invoice_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.user_id == user.id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    client_result = await db.execute(select(Client).where(Client.id == invoice.client_id))
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    invoice.reminders_sent += 1
    invoice.last_reminder_sent = datetime.utcnow()
    await db.commit()

    # Send the actual email
    await send_reminder_email(
        user=user,
        client=client,
        invoice=invoice,
        reminder_level=min(invoice.reminders_sent, 5),
        db=db,
    )

    return {"message": f"Reminder {invoice.reminders_sent} sent."}