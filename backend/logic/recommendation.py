# backend/logic/recommendation.py

def generate_recommendation(
    current_price: float,
    predicted_price: float,
    rsi: float,
    macd: float,
    vix: float
):
    """
    Converts ML outputs into human-readable investment guidance
    """

    reasons = []
    confidence = 0

    expected_return = (predicted_price - current_price) / current_price

    # Market Fear (VIX)
    if vix < 18:
        reasons.append("The overall market is calm")
        confidence += 25
        risk_level = "LOW"
    elif vix < 25:
        reasons.append("Market volatility is moderate")
        confidence += 15
        risk_level = "MODERATE"
    else:
        reasons.append("Market fear is high")
        risk_level = "HIGH"

    # Momentum (MACD)
    if macd > 0:
        reasons.append("The stock has strong upward momentum")
        confidence += 25
    else:
        reasons.append("The stock momentum is weak")

    # RSI
    if 40 <= rsi <= 65:
        reasons.append("The price is not overheated")
        confidence += 25
    elif rsi > 70:
        reasons.append("The stock price is already stretched")
    else:
        reasons.append("The stock may be oversold")

    # Upside
    if expected_return > 0.03:
        reasons.append("The model expects meaningful upside")
        confidence += 25
    elif expected_return > 0.01:
        reasons.append("The model expects limited upside")
        confidence += 15
    else:
        reasons.append("The expected upside is low")

    confidence = min(confidence, 100)

    if confidence >= 75 and risk_level == "LOW":
        recommendation = "STRONG BUY"
    elif confidence >= 55:
        recommendation = "WAIT FOR BETTER PRICE"
    else:
        recommendation = "HIGH RISK"

    return {
        "recommendation": recommendation,
        "confidence_score": confidence,
        "risk_level": risk_level,
        "expected_return_percent": round(expected_return * 100, 2),
        "why_this_recommendation": reasons
    }
