from app.schemas.forecast import PredictRequest, PredictResponse, PredictionRecord
from datetime import timedelta

def predict(request: PredictRequest) -> PredictResponse:
    """
    Stub: trả về moving average đơn giản.
    Task 13 sẽ thay bằng Prophet/ARIMA.
    """
    if not request.history:
        return PredictResponse(
            product_id=request.product_id,
            warehouse_id=request.warehouse_id,
            predictions=[],
            model_used="stub_moving_avg",
        )
    # Simple moving average of last 7 days
    recent = request.history[-7:]
    avg = sum(r.quantity for r in recent) / len(recent)
    last_date = request.history[-1].date
    predictions = [
        PredictionRecord(
            date=last_date + timedelta(days=i + 1),
            predicted_quantity=round(avg, 2),
        )
        for i in range(request.periods)
    ]
    return PredictResponse(
        product_id=request.product_id,
        warehouse_id=request.warehouse_id,
        predictions=predictions,
        model_used="stub_moving_avg",
    )
