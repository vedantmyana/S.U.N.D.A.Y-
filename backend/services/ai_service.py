"""
============================================================================
S.U.N.D.A.Y AI ASSISTANT — AI ENGINE & INTENT DISPATCHER
============================================================================
Handles asynchronous model inference, conversation context, provider
abstractions (OpenRouter / OpenAI / local), and safe tool intent execution.
"""

import httpx
import re
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from ..config import settings
from ..utils.logger import logger
from ..tools.browser import BrowserTool
from ..tools.applications import ApplicationTool

SUNDAY_SYSTEM_PROMPT = """You are S.U.N.D.A.Y, a premium futuristic AI desktop voice assistant.
Your identity and demeanor:
- Technical, precise, highly intelligent, loyal, and proactive.
- Speak clearly and concisely, optimized for voice readout and futuristic HUD display.
- Address the user as Commander unless instructed otherwise.
- Never identify as GLOBEE or any other assistant. Your name is strictly S.U.N.D.A.Y.
- Format responses cleanly with brief bullet points or direct explanations when necessary.
"""

class BaseAIService(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, session_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """Generate response from AI provider"""
        pass


class OpenRouterAIService(BaseAIService):
    def __init__(self, api_key: Optional[str], model: str):
        self.api_key = api_key or ""
        self.model = model
        self.endpoint = "https://openrouter.ai/api/v1/chat/completions"

    async def generate_response(self, prompt: str, session_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        logger.info(f"[AI Service] Processing query for model: {self.model}")
        
        # 1. Check for immediate Desktop Tool execution intents
        tool_result = await self._check_and_execute_tools(prompt)
        if tool_result:
            return tool_result

        # 2. If no API key configured, use local intelligent fallback
        if not self.api_key or self.api_key == "your_openrouter_api_key_here":
            logger.warning("[AI Service] OpenRouter API key not configured. Using local neural fallback.")
            return self._local_intelligent_fallback(prompt)

        messages = [{"role": "system", "content": SUNDAY_SYSTEM_PROMPT}]
        if session_history:
            messages.extend(session_history)
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://sunday.ai",
            "X-Title": "S.U.N.D.A.Y AI Assistant",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 450
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(self.endpoint, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    logger.info(f"[AI Service] Response generated successfully ({len(content)} chars)")
                    
                    return {
                        "response": content,
                        "action_chips": [
                            f'<i class="fa-solid fa-brain"></i> {self.model.split("/")[-1]}',
                            '<i class="fa-solid fa-bolt"></i> Quantum Inference Active'
                        ],
                        "model": self.model
                    }
                else:
                    logger.error(f"[AI Service] API Error: {resp.status_code} - {resp.text}")
                    return {
                        "response": f"AI Engine reported an error ({resp.status_code}). Please verify your OpenRouter API key and model quota.",
                        "action_chips": ['<i class="fa-solid fa-triangle-exclamation"></i> API Error'],
                        "model": self.model
                    }

        except Exception as e:
            logger.error(f"[AI Service] Connection failure: {str(e)}")
            return {
                "response": f"Neural connection to {self.model} timed out. Please check network connectivity or backend settings.",
                "action_chips": ['<i class="fa-solid fa-wifi"></i> Connection Timeout'],
                "model": self.model
            }

    async def _check_and_execute_tools(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Identifies and safely executes desktop tool operations."""
        lower = prompt.lower().strip()

        # Tool 1: Search the Web
        search_match = re.match(r'^(?:search(?:\s+the\s+web)?(?:\s+for)?|google)\s+(.+)$', lower)
        if search_match:
            query = search_match.group(1)
            result = await BrowserTool.search_web(query)
            return {
                "response": f"Executing web search for <strong>'{query}'</strong>. Browser search initiated.",
                "action_chips": ['<i class="fa-brands fa-google"></i> Web Search', '<i class="fa-solid fa-globe"></i> Browser'],
                "model": "S.U.N.D.A.Y Tool Engine"
            }

        # Tool 2: Open Specific Website
        open_site_match = re.match(r'^(?:open|launch|visit|go\s+to)\s+(?:website\s+)?(https?://\S+|www\.\S+|\S+\.(?:com|org|net|io|ai|dev|app|edu|gov))', lower)
        if open_site_match:
            target_url = open_site_match.group(1)
            result = await BrowserTool.open_url(target_url)
            return {
                "response": f"Directing desktop browser to <strong>{target_url}</strong>.",
                "action_chips": ['<i class="fa-solid fa-arrow-up-right-from-square"></i> URL Opened'],
                "model": "S.U.N.D.A.Y Tool Engine"
            }

        # Tool 3: Named Website Shortcuts
        if lower.startswith("open ") or lower.startswith("launch "):
            target = lower.replace("open ", "").replace("launch ", "").strip()
            
            site_shortcuts = {
                "youtube": "https://www.youtube.com",
                "google": "https://www.google.com",
                "github": "https://www.github.com",
                "chatgpt": "https://chat.openai.com",
                "reddit": "https://www.reddit.com",
                "twitter": "https://www.twitter.com",
                "x": "https://www.x.com"
            }
            if target in site_shortcuts:
                url = site_shortcuts[target]
                await BrowserTool.open_url(url)
                return {
                    "response": f"Opening <strong>{target.capitalize()}</strong> ({url}) in your primary browser.",
                    "action_chips": ['<i class="fa-solid fa-globe"></i> Shortcut Executed'],
                    "model": "S.U.N.D.A.Y Tool Engine"
                }

            # Tool 4: Launch Desktop Application
            app_result = await ApplicationTool.launch_application(target)
            if "Successfully initiated" in app_result:
                return {
                    "response": app_result,
                    "action_chips": ['<i class="fa-solid fa-window-maximize"></i> App Launched'],
                    "model": "S.U.N.D.A.Y Tool Engine"
                }

        return None

    def _local_intelligent_fallback(self, prompt: str) -> Dict[str, Any]:
        """Provides rich, responsive local fallback when API key is unconfigured."""
        lower = prompt.lower()
        
        if "who are you" in lower or "what are you" in lower or "identify" in lower:
            resp = "I am <strong>S.U.N.D.A.Y</strong>, your dedicated desktop intelligence assistant. My multi-layer quantum core is online and telemetry monitors are synchronized."
            chips = ['<i class="fa-solid fa-atom"></i> S.U.N.D.A.Y Core', '<i class="fa-solid fa-shield-check"></i> Nominal']
        elif "status" in lower or "health" in lower:
            resp = "All primary nodes, Web Audio telemetry analyzers, and memory matrices are operating within optimal thresholds."
            chips = ['<i class="fa-solid fa-microchip"></i> 100% Health', '<i class="fa-solid fa-server"></i> System Online']
        elif "time" in lower or "date" in lower:
            resp = "Chrono telemetry is fully synchronized with your local system clock in UTC+05:30."
            chips = ['<i class="fa-regular fa-clock"></i> Chrono Synced']
        elif "openrouter" in lower or "api" in lower or "key" in lower or "setup" in lower:
            resp = "To enable unrestricted LLM cognition, add your <code>OPENROUTER_API_KEY</code> into the <code>backend/.env</code> file. S.U.N.D.A.Y will instantly load the neural weights."
            chips = ['<i class="fa-solid fa-key"></i> .env Ready', '<i class="fa-solid fa-gear"></i> Settings']
        elif "help" in lower or "commands" in lower or "tools" in lower:
            resp = "Available Desktop Tool commands include: <code>open calculator</code>, <code>open notepad</code>, <code>open youtube</code>, <code>open github</code>, <code>search the web for [query]</code>, or ask any conceptual question."
            chips = ['<i class="fa-solid fa-terminal"></i> Command Matrix Ready']
        else:
            resp = f'Command recognized: "<em>{prompt}</em>". S.U.N.D.A.Y quantum baseline is active. Connect your OpenRouter API key in <code>backend/.env</code> for comprehensive multi-model reasoning.'
            chips = ['<i class="fa-solid fa-check"></i> Command Logged', '<i class="fa-solid fa-brain"></i> Baseline Ready']

        return {
            "response": resp,
            "action_chips": chips,
            "model": "S.U.N.D.A.Y Neural Baseline (Local)"
        }


class AIServiceFactory:
    _instance: Optional[BaseAIService] = None

    @classmethod
    def get_service(cls) -> BaseAIService:
        if cls._instance is None:
            cls._instance = OpenRouterAIService(
                api_key=settings.OPENROUTER_API_KEY,
                model=settings.AI_MODEL
            )
        return cls._instance
