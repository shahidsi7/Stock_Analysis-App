# backend/api/main.py

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
from tensorflow.keras.models import load_model

from logic.recommendation import generate_recommendation

app = FastAPI(title="Stock AI Backend")

# -----------------------------
# Load ML artifacts
# -----------------------------
model = load_model("model/lstm_model.h5")
scaler = joblib.load("model/scaler.pkl")

TIME_STEPS = 30

# -----------------------------
# Request Schema
# -----------------------------
class StockInput(BaseModel):
    symbol: str
    last_30_days: list  # shape: (30, 8)
    current_price: float
    rsi: float
    macd: float
    vix: float

# -----------------------------
# Prediction Endpoint
# -----------------------------
@app.post("/predict")
def predict_stock(data: StockInput):
    """
    Returns a Stock Health Card JSON
    """

    # Prepare input for LSTM
    X = np.array(data.last_30_days).reshape(1, TIME_STEPS, -1)
    X_scaled = scaler.transform(X.reshape(-1, X.shape[2])).reshape(X.shape)

    # Predict
    predicted_scaled = model.predict(X_scaled)[0][0]

    # Inverse scale Close price
    close_index = 3  # Close position in feature list
    dummy = np.zeros((1, X.shape[2]))
    dummy[0, close_index] = predicted_scaled
    predicted_price = scaler.inverse_transform(dummy)[0, close_index]

    # Generate human-readable logic
    reasoning = generate_recommendation(
        current_price=data.current_price,
        predicted_price=predicted_price,
        rsi=data.rsi,
        macd=data.macd,
        vix=data.vix
    )

    # Final response (Stock Health Card)
    return {
        "symbol": data.symbol,
        "current_price": data.current_price,
        "predicted_price": round(predicted_price, 2),
        **reasoning,
        "disclaimer": "This is AI-based analysis, not financial advice."
    }
