"""
============================================================================
S.U.N.D.A.Y AI DESKTOP ASSISTANT — BACKEND APPLICATION SERVER
============================================================================
Modular FastAPI backend supporting AI inference abstractions, voice streaming,
system telemetry, and controlled desktop automation tools.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .config import settings
from .utils.logger import logger
from .api.chat import router as chat_router
from .api.voice import router as voice_router
from .api.system import router as system_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Futuristic AI Desktop Voice Assistant Backend"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(chat_router)
app.include_router(voice_router)
app.include_router(system_router)

# Optional Static Frontend Mounting
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_dir):
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")

@app.get("/")
async def root():
    return {
        "assistant": "S.U.N.D.A.Y",
        "status": "ONLINE",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "frontend_url": "/app/"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting S.U.N.D.A.Y Server on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
