# llm/container.py

from .factory import create_llm
from .manager import LLMManager
from .service import LLMService
from app.config.settings import settings

def create_llm_service() -> LLMService:
    primary = create_llm(
        provider=settings.primary_llm_provider,
        model=settings.primary_llm_model,
    )

    fallback = create_llm(
        provider=settings.fallback_llm_provider,
        model=settings.fallback_llm_model,
    )

    manager = LLMManager(
        primary=primary,
        fallback=fallback,
    )

    return LLMService(manager)