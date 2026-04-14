# StockMind AI 🧠📈

> **Institutional-grade stock analysis powered by LSTM Neural Networks — built for everyone.**

StockMind AI is a full-stack, AI-powered stock prediction and analysis platform. It combines a deep learning backend (LSTM model served via FastAPI) with a real-time, data-rich frontend to deliver buy/sell/wait signals, confidence scores, technical indicators, fundamental health, news sentiment, and detailed reasoning — all in a single, clean interface.

---

## 🖼️ Overview

When a user searches for a stock ticker (e.g. `NVDA`, `AAPL`), StockMind:

1. Fetches **30 days of OHLCV history** from Alpha Vantage
2. Computes **RSI** and **MACD** on the client
3. Sends a structured payload to the **FastAPI backend**
4. The backend runs the **pre-trained LSTM model** to predict the next closing price
5. A **recommendation engine** fuses the AI prediction with technical indicators and VIX to produce a `BUY / WAIT / HIGH RISK` signal with a confidence score
6. The frontend renders charts, pros/cons, fundamentals, news, and detailed AI reasoning

---

## ✨ Features

| Feature | Description |
|---|---|
| **LSTM Price Prediction** | Pre-trained TensorFlow/Keras model predicts the next closing price using 30-day, 9-feature windows |
| **BUY / WAIT / HIGH RISK Signal** | Weighted scoring across AI model outlook (45%), technical momentum (35%), and market risk/VIX (20%) |
| **Confidence Score** | A single 0–100 score summarising overall signal conviction |
| **RSI Indicator** | 14-period Relative Strength Index calculated client-side |
| **MACD Indicator** | EMA-based MACD line calculated client-side (12/26/9) |
| **Price Chart** | Interactive Chart.js chart with historical prices, AI forecast point, and volume bars |
| **Fundamental Health** | Market cap, P/E ratio, Beta, dividend yield, insider sentiment, 52-week range, analyst target vs AI comparison |
| **Earnings Alert** | Warns when earnings are within 30 days (red badge ≤ 7 days, yellow badge ≤ 30 days) |
| **News & Sentiment** | Latest news from GNews with automated Bullish/Bearish/Neutral sentiment tagging |
| **Pros & Cons** | Human-friendly strengths and risk bullets generated dynamically from live signal data |
| **AI Reasoning** | Detailed, narrative explanation combining market context, technical deep-dive, and the AI verdict |
| **Stock Comparison** | Side-by-side metric comparison table for any two stocks |
| **Trending Grid** | 30 major US stocks (NVDA, AAPL, TSLA, etc.) displayed as quick-select cards |
| **Smart Caching** | Alpha Vantage responses are cached in localStorage (history: 1h, fundamentals: 24h, news: 1h) to stay within the free API tier |

---

## 🗂️ Project Structure

