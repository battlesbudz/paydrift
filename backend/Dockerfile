FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Railway injects PORT env var, but uvicorn needs an integer
ENV PORT=8000
EXPOSE 8000

# NOTE: No HEALTHCHECK directive — Railway manages its own health checks via healthcheckPath
# Railway probes the container's /health endpoint (which returns HTTP 200 with "OK")

# Run with hardcoded port (Railway edge routes external traffic)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]