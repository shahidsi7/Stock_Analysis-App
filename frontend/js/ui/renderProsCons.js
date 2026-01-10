export function renderProsAndCons(symbol, price, changePercent, rsi, macd, prediction, history) {
    const container = document.getElementById('pros-cons-container');
    if (!container) return;

    const sum = history.slice(-30).reduce((a, b) => a + b, 0);
    const sma30 = sum / 30;
    const isAboveSMA = price > sma30;
    const smaDiff = ((price - sma30) / sma30) * 100;
    const safeSignal = (prediction.signal || "NEUTRAL").toString();

    // 1. Identify Pros (Good things) with Humanized Text
    const pros = [];
    
    // Trend Pro
    if (isAboveSMA) {
        pros.push(`<strong>Strong Trend:</strong> Trading <strong>${Math.abs(smaDiff).toFixed(1)}%</strong> above its 30-day average, showing sustained strength.`);
    }
    // RSI Pro
    if (rsi < 30) {
        pros.push(`<strong>Value Zone:</strong> RSI is low (${rsi.toFixed(0)}), which typically attracts bargain hunters.`);
    } else if (rsi >= 40 && rsi <= 70) {
        pros.push(`<strong>Healthy Momentum:</strong> Buying interest is steady (RSI: ${rsi.toFixed(0)}) without looking overheated.`);
    }
    // MACD Pro
    if (macd > 0) {
        pros.push(`<strong>Confirmed Uptrend:</strong> Momentum indicators align with the rising price action.`);
    }
    // Daily Pro
    if (changePercent > 0) {
        pros.push(`<strong>Green Day:</strong> Up <strong>${changePercent.toFixed(2)}%</strong> today, showing immediate investor confidence.`);
    }
    // AI Pro
    if (safeSignal.includes("BUY")) {
        pros.push(`<strong>AI Outlook:</strong> Our models project a continuation of growth with <strong>${prediction.confidence_score}% confidence</strong>.`);
    }

    // 2. Identify Cons (Risks) with Humanized Text
    const cons = [];
    
    // Trend Con
    if (!isAboveSMA) {
        cons.push(`<strong>Weak Trend:</strong> Struggling <strong>${Math.abs(smaDiff).toFixed(1)}%</strong> below its 30-day average, a sign of caution.`);
    }
    // RSI Con
    if (rsi > 70) {
        cons.push(`<strong>Overheated:</strong> RSI is high (${rsi.toFixed(0)}), meaning the stock might be too expensive right now.`);
    } else if (rsi < 40 && rsi > 30) {
        cons.push(`<strong>Low Energy:</strong> Weak buying pressure (RSI: ${rsi.toFixed(0)}) suggests investors are hesitant.`);
    }
    // MACD Con
    if (macd < 0) {
        cons.push(`<strong>Negative Momentum:</strong> Technicals hint that sellers are currently in control.`);
    }
    // Daily Con
    if (changePercent < 0) {
        cons.push(`<strong>Red Day:</strong> Down <strong>${Math.abs(changePercent).toFixed(2)}%</strong> today, reflecting short-term selling pressure.`);
    }
    // AI Con
    if (safeSignal.includes("SELL")) {
        cons.push(`<strong>AI Warning:</strong> Our models detect downside risks you should be aware of.`);
    }

    // Fallbacks
    if (pros.length === 0) pros.push("No significant technical strengths detected right now.");
    if (cons.length === 0) cons.push("No major technical red flags detected right now.");

    // Helper to generate list HTML with better styling
    const generateList = (items, isPro) => items.map(item => `
        <li class="flex items-start mb-3 last:mb-0">
            <div class="mt-1 mr-3 flex-shrink-0">
                <i class="fas ${isPro ? 'fa-check-circle text-green-500' : 'fa-exclamation-triangle text-red-500'} text-lg"></i>
            </div>
            <span class="text-slate-600 text-sm leading-snug">${item}</span>
        </li>
    `).join('');

    container.innerHTML = `
        <!-- Pros Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-green-100 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
            <h3 class="text-lg font-bold mb-5 flex items-center text-slate-800 relative z-10">
                <span class="bg-green-100 text-green-700 p-2 rounded-lg mr-3">
                    <i class="fas fa-thumbs-up"></i>
                </span>
                Why it looks good
            </h3>
            <ul class="relative z-10">
                ${generateList(pros, true)}
            </ul>
        </div>

        <!-- Cons Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-red-100 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
            <h3 class="text-lg font-bold mb-5 flex items-center text-slate-800 relative z-10">
                <span class="bg-red-100 text-red-700 p-2 rounded-lg mr-3">
                    <i class="fas fa-thumbs-down"></i>
                </span>
                Risks to watch
            </h3>
            <ul class="relative z-10">
                ${generateList(cons, false)}
            </ul>
        </div>
    `;
}