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

# Run with hardcoded port (Railway edge routes external traffic)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]