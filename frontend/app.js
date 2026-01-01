const API_KEY = "9HDUU4OWY70JH6OT";
const BACKEND_URL = "http://127.0.0.1:8000/predict";

/* DOM */
const loader = document.getElementById("loader");
const result = document.getElementById("result");
const analyzeBtn = document.getElementById("analyzeBtn");
const stockInput = document.getElementById("stockInput");

const verdictCard = document.getElementById("verdictCard");
const rsiCard = document.getElementById("rsiCard");
const macdCard = document.getElementById("macdCard");
const vixCard = document.getElementById("vixCard");
const confidenceCard = document.getElementById("confidenceCard");

const forecastCard = document.getElementById("forecastCard");
const forecastDirection = document.getElementById("forecastDirection");
const forecastConfidence = document.getElementById("forecastConfidence");

const positiveSignals = document.getElementById("positiveSignals");
const riskSignals = document.getElementById("riskSignals");

const confidenceBar = document.getElementById("confidenceBar");
const confidenceLabel = document.getElementById("confidenceLabel");

const reasoningBox = document.getElementById("reasoningBox");

let chartInstance = null;

/* Helpers */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
}

/* Indicators */
function calculateRSI(closes, period = 14) {
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length - 1; i++) {
    const diff = closes[i + 1] - closes[i];
    diff >= 0 ? gains += diff : losses -= diff;
  }
  return losses === 0 ? 100 : +(100 - 100 / (1 + gains / losses)).toFixed(2);
}

function ema(values, period) {
  const k = 2 / (period + 1);
  let e = values[0];
  for (let i = 1; i < values.length; i++) {
    e = values[i] * k + e * (1 - k);
  }
  return e;
}

function calculateMACD(closes) {
  return +(ema(closes, 12) - ema(closes, 26)).toFixed(4);
}

/* Fetch stock */
async function fetchStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data["Time Series (Daily)"]) {
    throw new Error("Invalid symbol or API limit reached");
  }

  await sleep(1200);
  return data["Time Series (Daily)"];
}

/* Chart */
function drawChart(dates, closes, predicted) {
  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById("priceChart");

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: [...dates.map(formatDate), "Prediction"],
      datasets: [
        {
          label: "Price",
          data: closes,
          borderColor: "#3b82f6",
          tension: 0.4
        },
        {
          label: "AI Prediction",
          data: [...Array(closes.length - 1).fill(null), closes.at(-1), predicted],
          borderColor: "#22c55e",
          borderDash: [6, 6],
          pointRadius: 6
        }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: "white" } } },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });
}

/* MAIN */
async function analyzeStock() {
  loader.classList.remove("hidden");
  result.classList.add("hidden");

  try {
    const symbol = stockInput.value.trim().toUpperCase();
    if (!symbol) throw new Error("Enter stock symbol");

    const raw = await fetchStockData(symbol);
    const dates = Object.keys(raw).reverse().slice(-30);

    const rows = dates.map(d => ({
      open: +raw[d]["1. open"],
      high: +raw[d]["2. high"],
      low: +raw[d]["3. low"],
      close: +raw[d]["4. close"],
      volume: +raw[d]["5. volume"]
    }));

    const closes = rows.map(r => r.close);
    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);
    const vix = 18;

    const payload = {
      symbol,
      last_30_days: rows.map(r => [
        r.open, r.high, r.low, r.close, r.volume, rsi, macd, vix, 5.25
      ]),
      current_price: closes.at(-1),
      rsi,
      macd,
      vix,
      interest_rate: 5.25
    };

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Backend error");
    }

    const data = await res.json();
    renderResult(data, dates, closes);

  } catch (err) {
    alert(err.message);
    console.error(err);
  }

  loader.classList.add("hidden");
}

