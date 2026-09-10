from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Seatify AI API is running"}