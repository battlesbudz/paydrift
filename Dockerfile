FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Expose Railway's dynamic port
ENV PORT=8000
EXPOSE 8000

# Health check - Railway expects "ok" text
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${PORT}"]
