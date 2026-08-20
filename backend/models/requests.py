"""
S.U.N.D.A.Y AI Assistant — Request/Response Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Command or query from user")
    session_id: Optional[str] = "default_session"
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    action_chips: List[str] = []
    state: str = "speaking"
    session_id: str


class SystemStatusResponse(BaseModel):
    status: str
    version: str
    uptime_seconds: float
    ai_provider: str
    active_tools: List[str]
