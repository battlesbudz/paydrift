"""
PayDrift Clients — CRUD endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional

from database import Client, User, get_db, generate_id
from routes.auth import get_current_user

router = APIRouter()


class ClientCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    notes: Optional[str] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    notes: Optional[str] = None


class ClientResponse(BaseModel):
    id: str
    name: str
    email: str
    company: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str
    invoice_count: int = 0
    total_outstanding: int = 0


@router.get("", response_model=list[ClientResponse])
async def list_clients(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.user_id == user.id).order_by(Client.created_at.desc())
    )
    clients = result.scalars().all()

    response = []
    for c in clients:
        # Count invoices and total outstanding
        from sqlalchemy import func
        from database import Invoice
        inv_result = await db.execute(
            select(func.count(Invoice.id), func.coalesce(func.sum(Invoice.amount), 0))
            .where(Invoice.client_id == c.id)
            .where(Invoice.status.in_(["pending", "overdue"]))
        )
        row = inv_result.one()
        response.append(ClientResponse(
            id=c.id,
            name=c.name,
            email=c.email,
            company=c.company,
            notes=c.notes,
            created_at=c.created_at.isoformat(),
            updated_at=c.updated_at.isoformat(),
            invoice_count=row[0] or 0,
            total_outstanding=row[1] or 0,
        ))
    return response


@router.post("", response_model=ClientResponse)
async def create_client(
    data: ClientCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check plan limits
    from sqlalchemy import func
    from database import Invoice
    if user.plan == "free":
        count_result = await db.execute(select(func.count(Client.id)).where(Client.user_id == user.id))
        if count_result.scalar() >= 1:
            raise HTTPException(status_code=403, detail="Free plan limited to 1 client. Upgrade to Pro for unlimited.")

    client = Client(
        id=generate_id(),
        user_id=user.id,
        name=data.name,
        email=data.email.lower(),
        company=data.company,
        notes=data.notes,
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)

    return ClientResponse(
        id=client.id,
        name=client.name,
        email=client.email,
        company=client.company,
        notes=client.notes,
        created_at=client.created_at.isoformat(),
        updated_at=client.updated_at.isoformat(),
        invoice_count=0,
        total_outstanding=0,
    )


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == user.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    from sqlalchemy import func
    from database import Invoice
    inv_result = await db.execute(
        select(func.count(Invoice.id), func.coalesce(func.sum(Invoice.amount), 0))
        .where(Invoice.client_id == client.id)
        .where(Invoice.status.in_(["pending", "overdue"]))
    )
    row = inv_result.one()

    return ClientResponse(
        id=client.id,
        name=client.name,
        email=client.email,
        company=client.company,
        notes=client.notes,
        created_at=client.created_at.isoformat(),
        updated_at=client.updated_at.isoformat(),
        invoice_count=row[0] or 0,
        total_outstanding=row[1] or 0,
    )


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    data: ClientUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == user.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    for field in ["name", "email", "company", "notes"]:
        val = getattr(data, field, None)
        if val is not None:
            setattr(client, field, val.lower() if field == "email" else val)

    await db.commit()
    await db.refresh(client)

    from sqlalchemy import func
    from database import Invoice
    inv_result = await db.execute(
        select(func.count(Invoice.id), func.coalesce(func.sum(Invoice.amount), 0))
        .where(Invoice.client_id == client.id)
        .where(Invoice.status.in_(["pending", "overdue"]))
    )
    row = inv_result.one()

    return ClientResponse(
        id=client.id,
        name=client.name,
        email=client.email,
        company=client.company,
        notes=client.notes,
        created_at=client.created_at.isoformat(),
        updated_at=client.updated_at.isoformat(),
        invoice_count=row[0] or 0,
        total_outstanding=row[1] or 0,
    )


@router.delete("/{client_id}")
async def delete_client(
    client_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == user.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")

    await db.delete(client)
    await db.commit()
    return {"message": "Client deleted"}