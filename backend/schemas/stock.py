from pydantic import BaseModel
from typing import List

class StockInput(BaseModel):
    symbol: str
    last_30_days: List[List[float]]  # shape: (30, 9)
    current_price: float
    rsi: float
    macd: float
    vix: float
    interest_rate: float
