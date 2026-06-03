"""
Health check endpoint for Railway deployment.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "paydrift"}


@router.get("/api/health")
async def api_health():
    return {"status": "ok", "service": "paydrift", "version": "1.0.0"}