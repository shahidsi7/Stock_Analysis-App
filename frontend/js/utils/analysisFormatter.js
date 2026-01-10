export function generateDetailedReasoning(symbol, price, changePercent, rsi, macd, prediction, history) {
    // 1. Analyze Price Trend vs 30-day Avg
    const sum = history.slice(-30).reduce((a, b) => a + b, 0);
    const sma30 = sum / 30;
    const isAboveSMA = price > sma30;
    
    // Construct Opening Context
    const direction = changePercent >= 0 ? "gained" : "lost";
    let opening = `<strong>${symbol}</strong> ${direction} ${Math.abs(changePercent).toFixed(2)}% to close at <strong>$${price.toFixed(2)}</strong>. `;
    
    if (isAboveSMA && changePercent > 0) {
        opening += "The stock continues to show strength, maintaining its position above the 30-day baseline.";
    } else if (isAboveSMA && changePercent < 0) {
        opening += "Despite today's dip, the broader trend remains positive as it holds above the 30-day average.";
    } else if (!isAboveSMA && changePercent > 0) {
        opening += "While today's move is positive, the stock remains in a downtrend below its 30-day average.";
    } else {
        opening += "The bearish trend persists, with the price remaining below its key 30-day moving average.";
    }

    // 2. Technical Deep Dive (RSI & MACD Synthesis)
    let deepDive = "";
    
    // RSI Context
    if (rsi > 70) {
        deepDive += "Trading activity has been intense, pushing the RSI into overbought territory. This often signals that buyers may soon be exhausted.";
    } else if (rsi < 30) {
        deepDive += "Selling pressure has been relentless, driving the RSI into oversold levels. Historically, such extremes can precede a snap-back rally.";
    } else if (rsi >= 50) {
        deepDive += "Momentum is moderately positive, with the RSI showing room for further upside before hitting extreme levels.";
    } else {
        deepDive += "Momentum remains weak, with the RSI below 50, reflecting a lack of aggressive buying interest.";
    }

    // MACD Context (Connecting phrase)
    if (macd > 0 && rsi >= 50) {
        deepDive += " Concurrently, the MACD alignment confirms this bullish sentiment.";
    } else if (macd < 0 && rsi < 50) {
        deepDive += " The negative MACD reading reinforces this bearish outlook.";
    } else {
        deepDive += " However, divergence in the MACD suggests the current trend might be losing steam, urging caution.";
    }

    // 3. AI Verdict Construction
    const rawSignal = prediction.signal || "NEUTRAL";
    const safeSignal = typeof rawSignal === 'string' ? rawSignal : String(rawSignal);
    
    const confidence = prediction.confidence_score;
    let verdict = "";
    
    if (safeSignal.includes("BUY")) {
        verdict = confidence > 75 
            ? "Aggregating these data points, our AI identifies a <strong>high-conviction buying opportunity</strong>."
            : "The technicals lean positive, prompting a <strong>speculative buy</strong> rating, though validation is needed.";
    } else if (safeSignal.includes("SELL")) {
        verdict = confidence > 75 
            ? "Given the deterioration in key metrics, the AI advises a <strong>defensive exit or short position</strong>."
            : "Weakness is evident. The model suggests <strong>reducing exposure</strong>, though a reversal is not impossible.";
    } else {
        verdict = "With conflicting signals between trend and momentum, the AI recommends a <strong>wait-and-see approach</strong>.";
    }

    // 4. Handle Explanation
    let modelNote = "";
    if (prediction.explanation && typeof prediction.explanation === 'string' && prediction.explanation.length > 5) {
        modelNote = prediction.explanation;
    }

    // 5. Final Layout Construction
    return `
        <div class="text-slate-700 text-sm space-y-4 leading-relaxed font-sans">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Market Context</h4>
                <p>${opening}</p>
            </div>
            
            <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Technical Deep Dive</h4>
                <p>${deepDive}</p>
            </div>

            <div class="border-l-4 ${safeSignal.includes('BUY') ? 'border-green-500' : (safeSignal.includes('SELL') ? 'border-red-500' : 'border-slate-400')} pl-4 py-1">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Verdict (${confidence}% Conf.)</h4>
                <p>${verdict}</p>
            </div>
            
            ${modelNote ? `
            <div class="mt-2 text-xs text-slate-500 italic">
                <i class="fas fa-robot mr-1"></i> "${modelNote}"
            </div>` : ''}
        </div>
    `;
}