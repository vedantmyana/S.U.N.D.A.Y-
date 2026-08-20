"""
S.U.N.D.A.Y AI Assistant — Voice API Endpoint (Scaffold)
"""

from fastapi import APIRouter
from ..utils.logger import logger

router = APIRouter(prefix="/api/voice", tags=["Voice"])

@router.get("/status")
async def get_voice_status():
    return {
        "status": "READY",
        "stt": "BROWSER_WEBSPEECH_OR_WHISPER",
        "tts": "NEURAL_SYNTHESIZER"
    }