```
stockmind-ai/
│
├── backend/                        # Python / FastAPI backend
│   ├── main.py                     # FastAPI app entry point, CORS config
│   ├── api/
│   │   └── routes/
│   │       └── prediction.py       # POST /predict route
│   ├── schemas/
│   │   └── stock.py                # StockInput Pydantic model
│   ├── logic/
│   │   └── recommendation.py       # Signal & confidence scoring engine
│   ├── services/
│   │   └── model_service.py        # LSTM model loading & inference
│   ├── utils/
│   │   └── constants.py            # TIME_STEPS, NUM_FEATURES, weights
│   └── model/
│       ├── lstm_model.h5           # Pre-trained LSTM model (Keras)
│       └── scaler.pkl              # Fitted MinMaxScaler (joblib)
│
├── frontend/                       # Vanilla JS + HTML frontend
│   ├── index.html                  # Single-page app shell (Tailwind + Chart.js)
│   ├── js/
│   │   ├── app.js                  # App initialiser, event listeners
│   │   ├── router.js               # View switcher (home / analysis / about)
│   │   ├── api/
│   │   │   ├── stockApi.js         # Alpha Vantage + FastAPI + GNews fetch helpers
│   │   │   └── trendingApi.js      # FMP trending stocks fetch
│   │   ├── charts/
│   │   │   └── priceChart.js       # Chart.js price + volume chart
│   │   ├── data/
│   │   │   └── usStocks.js         # Static list of 30 trending US stocks
│   │   ├── indicators/
│   │   │   ├── rsi.js              # RSI calculation (14-period Wilder smoothing)
│   │   │   └── macd.js             # MACD calculation (EMA 12/26)
│   │   ├── pages/
│   │   │   └── stock.js            # Full analysis pipeline orchestrator
│   │   ├── ui/
│   │   │   ├── renderSignals.js    # BUY/WAIT/SELL signal card
│   │   │   ├── renderConfidence.js # Confidence score progress bar
│   │   │   ├── renderReasoning.js  # AI reasoning narrative
│   │   │   ├── renderProsCons.js   # Dynamic pros & cons lists
│   │   │   ├── renderFundamentals.js # Fundamental health card
│   │   │   ├── renderNews.js       # News & sentiment feed
│   │   │   ├── renderCompare.js    # Stock comparison table
│   │   │   └── renderStockList.js  # Trending grid renderer
│   │   └── utils/
│   │       └── analysisFormatter.js # Narrative reasoning generator
│
├── requirements.txt                # Python dependencies
└── .gitignore
```

---

