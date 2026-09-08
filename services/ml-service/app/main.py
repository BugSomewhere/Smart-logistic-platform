from fastapi import FastAPI
from app.routers import forecast

app = FastAPI(title="Smart Logistics ML Service")
app.include_router(forecast.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}
