# Build args to break Railway cache
ARG CACHE_DATE=2026-06-05-0930

FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Static frontend (built React app)
COPY backend/static_frontend/ ./static_frontend/

ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]