"""
S.U.N.D.A.Y Controlled Tools — Sandboxed Filesystem Operations (Phase 7 Scaffold)
"""

from ..utils.logger import logger

class FilesystemTool:
    @staticmethod
    async def list_sandbox_files() -> list:
        logger.info("[Tool: Filesystem] Listing sandboxed files")
        return []
