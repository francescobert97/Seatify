from fastapi import FastAPI
from app.services.llm.container import create_llm_service

app = FastAPI()

@app.get("/")
async def root():
    llm_service = create_llm_service()
    llm_service_response = await llm_service.chat("Hello, LLM! How are you today?")
    print(f"LLM Service Response: {llm_service_response}")
    return {"message": "Seatify AI API is running"}