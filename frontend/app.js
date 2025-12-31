/***************************************
 * CONFIG
 ***************************************/
const API_KEY = "9HDUU4OWY70JH6OT";
const BACKEND_URL = "http://127.0.0.1:8000/predict";

/***************************************
 * UTILITIES
 ***************************************/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/***************************************
 * FETCH STOCK OHLCV DATA
 ***************************************/
async function fetchStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  // ✅ Validate response
  if (!data || !data["Time Series (Daily)"]) {
    console.error("Stock API error:", data);
    throw new Error(
  "Invalid stock symbol or unsupported market. Try US stocks like AAPL, MSFT, TSLA."
);

  }

  // ✅ Rate-limit protection
  await sleep(1200);

  return data["Time Series (Daily)"];
}

/***************************************
 * TECHNICAL INDICATORS
 ***************************************/
function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  const recent = closes.slice(-1 * (period + 1));

  for (let i = 1; i < recent.length; i++) {
    const diff = recent[i] - recent[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  if (losses === 0) return 100;

  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}


function ema(values, period) {
  const k = 2 / (period + 1);
  let emaArr = [values[0]];

  for (let i = 1; i < values.length; i++) {
    emaArr.push(values[i] * k + emaArr[i - 1] * (1 - k));
  }

  return emaArr;
}

function calculateMACD(closes) {
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  return ema12[ema12.length - 1] - ema26[ema26.length - 1];
}

/***************************************
 * MACRO DATA (SAFE FALLBACKS)
 ***************************************/
function fetchVIX() {
  // US VIX fallback (normal market volatility)
  return 18;
}


function getRepoRate() {
  return 5.25; // US Fed Funds Rate (static)
}


/***************************************
 * MAIN ANALYSIS FUNCTION
 ***************************************/

function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

function disableButton() {
  document.getElementById("analyzeBtn").disabled = true;
}

function enableButton() {
  document.getElementById("analyzeBtn").disabled = false;
}


async function analyzeStock() {
  const resultDiv = document.getElementById("result");
  resultDiv.classList.add("hidden");

  showLoader();
  disableButton();

  try {
    const input = document.getElementById("stockInput").value.trim();

    if (!input) {
       alert("Please enter a stock symbol");
      return;
    }

    const symbol = input.toUpperCase(); // e.g. AAPL, MSFT

    const rawData = await fetchStockData(symbol);
    const dates = Object.keys(rawData).slice(0, 70).reverse();

    if (dates.length < 60) {
      throw new Error("Not enough historical data");
    }

    const rows = dates.map(d => ({
      open: +rawData[d]["1. open"],
      high: +rawData[d]["2. high"],
      low: +rawData[d]["3. low"],
      close: +rawData[d]["4. close"],
      volume: +rawData[d]["5. volume"]
    }));

    const closes = rows.map(r => r.close);

    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);
    const vix = fetchVIX();
    const interestRate = getRepoRate();

    const last30 = rows.slice(-30).map(r => ([
      r.open,
      r.high,
      r.low,
      r.close,
      r.volume,
      rsi,
      macd,
      vix,
      interestRate
    ]));

    const payload = {
      symbol: input,
      last_30_days: last30,
      current_price: closes[closes.length - 1],
      rsi,
      macd,
      vix,
      interest_rate: interestRate
    };

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error("Backend prediction failed");
    }

    const data = await res.json();
    showResult(data);

  } catch (err) {
    console.error(err);
    alert(err.message || "Something went wrong");
  } finally {
    // ✅ ALWAYS runs (success OR error)
    hideLoader();
    enableButton();
  }
}

/***************************************
 * UI RENDER
 ***************************************/
function showResult(data) {
  const div = document.getElementById("result");
  div.classList.remove("hidden");

  div.innerHTML = `
    <div class="mt-4 bg-gray-700 p-4 rounded">
      <p><b>Stock:</b> ${data.symbol}</p>
      <p><b>Current Price:</b> $${data.current_price}</p>
      <p><b>Predicted Price:</b> $${data.predicted_price}</p>
      <p><b>Recommendation:</b> ${data.recommendation}</p>
      <p><b>Confidence:</b> ${data.confidence_score}%</p>
      <p><b>Risk Level:</b> ${data.risk_level}</p>
      <p class="mt-2 font-semibold">Why?</p>
      <ul class="list-disc ml-5">
        ${data.why_this_recommendation.map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>
  `;
}
