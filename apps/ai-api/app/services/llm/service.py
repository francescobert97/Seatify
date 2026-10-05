class LLMService:

    def __init__(self, manager):
        self.manager = manager

    async def chat(self, prompt: str) -> str:

        response = await self.manager.invoke(prompt)

        return str(response.content)