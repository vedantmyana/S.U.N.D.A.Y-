"""
============================================================================
S.U.N.D.A.Y AI ASSISTANT — SYSTEM & TELEMETRY API ENDPOINTS
============================================================================
"""

from fastapi import APIRouter
from ..models.requests import SystemStatusResponse
from ..config import settings
from ..services.system_service import SystemService

router = APIRouter(prefix="/api/system", tags=["System"])

@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status():
    telemetry = SystemService.get_system_telemetry()
    return SystemStatusResponse(
        status="ONLINE",
        version=settings.VERSION,
        uptime_seconds=telemetry["uptime_seconds"],
        ai_provider=settings.AI_PROVIDER,
        active_tools=["browser", "applications", "filesystem"]
    )
