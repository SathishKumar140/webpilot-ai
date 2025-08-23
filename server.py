import asyncio
import logging
import base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, BackgroundTasks
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv
import os
from agent import Agent

# Load environment variables based on ENV setting
env_path = Path('.') / '.env.dev'
if os.getenv("ENV") == "prod":
    env_path = Path('.') / '.env.prod'
load_dotenv(dotenv_path=env_path)

logging.basicConfig(level=logging.INFO)
is_prod = os.getenv("ENV") == "prod"

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Serve the React frontend
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")

@app.get("/video/{filename}")
async def get_video(filename: str):
    return FileResponse(filename, media_type="video/mp4")



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logging.info(f"UI Client connected from {websocket.client.host}:{websocket.client.port}")
    try:
        while True:
            data = await websocket.receive_text()
            task = AgentTask.model_validate_json(data)
            
            agent = Agent(websocket)
            await agent.run(task)

    except WebSocketDisconnect:
        logging.info(f"UI Client disconnected from {websocket.client.host}:{websocket.client.port}")
    except Exception as e:
        logging.error(f"An error occurred in the websocket endpoint: {e}", exc_info=True)

class AgentTask(BaseModel):
    url: str
    instruction: str

if __name__ == "__main__":
    import uvicorn
    reload_policy = not is_prod
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=reload_policy)
