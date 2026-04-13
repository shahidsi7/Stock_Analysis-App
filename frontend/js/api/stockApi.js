// ============================================================
//  CONFIGURATION
// ============================================================

// 1. The Backend for AI Predictions (Your Local Python Server)
const PREDICTION_API_URL = 'http://localhost:8000';

// 2. Alpha Vantage API Configuration
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const API_KEY = 'VMJ5MCJHH0QTFYLP';

// ============================================================
//  CACHE HELPERS  (localStorage with per-key TTL)
//  Free tier = 25 req/day & 5 req/min, so we cache aggressively:
//    - Price history  → 1 hour
//    - Fundamentals   → 24 hours
//    - News           → 1 hour
// ============================================================
const CACHE_TTL = {
    history:      1 * 60 * 60 * 1000,   // 1 hour  in ms
    fundamentals: 24 * 60 * 60 * 1000,  // 24 hours in ms
    news:         1 * 60 * 60 * 1000,   // 1 hour  in ms
};

function cacheSet(key, value, ttlMs) {
    try {
        const entry = { value, expiresAt: Date.now() + ttlMs };
        localStorage.setItem(`stockmind_${key}`, JSON.stringify(entry));
    } catch (e) {
        // localStorage may be unavailable (private browsing quota exceeded, etc.)
        console.warn('Cache write failed:', e);
    }
}

function cacheGet(key) {
    try {
        const raw = localStorage.getItem(`stockmind_${key}`);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() > entry.expiresAt) {
            localStorage.removeItem(`stockmind_${key}`);
            return null;
        }
        return entry.value;
    } catch (e) {
        return null;
    }
}

// ============================================================
//  RATE-LIMIT / ERROR HELPER
//  Converts raw Alpha Vantage error responses into clear messages
// ============================================================
function checkAlphaVantageErrors(rawData) {
    if (rawData['Error Message']) {
        throw new Error('Invalid stock symbol. Please check the ticker and try again.');
    }
    if (rawData['Note']) {
        throw new Error(
            'Alpha Vantage rate limit hit (5 calls/min). ' +
            'Please wait ~60 seconds and try again.'
        );
    }
    if (rawData['Information']) {
        throw new Error(
            'Daily API limit reached (25 calls/day on free tier). ' +
            'Cached data will be used where available. ' +
            'Try again tomorrow or upgrade your Alpha Vantage plan.'
        );
    }
}

// ============================================================
//  fetchStockData  — Daily OHLCV history (cached 1 hour)
// ============================================================
export async function fetchStockData(symbol) {
    const cacheKey = `history_${symbol}`;
    const cached = cacheGet(cacheKey);

    if (cached) {
        console.log(`[Cache HIT] History for ${symbol}`);
        return cached;
    }

    try {
        console.log(`[API] Fetching history for ${symbol} from Alpha Vantage...`);

        // outputsize=compact returns the latest 100 data points (plenty for 30-day window)
        // and is faster than the full 20-year default response.
        const url = `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_DAILY` +
                    `&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network error: ${response.statusText}`);

        const rawData = await response.json();
        checkAlphaVantageErrors(rawData);

        const timeSeries = rawData['Time Series (Daily)'];
        if (!timeSeries) throw new Error('No pricing data found for this symbol.');

        // Parse into array sorted oldest → newest
        const history = Object.keys(timeSeries)
            .map(date => {
                const d = timeSeries[date];
                return {
                    date,
                    open:   parseFloat(d['1. open']),
                    high:   parseFloat(d['2. high']),
                    low:    parseFloat(d['3. low']),
                    close:  parseFloat(d['4. close']),
                    volume: parseInt(d['5. volume']),
                };
            })
            .reverse(); // newest-first → oldest-first

        cacheSet(cacheKey, history, CACHE_TTL.history);
        return history;

    } catch (error) {
        console.error('fetchStockData failed:', error);
        throw error;
    }
}

