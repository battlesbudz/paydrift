FROM python:3.11-slim

ARG CACHE_DATE=2026-06-05
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Static frontend already synced in repo (backend/static_frontend/)
# Nothing extra needed — uvicorn serves it directly

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]