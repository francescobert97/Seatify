from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from app.config.settings import settings

def create_llm(
        provider: str,
        model: str,
    ) -> BaseChatModel:

        if provider == "openai":
            return ChatOpenAI(model=model, api_key=settings.openai_api_key)

        if provider == "ollama":
            return ChatOllama(model=model)

        raise ValueError(
            f"Unsupported LLM provider: {provider}"
        )