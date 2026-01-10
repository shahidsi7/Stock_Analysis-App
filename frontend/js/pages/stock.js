import { fetchStockData, sendForPrediction } from '../api/stockApi.js';
import { calculateRSI } from '../indicators/rsi.js';
import { calculateMACD } from '../indicators/macd.js';
import { renderSignals } from '../ui/renderSignals.js';
import { renderIndicators } from '../ui/renderIndicators.js';
import { renderForecast } from '../ui/renderForecast.js';
import { renderConfidence } from '../ui/renderConfidence.js';
import { renderReasoning } from '../ui/renderReasoning.js';
import { renderProsAndCons } from '../ui/renderProsCons.js';
import { drawPriceChart } from '../charts/priceChart.js';
import { generateDetailedReasoning } from '../utils/analysisFormatter.js';
import { switchView } from '../router.js';

export async function handleStockSelection(symbol) {
    switchView('analysis-view');
    
    // Reset UI
    const nameDisplay = document.getElementById('stock-name-display');
    if (nameDisplay) nameDisplay.innerText = symbol;
    
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error-message');
    
    if (loading) loading.classList.remove('hidden');
    if (resultDiv) resultDiv.classList.add('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');

    try {
        console.log(`1. Fetching data for ${symbol}...`);
        
        // STEP 1: Get History from Alpha Vantage
        const rawData = await fetchStockData(symbol);
        
        // Ensure we have enough data (Last 30 days needed for LSTM)
        if (!rawData || rawData.length < 30) {
            throw new Error(`Insufficient data. Need 30 days, got ${rawData ? rawData.length : 0}.`);
        }

        const closes = rawData.map(d => d.close);
        const dates = rawData.map(d => d.date);

        // STEP 2: Calculate Indicators (RSI, MACD) on Frontend
        const rsi = calculateRSI(closes);
        const macd = calculateMACD(closes);
        const vix = 18.5; // Placeholder/Default VIX
        const interestRate = 5.25; // Placeholder Interest Rate

        // STEP 3: Format Payload for Backend
        // Take exactly the last 30 days
        const last30Rows = rawData.slice(-30); 
        
        const payload = {
            symbol: symbol,
            last_30_days: last30Rows.map(r => [
                r.open,
                r.high,
                r.low,
                r.close,
                r.volume,
                rsi,   
                macd,  
                vix,
                interestRate
            ]),
            current_price: closes[closes.length - 1],
            rsi: rsi,
            macd: macd,
            vix: vix,
            interest_rate: interestRate
        };

        console.log("2. Sending to AI Model...");

        // STEP 4: Get Prediction
        const prediction = await sendForPrediction(payload);
        
        // SAFETY: Default values if backend response is incomplete
        if (!prediction.signal) prediction.signal = "NEUTRAL";
        if (prediction.confidence_score === undefined || prediction.confidence_score === null) prediction.confidence_score = 0;
        if (!prediction.predicted_price) prediction.predicted_price = closes[closes.length - 1];

        console.log("3. Rendering Results...");

        // STEP 5: Render UI
        const currentPrice = closes[closes.length - 1];
        const prevPrice = closes[closes.length - 2];
        const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;
        
        const priceEl = document.getElementById('current-price');
        // Add color for price change
        const changeColor = priceChange >= 0 ? 'text-green-600' : 'text-red-600';
        const changeSign = priceChange >= 0 ? '+' : '';
        if (priceEl) {
            priceEl.innerHTML = `
                $${currentPrice.toFixed(2)} 
                <span class="text-lg ${changeColor} ml-2">
                    ${changeSign}${priceChange.toFixed(2)}%
                </span>
            `;
        }

        // Generate Reasoning & Pros/Cons
        const detailedReasoning = generateDetailedReasoning(symbol, currentPrice, priceChange, rsi, macd, prediction, closes);
        
        let displaySignal = prediction.signal;
        // Ensure displaySignal is a string
        if (typeof displaySignal !== 'string') displaySignal = "NEUTRAL";

        if (prediction.confidence_score >= 80) {
             displaySignal = `STRONG ${displaySignal}`;
        } else if (prediction.confidence_score < 60) {
             displaySignal = `WEAK ${displaySignal}`;
        }
        
        // Create render object
        const finalRenderData = { ...prediction, signal: displaySignal };

        renderSignals(finalRenderData); 
        renderIndicators({ rsi, macd });
        renderForecast(prediction);
        renderConfidence(prediction.confidence_score);
        renderReasoning(detailedReasoning);
        
        // New: Render Enhanced Pros & Cons
        renderProsAndCons(symbol, currentPrice, priceChange, rsi, macd, prediction, closes);

        // Draw Chart
        drawPriceChart(dates, closes, prediction.predicted_price);

        // Show Results
        if (loading) loading.classList.add('hidden');
        if (resultDiv) resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error("Pipeline Failed:", error);
        if (loading) loading.classList.add('hidden');
        if (errorDiv) {
            errorDiv.classList.remove('hidden');
            errorDiv.innerHTML = `
                <p class="font-bold text-lg mb-2">Analysis Failed</p>
                <p class="text-sm opacity-90">${error.message || "Unknown error occurred"}</p>
                <button onclick="location.reload()" class="mt-4 bg-white text-red-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
                    Back to Home
                </button>
            `;
        }
    }
}