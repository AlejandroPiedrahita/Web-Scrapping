# ==============================================================================
# AutoData ETL Pipeline - Backend Multi-Stage Dockerfile
# Python 3.11-slim + Playwright Chromium + FastAPI / Worker Fleet
# ==============================================================================

# Stage 1: Build & Dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/root/.local/bin:$PATH" \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install system libraries needed for Playwright Chromium and PostgreSQL client
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /root/.local /root/.local

# Install Playwright Chromium and its system dependencies
RUN python -m playwright install --with-deps chromium

# Copy application source code
COPY . /app

EXPOSE 8000

# Default command: run FastAPI production server with Uvicorn
CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