/* UI RENDER */
function renderResult(data, dates, closes) {
  if (!data?.explanation) {
    alert("Invalid backend response");
    return;
  }

  result.classList.remove("hidden");

  verdictCard.innerText = `${data.recommendation} (${data.risk_level})`;
  rsiCard.innerHTML = `<b>RSI</b><br>${data.rsi}`;
  macdCard.innerHTML = `<b>MACD</b><br>${data.macd}`;
  vixCard.innerHTML = `<b>VIX</b><br>${data.vix}`;
  confidenceCard.innerHTML = `<b>Confidence</b><br>${data.confidence_score}%`;

  /* Forecast color logic */
const isUptrend = data.predicted_price >= data.current_price;
const confidence = data.confidence_score;

// reset all possible states
forecastCard.classList.remove(
  "border-green-500", "text-green-400",
  "border-yellow-500", "text-yellow-400",
  "border-red-500", "text-red-400",
  "border-orange-500", "text-orange-400"
);

// text
forecastDirection.innerText = isUptrend ? "▲ Uptrend" : "▼ Downtrend";
forecastConfidence.innerText = `${confidence}%`;

// UX-friendly logic
if (isUptrend && confidence >= 70) {
  // strong bullish
  forecastCard.classList.add("border-green-500", "text-green-400");

} else if (isUptrend && confidence >= 50) {
  // cautious bullish
  forecastCard.classList.add("border-yellow-500", "text-yellow-400");

} else if (!isUptrend && confidence >= 60) {
  // strong bearish
  forecastCard.classList.add("border-red-500", "text-red-400");

} else {
  // weak / uncertain
  forecastCard.classList.add("border-orange-500", "text-orange-400");
}


  /* Positive signals */
  positiveSignals.innerHTML = "";

  if (data.rsi >= 45 && data.rsi <= 65) {
    positiveSignals.innerHTML += `
      <li><b>Healthy RSI (${data.rsi})</b> – Balanced buying pressure <span class="text-green-400">[Strong]</span></li>`;
  }

  if (data.macd > 0) {
    positiveSignals.innerHTML += `
      <li><b>Positive MACD</b> – Bullish momentum confirmed <span class="text-green-400">[Strong]</span></li>`;
  }

  if (data.predicted_price > data.current_price) {
    positiveSignals.innerHTML += `
      <li><b>AI forecast above market price</b> – Upside potential detected <span class="text-green-400">[Moderate]</span></li>`;
  }

  /* Risk signals */
  riskSignals.innerHTML = "";

  if (data.vix >= 25) {
    riskSignals.innerHTML += `
      <li><b>High market volatility</b> – Sudden swings possible <span class="text-red-400">[High]</span></li>`;
  } else if (data.vix >= 18) {
    riskSignals.innerHTML += `
      <li><b>Moderate volatility</b> – Short-term fluctuations likely <span class="text-yellow-400">[Medium]</span></li>`;
  }

  if (data.confidence_score < 60) {
    riskSignals.innerHTML += `
      <li><b>Moderate confidence</b> – Signals not fully aligned <span class="text-yellow-400">[Medium]</span></li>`;
  }

  if (!riskSignals.innerHTML) {
    riskSignals.innerHTML = `<li>No major downside risks identified.</li>`;
  }

  /* Confidence bar */
  confidenceBar.style.width = `${data.confidence_score}%`;
  confidenceLabel.innerText = `${data.confidence_score}% confidence`;

  confidenceBar.classList.remove("bg-green-500", "bg-yellow-400", "bg-red-500");
  if (data.confidence_score >= 70) {
    confidenceBar.classList.add("bg-green-500");
  } else if (data.confidence_score >= 50) {
    confidenceBar.classList.add("bg-yellow-400");
  } else {
    confidenceBar.classList.add("bg-red-500");
  }

  /* AI Reasoning */
  reasoningBox.innerHTML = `
    <div class="space-y-3">
      <p><b>1️⃣ Model Outlook</b><br>${data.explanation.ai_outlook}</p>
      <p><b>2️⃣ Technical Confirmation</b><br>${data.explanation.technical_summary}</p>
      <p><b>3️⃣ Market Environment</b><br>${data.explanation.market_context}</p>
      <p class="border-t border-gray-600 pt-2"><b>4️⃣ Final AI Assessment</b><br>${data.explanation.final_advice}</p>
    </div>
  `;

  drawChart(dates, closes, data.predicted_price);
}

/* Events */
analyzeBtn.addEventListener("click", analyzeStock);
