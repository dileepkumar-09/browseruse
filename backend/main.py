from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import asyncio
import httpx

from agent import run_browser_task

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    prompt: str

active_websockets: list[WebSocket] = []

@app.get("/health")
async def health():
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get("http://localhost:11434/api/tags")
            ollama_ok = resp.status_code == 200
    except Exception:
        pass
    return {"status": "ok", "ollama": ollama_ok}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)

async def broadcast_status(status: str):
    disconnected = []
    for ws in active_websockets:
        try:
            await ws.send_json({"type": "status", "message": status})
        except Exception:
            disconnected.append(ws)
    for ws in disconnected:
        if ws in active_websockets:
            active_websockets.remove(ws)

@app.post("/run-task")
async def run_task(request: TaskRequest):
    if not request.prompt.strip():
        return JSONResponse(status_code=400, content={"error": "Prompt cannot be empty"})

    async def task_wrapper():
        async def send_status(msg: str):
            await broadcast_status(msg)

        try:
            result = await run_browser_task(request.prompt, send_status)
            for ws in list(active_websockets):
                try:
                    await ws.send_json({"type": "result", "message": result})
                except Exception:
                    pass
        except Exception as e:
            import traceback
            print("AGENT CRASH TRACE:", traceback.format_exc())
            await broadcast_status(f"❌ Error: {repr(e)}")
            for ws in list(active_websockets):
                try:
                    await ws.send_json({"type": "error", "message": str(e)})
                except Exception:
                    pass

    asyncio.create_task(task_wrapper())
    return {"message": "Task started", "prompt": request.prompt}
