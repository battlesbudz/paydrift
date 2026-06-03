"""
PayDrift Auth — JWT-based authentication with magic link via Resend.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os, secrets

from database import User, get_db, generate_id

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = int(os.getenv("JWT_EXPIRE_MINUTES", "10080")) // 60 // 24

magic_links = {}  # token -> {email, user_id, expires_at}


# ── Pydantic models ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class MagicLinkResponse(BaseModel):
    message: str


class MeResponse(BaseModel):
    id: str
    email: str
    name: str | None
    plan: str


# ── Token helpers ────────────────────────────────────────────────────────────

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


async def get_current_user(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency — resolve the current authenticated user from the Bearer token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header.")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header.")
    token = authorization.replace("Bearer ", "")
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")
    return user


# ── Email helpers ────────────────────────────────────────────────────────────

def send_magic_link_email(email: str, token: str):
    import resend
    resend.api_key = os.getenv("RESEND_API_KEY")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    magic_link = f"{frontend_url}/verify?token={token}"
    resend.Emails.send({
        "from": "PayDrift <hello@paydrift.app>",
        "to": email,
        "subject": "Your PayDrift login link",
        "html": f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #5B6AF0;">Your PayDrift login link</h2>
            <p>Click below to sign in to your PayDrift account:</p>
            <a href="{magic_link}" style="display:inline-block;background:#5B6AF0;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Sign in to PayDrift</a>
            <p style="color:#6B7280;font-size:13px;">This link expires in 15 minutes.</p>
        </div>
        """,
    })


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email.lower()))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user = User(id=generate_id(), email=data.email.lower(), name=data.name, plan="free")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return TokenResponse(
        access_token=create_token(user.id),
        user={"id": user.id, "email": user.email, "name": user.name, "plan": user.plan},
    )


@router.post("/login", response_model=MagicLinkResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email.lower()))
    user = result.scalar_one_or_none()
    if not user:
        user = User(id=generate_id(), email=data.email.lower())
        db.add(user)
        await db.commit()
    token = secrets.token_urlsafe(32)
    magic_links[token] = {
        "email": user.email,
        "user_id": user.id,
        "expires": datetime.utcnow() + timedelta(minutes=15),
    }
    try:
        send_magic_link_email(user.email, token)
    except Exception as e:
        print(f"[PayDrift] Failed to send magic link: {e}")
    return MagicLinkResponse(message="Check your email for a login link.")


@router.post("/verify", response_model=TokenResponse)
async def verify(token: str, db: AsyncSession = Depends(get_db)):
    link = magic_links.pop(token, None)
    if not link or link["expires"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired magic link.")
    result = await db.execute(select(User).where(User.id == link["user_id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return TokenResponse(
        access_token=create_token(user.id),
        user={"id": user.id, "email": user.email, "name": user.name, "plan": user.plan},
    )


@router.get("/me", response_model=MeResponse)
async def get_me(user: User = Depends(get_current_user)):
    return MeResponse(id=user.id, email=user.email, name=user.name, plan=user.plan)