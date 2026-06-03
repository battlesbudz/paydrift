FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/ .

# Railway injects env vars at runtime
EXPOSE 8000

# Railway passes $PORT — fallback to 8000
ENV PORT=8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]