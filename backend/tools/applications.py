"""
============================================================================
S.U.N.D.A.Y CONTROLLED TOOLS — SAFE APPLICATION LAUNCHER
============================================================================
"""

import os
import subprocess
from typing import Dict
from ..utils.logger import logger

# Permitted whitelist of desktop applications
ALLOWED_APPS: Dict[str, str] = {
    "notepad": "notepad.exe",
    "calculator": "calc.exe",
    "calc": "calc.exe",
    "explorer": "explorer.exe",
    "file explorer": "explorer.exe",
    "cmd": "cmd.exe",
    "terminal": "wt.exe",
    "powershell": "powershell.exe",
    "task manager": "taskmgr.exe",
    "vscode": "code",
    "code": "code",
    "chrome": "chrome.exe",
    "edge": "msedge.exe"
}

class ApplicationTool:
    @staticmethod
    async def launch_application(app_name: str) -> str:
        clean_name = app_name.strip().lower()
        
        target_executable = ALLOWED_APPS.get(clean_name)
        if not target_executable:
            # Check for partial match in keys
            for key, exe in ALLOWED_APPS.items():
                if key in clean_name:
                    target_executable = exe
                    break

        if not target_executable:
            logger.warning(f"[Tool: Application] Requested app not in whitelist: {app_name}")
            return f"Application '{app_name}' is not in the security whitelist. Permitted apps: {', '.join(set(ALLOWED_APPS.keys()))}"

        logger.info(f"[Tool: Application] Launching permitted executable: {target_executable}")
        try:
            # Use detached process on Windows so it does not block the assistant
            subprocess.Popen(target_executable, shell=True)
            return f"Successfully initiated {app_name.capitalize()} on your desktop."
        except Exception as e:
            logger.error(f"[Tool: Application] Error launching {target_executable}: {e}")
            return f"Failed to start {app_name}: {str(e)}"
