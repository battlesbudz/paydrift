FROM python:3.11-slim

WORKDIR /app

# Install Node for building frontend
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY backend/ .

# Build React frontend
COPY paydrift-landing/package*.json paydrift-landing/
RUN cd paydrift-landing && npm ci && npm run build

# Copy built frontend into static_frontend
RUN cp -r paydrift-landing/dist backend/static_frontend/ || mkdir -p backend/static_frontend

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]