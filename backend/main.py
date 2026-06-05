import sys, os
# Fix Python path so imports work regardless of where Railway runs from
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from database import engine, Base
from routes import auth, clients, invoices, stripe, dashboard
from scheduler import start_scheduler, stop_scheduler

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://paydrift.app")
# Frontend path — built React app lives in backend/static_frontend/
frontend_path = os.path.join(_backend_dir, "static_frontend")


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

# API routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])
app.include_router(stripe.router, prefix="/api/stripe", tags=["stripe"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Serve React frontend built files (SPA) — embedded in backend/static_frontend/
# Mount at /assets and /static for the JS/CSS chunks (legacy + new paths), plus / for the SPA catch-all
if os.path.isdir(frontend_path):
    # Mount at /assets for Vite-built chunks (index.html references /assets/index-*.js)
    app.mount("/assets", StaticFiles(directory=frontend_path, html=False), name="assets")
    # Mount at /static for SPA catch-all (html=True so /static/ returns index.html)
    app.mount("/static", StaticFiles(directory=frontend_path, html=True), name="static")
    app.mount("/icons.svg", StaticFiles(directory=frontend_path), name="icons")
    app.mount("/favicon.svg", StaticFiles(directory=frontend_path), name="favicon")


@app.get("/")
async def root():
    if os.path.isdir(frontend_path):
        return FileResponse(os.path.join(frontend_path, "index.html"))
    return {"status": "ok", "service": "paydrift-api"}


@app.get("/debug")
async def debug():
    import datetime
    return {
        "service": "paydrift",
        "version": "2",
        "cwd": os.getcwd(),
        "frontend_path": frontend_path,
        "static_frontend_exists": os.path.isdir(frontend_path),
        "routes_loaded": True,
        "ts": datetime.datetime.utcnow().isoformat(),
    }

@app.get("/api/test")
async def api_test():
    return {"status": "ok", "message": "API routing works!"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "paydrift"}


@app.get("/{path:path}")
async def serve_spa(path: str):
    """Serve React SPA for any non-API path (enables client-side routing)."""
    spa_index = os.path.join(frontend_path, "index.html")
    if os.path.isfile(spa_index):
        return FileResponse(spa_index)
    raise HTTPException(status_code=404, detail="Not Found")


# NOTE: No /{path:path} catch-all route.
# FastAPI will return 404 for any unmatched path not covered by:
#   - explicit @app.get() routes above
#   - include_router() prefixed routes (app/auth, app/clients, etc.)
#   - mounted StaticFiles at /static
# This is the correct behavior — Railway Edge handles its own 404 for truly missing paths.