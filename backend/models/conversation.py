"""
S.U.N.D.A.Y AI Assistant — Conversation Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' | 'assistant' | 'system'")
    content: str = Field(..., description="Message text content")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)


class ChatSession(BaseModel):
    session_id: str
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
