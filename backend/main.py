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

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])
app.include_router(stripe.router, prefix="/api/stripe", tags=["stripe"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Serve React frontend built files (SPA)
# Serve React frontend built files (SPA) - copied into backend/static_frontend/
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


@app.get("/{path:path}")
async def serve_spa(path: str):
    # Only serve SPA for non-API paths when frontend dist exists
    # Don't intercept /v1/* (API), /static/* (assets), /health (health check), /docs (swagger)
    reserved = ["v1", "static", "docs", "redoc", "openapi", "health"]
    if path not in reserved and not any(path.startswith(p + "/") for p in reserved):
        if os.path.isdir(frontend_path):
            index_path = os.path.join(frontend_path, "index.html")
            if os.path.isfile(index_path):
                return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Not found")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.api_view(["GET", "POST"])
async def test_all(path: str, request: Request):
    print(f"TEST_ENDPOINT: {request.method} /{path} - Headers: {dict(request.headers)}")
    return {"received": f"/{path}", "method": request.method}

# Test endpoint to debug Railway edge routing
@app.get("/t")
async def test_root():
    return {"test": "ok", "path": "/"}
