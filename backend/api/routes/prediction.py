from fastapi import APIRouter, HTTPException
from backend.schemas.stock import StockInput
from backend.services.model_service import predict_price
from backend.logic.recommendation import generate_recommendation

router = APIRouter()

@router.post("/predict")
def predict_stock(data: StockInput):
    try:
        predicted_price = predict_price(data.last_30_days)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    reasoning = generate_recommendation(
        current_price=data.current_price,
        predicted_price=predicted_price,
        rsi=data.rsi,
        macd=data.macd,
        vix=data.vix
    )

    return {
        "symbol": data.symbol,
        "current_price": data.current_price,
        "predicted_price": round(predicted_price, 2),
        "rsi": data.rsi,
        "macd": data.macd,
        "vix": data.vix,
        **reasoning,
        "interest_rate_used": data.interest_rate,
        "disclaimer": "This is AI-based analysis, not financial advice."
    }
