# Stage 1: Build the React frontend
FROM node:18-alpine as build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 2: Build the Python backend
FROM python:3.11-slim

WORKDIR /app

# Copy built frontend files
COPY --from=build /app/frontend/dist ./frontend/dist

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

EXPOSE 8000

ENV ENV prod

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
