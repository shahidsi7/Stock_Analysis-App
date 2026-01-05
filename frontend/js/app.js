import { fetchStockData, sendForPrediction } from "./api/stockApi.js";
import { calculateRSI } from "./indicators/rsi.js";
import { calculateMACD } from "./indicators/macd.js";
import { drawPriceChart } from "./charts/priceChart.js";
import { renderForecast } from "./ui/renderForecast.js";
import { renderConfidence } from "./ui/renderConfidence.js";
import { renderReasoning } from "./ui/renderReasoning.js";
import { renderSignals } from "./ui/renderSignals.js";
import { renderIndicators } from "./ui/renderIndicators.js";


const loader = document.getElementById("loader");
const result = document.getElementById("result");
const analyzeBtn = document.getElementById("analyzeBtn");
const stockInput = document.getElementById("stockInput");

async function analyzeStock() {
  loader.classList.remove("hidden");
  result.classList.add("hidden");

  try {
    const symbol = stockInput.value.trim().toUpperCase();
    if (!symbol) throw new Error("Enter stock symbol");

    // 1️⃣ Fetch market data
    const raw = await fetchStockData(symbol);
    const dates = Object.keys(raw).reverse().slice(-30);

    // 2️⃣ Prepare OHLCV rows
    const rows = dates.map(d => ({
      open: +raw[d]["1. open"],
      high: +raw[d]["2. high"],
      low: +raw[d]["3. low"],
      close: +raw[d]["4. close"],
      volume: +raw[d]["5. volume"]
    }));

    const closes = rows.map(r => r.close);

    // 3️⃣ Indicators
    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);
    const vix = 18; // placeholder

    // 4️⃣ Backend payload
    const payload = {
      symbol,
      last_30_days: rows.map(r => [
        r.open,
        r.high,
        r.low,
        r.close,
        r.volume,
        rsi,
        macd,
        vix,
        5.25 // interest rate
      ]),
      current_price: closes.at(-1),
      rsi,
      macd,
      vix,
      interest_rate: 5.25
    };

    // 5️⃣ Backend call
    const data = await sendForPrediction(payload);

    if (!data?.explanation) {
      throw new Error("Invalid backend response");
    }

    // 6️⃣ Render UI
    result.classList.remove("hidden");
    renderForecast(data);
    renderIndicators(data);
    renderConfidence(data.confidence_score);
    renderSignals(data);
    renderReasoning(data.explanation);
    drawPriceChart(dates, closes, data.predicted_price);

  } catch (err) {
    alert(err.message);
    console.error(err);
  } finally {
    loader.classList.add("hidden");
  }
}

analyzeBtn.addEventListener("click", analyzeStock);
