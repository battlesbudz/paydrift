from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from database import engine, Base
from routes import auth, clients, invoices, stripe, dashboard
from scheduler import start_scheduler, stop_scheduler

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://paydrift.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler()
    yield
    stop_scheduler()
    await engine.dispose()


app = FastAPI(
    title="PayDrift API",
    description="Automated invoice chasing for freelancers",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicit API routes - these are ordered FIRST, before any catch-all
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])
app.include_router(stripe.router, prefix="/api/stripe", tags=["stripe"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Serve React frontend built files (SPA) - embedded in backend/static_frontend/
frontend_path = os.path.join(os.path.dirname(__file__), "static_frontend")
if os.path.isdir(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")


@app.get("/")
async def root():
    if os.path.isdir(frontend_path):
        return FileResponse(os.path.join(frontend_path, "index.html"))
    return {"status": "ok", "service": "paydrift-api"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "paydrift"}


# NOTE: No /{path:path} catch-all route.
# FastAPI will return 404 for any unmatched path not covered by:
#   - explicit @app.get() routes above
#   - include_router() prefixed routes (api/auth, api/clients, etc.)
#   - mounted StaticFiles at /static
# This is the correct behavior - Railway Edge handles its own 404 for truly missing paths.