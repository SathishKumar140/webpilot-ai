# Stage 1: Build the React frontend
FROM node:18-alpine as frontend_build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 2: Build the Python backend and serve both apps
FROM mcr.microsoft.com/playwright:v1.54.0-noble

WORKDIR /app

# Add the deadsnakes PPA to get access to Python 3.11
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update

# Install Python 3.11, pip, and a virtual environment
RUN apt-get install -y --no-install-recommends \
    python3.11 python3.11-venv python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry using --break-system-packages to bypass the error
RUN pip install poetry --break-system-packages

# Create and activate a virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3.11 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy built frontend files from the 'frontend_build' stage
COPY --from=frontend_build /app/frontend/dist ./frontend/dist

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install project dependencies
RUN poetry install --no-root

# Copy backend code
COPY . .

EXPOSE 8000

ENV ENV prod

CMD ["poetry", "run", "python3.11", "server.py"]