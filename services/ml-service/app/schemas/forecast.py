from pydantic import BaseModel
from datetime import date

class HistoryRecord(BaseModel):
   date: date
   quantity: float       # số lượng xuất kho ngày đó

class PredictRequest(BaseModel):
   product_id: str
   warehouse_id: str | None = None
   history: list[HistoryRecord]
   periods: int = 30     # dự báo bao nhiêu ngày tới
   model_type: str = "prophet"

class PredictionRecord(BaseModel):
   date: date
   predicted_quantity: float
   lower_bound: float | None = None
   upper_bound: float | None = None

class PredictResponse(BaseModel):
   product_id: str
   warehouse_id: str | None
   predictions: list[PredictionRecord]
   model_used: str
