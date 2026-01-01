def generate_recommendation(
    current_price: float,
    predicted_price: float,
    rsi: float,
    macd: float,
    vix: float
):
    # ---------------------------------
    # 1. MODEL EXPECTATION
    # ---------------------------------
    expected_return = (predicted_price - current_price) / current_price

    if expected_return > 0.04:
        model_view = (
            "The AI model expects a strong upside in the stock price "
            "over the near term based on recent price patterns."
        )
        model_score = 85
    elif expected_return > 0.015:
        model_view = (
            "The AI model predicts moderate upward movement, suggesting "
            "potential gains if the trend continues."
        )
        model_score = 70
    elif expected_return > -0.01:
        model_view = (
            "The AI model expects largely sideways price movement, "
            "indicating limited short-term opportunities."
        )
        model_score = 50
    else:
        model_view = (
            "The AI model anticipates downside risk, as recent price behavior "
            "signals potential weakness."
        )
        model_score = 30

    # ---------------------------------
    # 2. TECHNICAL MOMENTUM (HUMAN)
    # ---------------------------------
    momentum_score = 0
    momentum_explanation = []

    # RSI interpretation
    if 45 <= rsi <= 65:
        momentum_score += 40
        momentum_explanation.append(
            "RSI is in a healthy range, indicating balanced buying interest without overbought pressure."
        )
    elif rsi > 70:
        momentum_score += 15
        momentum_explanation.append(
            "RSI indicates overbought conditions, which may limit further upside in the short term."
        )
    else:
        momentum_score += 30
        momentum_explanation.append(
            "RSI suggests the stock may be oversold, opening the possibility for a technical rebound."
        )

    # MACD interpretation
    if macd > 0:
        momentum_score += 40
        momentum_explanation.append(
            "MACD is positive, confirming that bullish momentum is currently present."
        )
    else:
        momentum_score += 15
        momentum_explanation.append(
            "MACD remains weak, suggesting that upward momentum lacks strong confirmation."
        )

    if momentum_score >= 70:
        momentum_view = "Overall technical indicators suggest bullish momentum."
    elif momentum_score >= 45:
        momentum_view = "Technical indicators are mixed, showing neither strong bullish nor bearish control."
    else:
        momentum_view = "Technical indicators point to weak momentum and limited buying strength."

    # ---------------------------------
    # 3. MARKET RISK CONTEXT (HUMAN)
    # ---------------------------------
    if vix < 18:
        risk_view = (
            "Market volatility is currently low, which generally supports "
            "stable price movements and trend continuation."
        )
        risk_score = 80
    elif vix < 25:
        risk_view = (
            "Market volatility is moderate, suggesting that gains are possible "
            "but may come with short-term fluctuations."
        )
        risk_score = 60
    else:
        risk_view = (
            "Market volatility is high, increasing uncertainty and the likelihood "
            "of sharp price swings."
        )
        risk_score = 35

    # ---------------------------------
    # 4. FINAL CONFIDENCE & DECISION
    # ---------------------------------
    final_confidence = round(
        (model_score * 0.45) +
        (momentum_score * 0.35) +
        (risk_score * 0.20)
    )

    if final_confidence >= 75:
        recommendation = "BUY"
        final_advice = (
            "Overall conditions favor a buying opportunity. "
            "The model outlook and technical indicators align positively, "
            "while market risk remains manageable."
        )
        risk_level = "LOW" if vix < 20 else "MODERATE"

    elif final_confidence >= 55:
        recommendation = "WAIT"
        final_advice = (
            "The stock shows some positive signs, but signals are not strong enough "
            "to justify an aggressive entry at this stage."
        )
        risk_level = "MODERATE"

    else:
        recommendation = "HIGH RISK"
        final_advice = (
            "Current signals indicate elevated risk. "
            "It may be safer to avoid or closely monitor this stock for now."
        )
        risk_level = "HIGH"

    # ---------------------------------
    # 5. HUMAN-FRIENDLY RESPONSE
    # ---------------------------------
    return {
        "recommendation": recommendation,
        "confidence_score": final_confidence,
        "risk_level": risk_level,
        "expected_return_percent": round(expected_return * 100, 2),

        "explanation": {
            "ai_outlook": model_view,
            "technical_summary": momentum_view,
            "technical_details": momentum_explanation,
            "market_context": risk_view,
            "final_advice": final_advice
        }
    }
