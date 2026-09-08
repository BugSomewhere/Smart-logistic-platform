from fastapi import APIRouter
from app.schemas.forecast import PredictRequest, PredictResponse
from app.services.forecaster import predict

router = APIRouter()

@router.post("/predict", response_model=PredictResponse)
async def run_prediction(request: PredictRequest):
    return predict(request)
