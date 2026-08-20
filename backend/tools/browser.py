"""
============================================================================
S.U.N.D.A.Y CONTROLLED TOOLS — BROWSER & WEB OPERATIONS
============================================================================
"""

import webbrowser
import urllib.parse
from ..utils.logger import logger

class BrowserTool:
    @staticmethod
    async def open_url(url: str) -> str:
        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"
        
        logger.info(f"[Tool: Browser] Opening verified URL: {url}")
        try:
            webbrowser.open(url)
            return f"Opened browser destination: {url}"
        except Exception as e:
            logger.error(f"[Tool: Browser] Failed to open URL: {e}")
            return f"Failed to launch browser: {str(e)}"

    @staticmethod
    async def search_web(query: str) -> str:
        encoded_query = urllib.parse.quote(query)
        search_url = f"https://www.google.com/search?q={encoded_query}"
        
        logger.info(f"[Tool: Browser] Executing web search: {query}")
        try:
            webbrowser.open(search_url)
            return f"Launched web search for: '{query}'"
        except Exception as e:
            logger.error(f"[Tool: Browser] Search failed: {e}")
            return f"Search execution failed: {str(e)}"
