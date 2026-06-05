"""
PayDrift Database — SQLite with aiosqlite + SQLAlchemy async.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

_raw = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or ""
if not _raw:
    DATABASE_URL = "sqlite+aiosqlite:///./paydrift.db"
elif _raw.startswith("postgresql://") or _raw.startswith("postgres://"):
    # Try asyncpg first, fall back to SQLite if not installed
    try:
        import asyncpg  # noqa: F401
        DATABASE_URL = _raw.replace("postgres://", "postgresql+asyncpg://", 1).replace("postgresql://", "postgresql+asyncpg://", 1)
    except ImportError:
        print(f"WARNING: asyncpg not installed, falling back to SQLite. POSTGRES_URL={_raw[:50]}...")
        DATABASE_URL = "sqlite+aiosqlite:///./paydrift.db"
else:
    DATABASE_URL = _raw

engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


# ── Models ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    plan = Column(String, default="free")  # free | pro | agency
    plan_trial_ends = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    clients = relationship("Client", back_populates="user", cascade="all, delete-orphan")
    email_logs = relationship("EmailLog", back_populates="user", cascade="all, delete-orphan")


class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="clients")
    invoices = relationship("Invoice", back_populates="client", cascade="all, delete-orphan")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    user_id = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)  # cents
    currency = Column(String, default="USD")
    description = Column(String, nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending | paid | overdue | cancelled
    paid_at = Column(DateTime, nullable=True)
    stripe_invoice_id = Column(String, nullable=True)
    reminders_sent = Column(Integer, default=0)
    last_reminder_sent = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    client = relationship("Client", back_populates="invoices")
    reminders = relationship("Reminder", back_populates="invoice", cascade="all, delete-orphan")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    scheduled_for = Column(DateTime, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    email_log_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="reminders")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    to = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    resend_id = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending | sent | failed
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="email_logs")


# ── Helpers ─────────────────────────────────────────────────────────────────

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def generate_id():
    import uuid
    return uuid.uuid4().hex