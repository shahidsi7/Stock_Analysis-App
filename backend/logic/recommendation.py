# backend/logic/recommendation.py

def generate_recommendation(
    current_price: float,
    predicted_price: float,
    rsi: float,
    macd: float,
    vix: float
):
    reasons = []
    confidence = 0

    expected_return = (predicted_price - current_price) / current_price

    bullish = 0
    bearish = 0

    # Market Risk
    if vix < 18:
        reasons.append("Market volatility is low, supporting stable price movement")
        confidence += 20
    elif vix < 25:
        reasons.append("Market volatility is moderate")
        confidence += 10
    else:
        reasons.append("High market volatility increases downside risk")
        bearish += 1

    # Momentum
    if macd > 0:
        reasons.append("MACD is positive, indicating bullish momentum")
        bullish += 1
        confidence += 20
    else:
        reasons.append("MACD is negative, indicating weak momentum")
        bearish += 1

    # RSI
    if 45 <= rsi <= 65:
        reasons.append("RSI indicates healthy price momentum")
        bullish += 1
        confidence += 20
    elif rsi > 70:
        reasons.append("RSI suggests the stock may be overbought")
        bearish += 1
    else:
        reasons.append("RSI suggests the stock may be oversold")
        bullish += 1

    # Upside
    if expected_return > 0.03:
        reasons.append("Model predicts strong upside potential")
        bullish += 1
        confidence += 25
    elif expected_return > 0.01:
        reasons.append("Model predicts limited upside potential")
        confidence += 10
    else:
        reasons.append("Limited upside expected")
        bearish += 1

    confidence = min(confidence, 100)

    # Final decision
    if bullish >= 3 and confidence >= 70:
        recommendation = "BUY"
        risk_level = "LOW" if vix < 20 else "MODERATE"
    elif bearish >= 3:
        recommendation = "HIGH RISK"
        risk_level = "HIGH"
    else:
        recommendation = "WAIT"
        risk_level = "MODERATE"

    return {
        "recommendation": recommendation,
        "confidence_score": confidence,
        "risk_level": risk_level,
        "expected_return_percent": round(expected_return * 100, 2),
        "why_this_recommendation": reasons
    }
