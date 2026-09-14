from app.schemas.forecast import PredictRequest, PredictResponse, PredictionRecord
from datetime import timedelta
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

def predict_with_prophet(df: pd.DataFrame, periods: int) -> list[PredictionRecord]:
    from prophet import Prophet
    
    # Prophet yêu cầu 2 cột: 'ds' (datetime) và 'y' (giá trị mục tiêu)
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=False, # Seed data 6 tháng chưa đủ 1 năm, tắt yearly để tránh overfit
        interval_width=0.95
    )
    model.fit(df)
    
    future = model.make_future_dataframe(periods=periods, freq='D')
    forecast = model.predict(future)
    
    # Lấy các ngày tương lai dự đoán
    future_rows = forecast.tail(periods)
    
    records = []
    for _, row in future_rows.iterrows():
        pred_val = max(0.0, round(float(row['yhat']), 2))
        lower = max(0.0, round(float(row['yhat_lower']), 2))
        upper = max(0.0, round(float(row['yhat_upper']), 2))
        
        records.append(
            PredictionRecord(
                date=row['ds'].date(),
                predicted_quantity=pred_val,
                lower_bound=lower,
                upper_bound=upper,
            )
        )
    return records

def predict_with_arima(df: pd.DataFrame, periods: int) -> list[PredictionRecord]:
    from statsmodels.tsa.statespace.sarimax import SARIMAX
    
    # SARIMAX với chu kỳ tuần 7 ngày
    series = df.set_index('ds')['y']
    model = SARIMAX(series, order=(1, 1, 1), seasonal_order=(1, 0, 1, 7), enforce_stationarity=False, enforce_invertibility=False)
    results = model.fit(disp=False)
    
    forecast_res = results.get_forecast(steps=periods)
    pred_values = forecast_res.predicted_mean
    conf_int = forecast_res.conf_int(alpha=0.05)
    
    last_date = df['ds'].max().date()
    records = []
    for i in range(periods):
        cur_date = last_date + timedelta(days=i + 1)
        pred_val = max(0.0, round(float(pred_values.iloc[i]), 2))
        lower = max(0.0, round(float(conf_int.iloc[i, 0]), 2))
        upper = max(0.0, round(float(conf_int.iloc[i, 1]), 2))
        records.append(
            PredictionRecord(
                date=cur_date,
                predicted_quantity=pred_val,
                lower_bound=lower,
                upper_bound=upper
            )
        )
    return records

def predict(request: PredictRequest) -> PredictResponse:
    if not request.history:
        return PredictResponse(
            product_id=request.product_id,
            warehouse_id=request.warehouse_id,
            predictions=[],
            model_used="none",
        )
    
    # 1. Chuyển đổi dữ liệu sang Pandas DataFrame
    records = [{'ds': pd.to_datetime(h.date), 'y': float(h.quantity)} for h in request.history]
    df = pd.DataFrame(records)
    
    # Gom nhóm theo ngày nếu có nhiều bản ghi cùng ngày
    df = df.groupby('ds', as_index=False)['y'].sum().sort_values('ds')
    
    # Điền các ngày thiếu bằng 0 (continuous daily series)
    df = df.set_index('ds').asfreq('D', fill_value=0.0).reset_index()
    
    model_used = request.model_type.lower()
    
    # 2. Fallback nếu dữ liệu ít hơn 14 ngày
    if len(df) < 14:
        logger.warning(f"Dữ liệu quá ngắn ({len(df)} ngày), dùng simple moving average")
        recent = df.tail(7)['y'].values
        avg = float(np.mean(recent)) if len(recent) > 0 else 0.0
        last_date = df['ds'].max().date()
        predictions = [
            PredictionRecord(
                date=last_date + timedelta(days=i + 1),
                predicted_quantity=round(max(0.0, avg), 2)
            )
            for i in range(request.periods)
        ]
        return PredictResponse(
            product_id=request.product_id,
            warehouse_id=request.warehouse_id,
            predictions=predictions,
            model_used="moving_avg_fallback"
        )
    
    # 3. Chạy mô hình dự báo
    try:
        if model_used == "arima":
            predictions = predict_with_arima(df, request.periods)
        else:
            predictions = predict_with_prophet(df, request.periods)
            model_used = "prophet"
    except Exception as e:
        logger.error(f"Lỗi khi chạy {model_used}: {e}. Chuyển sang fallback.")
        recent = df.tail(7)['y'].values
        avg = float(np.mean(recent))
        last_date = df['ds'].max().date()
        predictions = [
            PredictionRecord(
                date=last_date + timedelta(days=i + 1),
                predicted_quantity=round(max(0.0, avg), 2)
            )
            for i in range(request.periods)
        ]
        model_used = "moving_avg_fallback"
        
    return PredictResponse(
        product_id=request.product_id,
        warehouse_id=request.warehouse_id,
        predictions=predictions,
        model_used=model_used
    )
