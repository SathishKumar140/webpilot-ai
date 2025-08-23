# WebPilot AI - Frontend

This directory contains the frontend of the WebPilot AI application, built with React and Vite.

## Overview

The frontend provides a user interface for interacting with the WebPilot AI agent. It allows users to:
-   Input a URL and a natural language instruction for the agent.
-   Watch the agent perform the task in real-time, with live video streaming.
-   View a log of the agent's thoughts and actions.
-   Browse a history of previous runs.

## Project Structure

-   **`public/`**: Contains static assets that are served directly.
-   **`src/`**: Contains the main source code for the React application.
    -   **`assets/`**: Static assets like images and SVGs that are imported into components.
    -   **`components/`**: Reusable React components, such as `Header`, `Footer`, etc.
    -   **`pages/`**: Top-level components that correspond to different pages of the application (e.g., `Home`, `History`).
    -   **`App.jsx`**: The root component of the application, which sets up routing.
    -   **`main.jsx`**: The entry point of the application, where the React app is mounted to the DOM.
    -   **`index.css`**: Global styles and Tailwind CSS configuration.

## Available Scripts

In the `frontend` directory, you can run the following commands:

-   **`npm install`**: Installs the project dependencies.
-   **`npm run dev`**: Runs the app in development mode with hot-reloading. Open [http://localhost:5173](http://localhost:5173) (or the port specified in the terminal) to view it in the browser.
-   **`npm run build`**: Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.
-   **`npm run preview`**: Serves the production build locally to preview it before deployment.
-   **`npm run lint`**: Lints the code to check for errors and enforce code style.

## Running the Frontend Independently

To run the frontend separately from the backend:

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

The frontend connects to the backend using the URL specified in the `VITE_WEBPILOT_BACKEND_URL` environment variable. To configure this:

1.  **Create a `.env` file** in the `frontend` directory.
2.  **Add the following line** to the `.env` file:
    ```
    VITE_WEBPILOT_BACKEND_URL=localhost:8000
    ```
3.  **Restart the frontend development server** if it's already running.

Ensure the backend server is running and accessible at the address you've configured.