// ============================================================
//  sendForPrediction  — POST to local FastAPI backend
// ============================================================
export async function sendForPrediction(payload) {
    try {
        console.log('Sending processed data to Backend Prediction Model...');
        const response = await fetch(`${PREDICTION_API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Prediction API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('sendForPrediction failed:', error);
        throw error;
    }
}

// ============================================================
//  fetchFundamentals  — OVERVIEW + INSIDER_TRANSACTIONS (cached 24 hrs)
// ============================================================
export async function fetchFundamentals(symbol) {
    const cacheKey = `fundamentals_${symbol}`;
    const cached = cacheGet(cacheKey);

    if (cached) {
        console.log(`[Cache HIT] Fundamentals for ${symbol}`);
        return cached;
    }

    try {
        console.log(`[API] Fetching fundamentals for ${symbol}...`);

        // Two parallel calls — counts as 2 of the 25 daily quota
        const [overviewRes, insiderRes] = await Promise.all([
            fetch(`${ALPHA_VANTAGE_BASE}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`),
            fetch(`${ALPHA_VANTAGE_BASE}?function=INSIDER_TRANSACTIONS&symbol=${symbol}&apikey=${API_KEY}`),
        ]);

        const overview = await overviewRes.json();
        const insider  = await insiderRes.json();

        // Silently skip if rate-limited (fundamentals are non-critical)
        if (overview['Information'] || overview['Note']) {
            console.warn('Fundamentals: rate limit hit, skipping.');
            return null;
        }

        if (!overview || !overview.Symbol) return null;

        // Derive insider sentiment
        let insider_sentiment = 'Neutral';
        const transactions = insider?.data?.slice(0, 10) || [];
        if (transactions.length > 0) {
            let score = 0;
            transactions.forEach(tx => {
                const type = (tx.transactionType || '').toUpperCase();
                if (type.includes('PURCHASE')) score += 1;
                else if (type.includes('SALE'))  score -= 1;
            });
            insider_sentiment = score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral';
        }

        const result = {
            market_cap:       overview.MarketCapitalization,
            pe_ratio:         overview.PERatio,
            beta:             overview.Beta,
            dividend_yield:   overview.DividendYield,
            insider_sentiment,
            week_52_high:     overview['52WeekHigh'],
            week_52_low:      overview['52WeekLow'],
            analyst_target:   overview.AnalystTargetPrice,
            next_earnings:    overview.NextEarningsDate,
        };

        cacheSet(cacheKey, result, CACHE_TTL.fundamentals);
        return result;

    } catch (err) {
        console.error('fetchFundamentals failed:', err);
        return null;
    }
}

// ============================================================
//  fetchNews  — NEWS_SENTIMENT (cached 1 hour)
// ============================================================
const GNEWS_API_KEY = '68408886518af58f9a2b039f765ac59f';

export async function fetchNews(symbol) {
    const cacheKey = `news_${symbol}`;
    const cached = cacheGet(cacheKey);

    if (cached) {
        console.log(`[Cache HIT] News for ${symbol}`);
        return cached;
    }

    try {
        console.log(`[API] Fetching news for ${symbol} from GNews...`);

        const url = `https://gnews.io/api/v4/search?q=${symbol}+stock` +
                    `&lang=en&max=5&sortby=publishedAt&apikey=${GNEWS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            console.warn(`[News] No articles found for ${symbol}`);
            return [];
        }

        // Normalize to match the shape renderNews.js already expects
        const articles = data.articles.map(a => ({
            title:                   a.title,
            url:                     a.url,
            source:                  a.source?.name || '',
            banner_image:            a.image || null,
            time_published:          a.publishedAt?.replace(/[-T:]/g, '').slice(0, 8),
            overall_sentiment_label: /\b(surge|rally|gain|beat|up|rise)\b/i.test(a.title)
                ? 'Bullish'
                : /\b(drop|fall|loss|miss|down|cut|crash)\b/i.test(a.title)
                ? 'Bearish'
                : 'Neutral'
        }));

        cacheSet(cacheKey, articles, CACHE_TTL.news);
        console.log(`[News] Got ${articles.length} articles for ${symbol}`);
        return articles;

    } catch (err) {
        console.error('fetchNews failed:', err);
        return [];
    }
}