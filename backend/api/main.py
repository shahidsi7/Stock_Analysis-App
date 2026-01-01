# backend/api/main.py

import os
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware

from backend.logic.recommendation import generate_recommendation

app = FastAPI(title="Stock AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # allow frontend to call backend
    allow_methods=["*"],      # allow POST, GET, etc.
    allow_headers=["*"],      # allow JSON headers
)

# -----------------------------
# Load ML artifacts
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(BASE_DIR, "backend", "model", "lstm_model.h5")
SCALER_PATH = os.path.join(BASE_DIR, "backend", "model", "scaler.pkl")

model = load_model(MODEL_PATH, compile=False)

scaler = joblib.load(SCALER_PATH)

TIME_STEPS = 30
NUM_FEATURES = 9  # ✅ UPDATED

# -----------------------------
# Request Schema
# -----------------------------
class StockInput(BaseModel):
    symbol: str
    last_30_days: list  # expected shape: (30, 9)
    current_price: float
    rsi: float
    macd: float
    vix: float
    interest_rate: float  # ✅ NEW

# -----------------------------
# Prediction Endpoint
# -----------------------------
@app.post("/predict")
def predict_stock(data: StockInput):
    """
    Returns a Stock Health Card JSON
    """

    # -----------------------------
    # 1. Validate input length
    # -----------------------------
    if len(data.last_30_days) != TIME_STEPS:
        raise HTTPException(
            status_code=400,
            detail="last_30_days must contain exactly 30 days"
        )

    # -----------------------------
    # 2. Convert to NumPy
    # -----------------------------
    X = np.array(data.last_30_days, dtype=np.float32)

    if X.shape != (TIME_STEPS, NUM_FEATURES):
        raise HTTPException(
            status_code=400,
            detail=f"Each day must have {NUM_FEATURES} features"
        )

    # -----------------------------
    # 3. Reshape for LSTM
    # -----------------------------
    X = X.reshape(1, TIME_STEPS, NUM_FEATURES)

    # -----------------------------
    # 4. Scale input
    # -----------------------------
    X_scaled = scaler.transform(
        X.reshape(-1, NUM_FEATURES)
    ).reshape(X.shape)

    # -----------------------------
    # 5. Predict
    # -----------------------------
    predicted_scaled = model.predict(X_scaled)[0][0]

    # -----------------------------
    # 6. Inverse-scale Close price
    # -----------------------------
    CLOSE_INDEX = 3  # Close price position

    dummy = np.zeros((1, NUM_FEATURES))
    dummy[0, CLOSE_INDEX] = predicted_scaled

    predicted_price = scaler.inverse_transform(dummy)[0][CLOSE_INDEX]

    # -----------------------------
    # 7. Generate recommendation
    # -----------------------------
    reasoning = generate_recommendation(
        current_price=data.current_price,
        predicted_price=predicted_price,
        rsi=data.rsi,
        macd=data.macd,
        vix=data.vix
    )

    # -----------------------------
    # 8. Final response
    # -----------------------------
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
