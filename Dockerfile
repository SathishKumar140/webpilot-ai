# Stage 1: Build the React frontend
FROM node:18-alpine as build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 2: Build the Python backend
FROM mcr.microsoft.com/playwright:v1.54.0-noble

WORKDIR /app

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Install PostgreSQL client library (libpq-dev) and python3-psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*
RUN pip3 install poetry --break-system-packages

# Copy built frontend files
COPY --from=build /app/frontend/dist ./frontend/dist

# Install Python dependencies
COPY pyproject.toml .
RUN poetry install

# Copy backend code
COPY . .

EXPOSE 8000

ENV ENV prod

CMD ["poetry", "run", "python3", "server.py"]
