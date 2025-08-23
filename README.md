# WebPilot AI

WebPilot AI is a sophisticated, AI-powered browser automation tool. It uses a large language model to interpret natural language instructions and translate them into browser actions, allowing it to perform complex web-based tasks autonomously. The agent's actions are streamed in real-time and recorded for later review.

## Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI:** For the web server and WebSocket communication.
- **Playwright:** For robust browser automation.
- **OpenAI API:** To power the agent's decision-making.
- **SQLAlchemy:** For database interactions.
- **PostgreSQL:** As the database for storing run history.
- **Docker:** For containerization.

### Frontend
- **React:** For the user interface.
- **Vite:** As the frontend build tool.
- **Tailwind CSS:** For styling.

## Project Setup

### Prerequisites
- Python 3.8+ and `pip`
- Node.js and `npm`
- Docker and Docker Compose

### Backend Setup (Local)

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd webpilot-ai
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    The project uses `pyproject.toml` to manage dependencies.
    ```bash
    pip install .
    ```

4.  **Set up environment variables:**
    Copy the `.env.dev` file to `.env` and fill in the required values for your database. You can add your `OPENAI_API_KEY` and `GEMINI_API_KEY` here, but it's recommended to use the Settings page in the UI.
    ```bash
    cp .env.dev .env
    ```
    The available environment variables are:
    - `OPENAI_API_KEY`: Your API key for OpenAI.
    - `GEMINI_API_KEY`: Your API key for Google Gemini.

5.  **Run the server:**
    ```bash
    uvicorn server:app --reload
    ```
    The backend will be running at `http://localhost:8000`.

### Frontend Setup (Local)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install npm dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:5173` (or another port if 5173 is busy).

### Running with Docker

The easiest way to get the entire application running is with Docker Compose.

1.  **Set up environment variables:**
    Ensure you have a `.env` file in the root directory with the necessary credentials.

2.  **Run the development environment:**
    This command builds the containers and starts the frontend, backend, and database services with hot-reloading enabled.
    ```bash
    docker-compose -f docker-compose.dev.yml up --build
    ```

3.  **Run the production environment:**
    This command builds a single, optimized container for production.
    ```bash
    docker-compose up --build