## ⚙️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API Framework | [FastAPI](https://fastapi.tiangolo.com/) |
| ML Framework | [TensorFlow 2.20 / Keras 3.13](https://www.tensorflow.org/) |
| Model Architecture | LSTM (Long Short-Term Memory) |
| Scaler | scikit-learn `MinMaxScaler` (saved via joblib) |
| Data Validation | Pydantic v2 |
| Server | Uvicorn |

### Frontend
| Layer | Technology |
|---|---|
| UI | Vanilla JavaScript (ES Modules) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) (CDN) |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Icons | Font Awesome 6 |
| Market Data | [Alpha Vantage API](https://www.alphavantage.co/) |
| News | [GNews API](https://gnews.io/) |
| Trending Data | [Financial Modeling Prep API](https://financialmodelingprep.com/) |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js (optional — only needed if you serve the frontend with a local server)
- API keys for:
  - [Alpha Vantage](https://www.alphavantage.co/support/#api-key) (free tier: 25 req/day, 5 req/min)
  - [GNews](https://gnews.io/) (free tier available)
  - [Financial Modeling Prep](https://financialmodelingprep.com/) (optional, for trending prices)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stockmind-ai.git
cd stockmind-ai
```

---

### 2. Backend Setup

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install Python dependencies
pip install -r requirements.txt
```

Ensure the pre-trained model files are in place:

```
backend/model/lstm_model.h5
backend/model/scaler.pkl
```

Start the FastAPI server:

```bash
uvicorn backend.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. You can explore the auto-generated docs at `http://localhost:8000/docs`.

---

### 3. Frontend Setup

Update your API keys inside `frontend/js/api/stockApi.js`:

```js
const API_KEY = 'YOUR_ALPHA_VANTAGE_KEY';
const GNEWS_API_KEY = 'YOUR_GNEWS_KEY';
```

And in `frontend/js/api/trendingApi.js`:

```js
const API_KEY = 'YOUR_FMP_KEY';
```

Serve the frontend using any static file server. For example, with Python:

```bash
cd frontend
python -m http.server 5500
```

Or with the VS Code **Live Server** extension — open `index.html` and click **Go Live**.

Then open your browser at `http://localhost:5500`.

> **Important:** The frontend makes requests to `http://localhost:8000` (the FastAPI backend). Both must be running simultaneously.

---

## 🔌 API Reference

### `POST /predict`

Runs the LSTM model and recommendation engine for a given stock.

**Request Body:**

```json
{
  "symbol": "NVDA",
  "last_30_days": [
    [open, high, low, close, volume, rsi, macd, vix, interest_rate],
    ...
  ],
  "current_price": 875.40,
  "rsi": 58.3,
  "macd": 12.5,
  "vix": 18.5,
  "interest_rate": 5.25
}
```

| Field | Type | Description |
|---|---|---|
| `symbol` | `string` | Stock ticker symbol (e.g. `"AAPL"`) |
| `last_30_days` | `float[][]` | 30 rows × 9 features: `[open, high, low, close, volume, rsi, macd, vix, interest_rate]` |
| `current_price` | `float` | Latest closing price |
| `rsi` | `float` | 14-period RSI value |
| `macd` | `float` | MACD line value |
| `vix` | `float` | CBOE Volatility Index (market fear gauge) |
| `interest_rate` | `float` | Current federal interest rate |

**Response:**

```json
{
  "symbol": "NVDA",
  "current_price": 875.40,
  "predicted_price": 901.25,
  "rsi": 58.3,
  "macd": 12.5,
  "vix": 18.5,
  "recommendation": "BUY",
  "confidence_score": 78,
  "risk_level": "LOW",
  "expected_return_percent": 2.95,
  "explanation": {
    "ai_outlook": "The AI model predicts moderate upward movement...",
    "technical_summary": "Overall technical indicators suggest bullish momentum.",
    "technical_details": ["RSI is in a healthy range...", "MACD is positive..."],
    "market_context": "Market volatility is currently low...",
    "final_advice": "Overall conditions favor a buying opportunity..."
  },
  "interest_rate_used": 5.25,
  "disclaimer": "This is AI-based analysis, not financial advice."
}
```

---

## 🧠 How the Model Works

### LSTM Architecture

The model is a **Long Short-Term Memory (LSTM)** neural network trained on sequential stock price data. It processes a sliding window of the **last 30 trading days**, with **9 features per day**:

| Feature Index | Feature |
|---|---|
| 0 | Open Price |
| 1 | High Price |
| 2 | Low Price |
| 3 | **Close Price** (prediction target) |
| 4 | Volume |
| 5 | RSI (14-period) |
| 6 | MACD |
| 7 | VIX |
| 8 | Interest Rate |

**Inference pipeline (`model_service.py`):**
1. Validates input shape: `(30, 9)`
2. Applies the fitted `MinMaxScaler` to normalise features
3. Runs a single forward pass through the LSTM
4. Inverse-transforms the scaled output back to a dollar price using the close-price column index

### Recommendation Engine

The signal is computed as a **weighted confidence score**:

```
Final Confidence = (Model Score × 0.45) + (Momentum Score × 0.35) + (Risk Score × 0.20)
```

| Component | Weight | Inputs |
|---|---|---|
| AI Model Outlook | 45% | Expected return % from LSTM prediction |
| Technical Momentum | 35% | RSI (0–100), MACD sign |
| Market Risk (VIX) | 20% | VIX level (low < 18, moderate < 25, high ≥ 25) |

**Signal thresholds:**

| Confidence | Signal |
|---|---|
| ≥ 75 | `BUY` |
| 55 – 74 | `WAIT` |
| < 55 | `HIGH RISK` |

---

## 📊 Technical Indicators

### RSI (Relative Strength Index)
Calculated client-side using **Wilder's smoothing method** over a 14-period window. Values above 70 indicate overbought conditions; below 30 indicate oversold.

### MACD (Moving Average Convergence Divergence)
Calculated using **12-period EMA** and **26-period EMA**. A positive MACD line confirms bullish momentum; negative confirms bearish.

---

## 🔑 API Keys & Rate Limits

| Service | Free Tier | Used For | Cache TTL |
|---|---|---|---|
| Alpha Vantage | 25 req/day, 5 req/min | OHLCV history, fundamentals | 1h (history), 24h (fundamentals) |
| GNews | 100 req/day | News articles | 1h |
| Financial Modeling Prep | Limited | Trending stock prices | None (fallback to static) |

> All Alpha Vantage responses are cached in `localStorage` with TTL-based expiry to stay within the free tier. Cached results are served on subsequent requests without hitting the API.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the model, add new indicators, or enhance the UI:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---