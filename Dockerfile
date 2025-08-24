# Stage 1: Get Playwright dependencies from the official Playwright image
FROM mcr.microsoft.com/playwright:v1.54.0-noble AS playwright_deps

# Stage 2: Build the React frontend
FROM node:18-alpine as build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 3: Build the Python backend
# Use the same Python version as your project (e.g., python:3.11-slim)
FROM python:3.11-slim as backend

WORKDIR /app

# Copy Playwright browser dependencies from the playwright_deps stage
COPY --from=playwright_deps /usr/bin/ms-playwright-browser-drivers /usr/bin/
COPY --from=playwright_deps /ms-playwright/ /ms-playwright/
ENV PATH="${PATH}:/ms-playwright/"

# Install system dependencies for Playwright and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libxss1 libasound2 libgbm1 libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy built frontend files
COPY --from=build /app/frontend/dist ./frontend/dist

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install project dependencies
RUN poetry install --no-root

# Copy backend code
COPY . .

EXPOSE 8000

ENV ENV prod

CMD ["poetry", "run", "python", "server.py"]