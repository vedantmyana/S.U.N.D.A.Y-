"""
S.U.N.D.A.Y AI Assistant — Configuration Module
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "S.U.N.D.A.Y AI Desktop Assistant"
    VERSION: str = "2.4.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True

    # AI Configuration (Credentials stored exclusively in environment)
    AI_PROVIDER: str = "openrouter"
    OPENROUTER_API_KEY: Optional[str] = None
    AI_MODEL: str = "anthropic/claude-3.5-sonnet:beta"
    OPENAI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
