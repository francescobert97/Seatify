from langchain_core.language_models import BaseChatModel


class LLMManager:

    def __init__(
        self,
        primary: BaseChatModel,
        fallback: BaseChatModel,
    ):
        self.primary = primary
        self.fallback = fallback

    async def invoke(self, prompt: str):

        try:
            return await self.primary.ainvoke(prompt)

        except Exception:
            return await self.fallback.ainvoke(prompt)