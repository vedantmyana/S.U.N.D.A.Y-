"""
============================================================================
S.U.N.D.A.Y AI ASSISTANT — CHAT API ENDPOINT
============================================================================
Handles incoming chat directives, session context, and AI orchestration.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, List
from ..models.requests import ChatRequest, ChatResponse
from ..services.ai_service import AIServiceFactory
from ..utils.logger import logger

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# In-memory session history storage
session_history_store: Dict[str, List[Dict[str, str]]] = {}

@router.post("", response_model=ChatResponse)
async def process_chat_message(req: ChatRequest):
    session_id = req.session_id or "default_session"
    logger.info(f"[Chat API] Directive from session [{session_id}]: {req.message}")

    if session_id not in session_history_store:
        session_history_store[session_id] = []

    history = session_history_store[session_id]

    ai_service = AIServiceFactory.get_service()
    result = await ai_service.generate_response(req.message, session_history=history[-6:])

    # Update session memory
    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": result["response"]})

    return ChatResponse(
        response=result["response"],
        action_chips=result.get("action_chips", []),
        state="speaking",
        session_id=session_id
    )

@router.post("/reset")
async def reset_session(session_id: str = "default_session"):
    if session_id in session_history_store:
        session_history_store[session_id] = []
    return {"status": "SUCCESS", "message": f"Session memory cleared for [{session_id}]"}
