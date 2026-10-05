from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    primary_llm_provider: str
    primary_llm_model: str

    fallback_llm_provider: str
    fallback_llm_model: str

    openai_api_key: str

    model_config = SettingsConfigDict(
        env_file=".env"
    )


settings = Settings()