import { calculateRSI } from '../indicators/rsi.js';
import { calculateMACD } from '../indicators/macd.js';
import { renderSignals } from '../ui/renderSignals.js';
import { renderIndicators } from '../ui/renderIndicators.js';
import { renderConfidence } from '../ui/renderConfidence.js';
import { renderReasoning } from '../ui/renderReasoning.js';
import { renderProsAndCons } from '../ui/renderProsCons.js';
import { drawPriceChart } from '../charts/priceChart.js';
import { generateDetailedReasoning } from '../utils/analysisFormatter.js';
import { switchView } from '../router.js';
import { fetchStockData, sendForPrediction, fetchFundamentals, fetchNews } from '../api/stockApi.js';
import { renderFundamentals } from '../ui/renderFundamentals.js';
import { renderNews } from '../ui/renderNews.js';


export async function handleStockSelection(symbol) {
    switchView('analysis-view');
    
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
        
        if (!rawData || rawData.length < 30) {
            throw new Error(`Insufficient data. Need 30 days, got ${rawData ? rawData.length : 0}.`);
        }

        const closes = rawData.map(d => d.close);
        const dates = rawData.map(d => d.date);

        // STEP 2: Calculate Indicators
        const rsi = calculateRSI(closes);
        const macd = calculateMACD(closes);
        const vix = 18.5;
        const interestRate = 5.25;

        // STEP 3: Format Payload
        const last30Rows = rawData.slice(-30); 
        
        const payload = {
            symbol: symbol,
            last_30_days: last30Rows.map(r => [
                r.open, r.high, r.low, r.close, r.volume,
                rsi, macd, vix, interestRate
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
        
        if (!prediction.signal) prediction.signal = "NEUTRAL";
        if (prediction.confidence_score === undefined || prediction.confidence_score === null) prediction.confidence_score = 0;
        if (!prediction.predicted_price) prediction.predicted_price = closes[closes.length - 1];

        console.log("3. Rendering Results...");

        // STEP 5: Wait 1s to respect Alpha Vantage rate limit, then fetch fundamentals + news
        await new Promise(resolve => setTimeout(resolve, 1000));
        const [fundamentals, news] = await Promise.all([
            fetchFundamentals(symbol),
            fetchNews(symbol)
        ]);
        renderFundamentals('fundamentals-container', fundamentals, prediction.predicted_price);
        renderNews(news);

        // STEP 6: Render UI
        const currentPrice = closes[closes.length - 1];
        const prevPrice = closes[closes.length - 2];
        const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;
        
        const priceEl = document.getElementById('current-price');
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

        const detailedReasoning = generateDetailedReasoning(symbol, currentPrice, priceChange, rsi, macd, prediction, closes);
        
        let displaySignal = prediction.signal;
        if (typeof displaySignal !== 'string') displaySignal = "NEUTRAL";

        if (prediction.confidence_score >= 80) {
            displaySignal = `STRONG ${displaySignal}`;
        } else if (prediction.confidence_score < 60) {
            displaySignal = `WEAK ${displaySignal}`;
        }
        
        const finalRenderData = { ...prediction, signal: displaySignal };

        renderSignals(finalRenderData); 
        renderIndicators({ rsi, macd });
        renderConfidence(prediction.confidence_score);
        renderReasoning(detailedReasoning);
        renderProsAndCons(symbol, currentPrice, priceChange, rsi, macd, prediction, closes);

        const volumes = rawData.map(d => d.volume);
        drawPriceChart(dates, closes, prediction.predicted_price, volumes);

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

export function getLastAnalysis() {
    return lastAnalysis;
}