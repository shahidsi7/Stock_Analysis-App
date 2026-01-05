import os
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from backend.utils.constants import TIME_STEPS, NUM_FEATURES, CLOSE_INDEX


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

MODEL_PATH = os.path.join(BASE_DIR, "backend", "model", "lstm_model.h5")
SCALER_PATH = os.path.join(BASE_DIR, "backend", "model", "scaler.pkl")

TIME_STEPS = 30
NUM_FEATURES = 9
CLOSE_INDEX = 3

model = load_model(MODEL_PATH, compile=False)
scaler = joblib.load(SCALER_PATH)

def predict_price(last_30_days: list) -> float:
    """
    Handles:
    - validation
    - scaling
    - LSTM prediction
    - inverse scaling
    """

    X = np.array(last_30_days, dtype=np.float32)

    if X.shape != (TIME_STEPS, NUM_FEATURES):
        raise ValueError(f"Expected shape (30, {NUM_FEATURES})")

    X = X.reshape(1, TIME_STEPS, NUM_FEATURES)

    X_scaled = scaler.transform(
        X.reshape(-1, NUM_FEATURES)
    ).reshape(X.shape)

    predicted_scaled = model.predict(X_scaled)[0][0]

    dummy = np.zeros((1, NUM_FEATURES))
    dummy[0, CLOSE_INDEX] = predicted_scaled

    predicted_price = scaler.inverse_transform(dummy)[0][CLOSE_INDEX]

    return float(predicted_price)
