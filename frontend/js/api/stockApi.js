// CONFIGURATION

// 1. The Backend for AI Predictions (Your Local Python Server)
const PREDICTION_API_URL = 'http://localhost:8000'; 

// 2. Alpha Vantage API Configuration
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
// REPLACE 'DEMO_KEY' WITH YOUR ACTUAL API KEY
const API_KEY = '9HDUU4OWY70JH6OT'; 

export async function fetchStockData(symbol) {
    try {
        console.log(`Fetching history for ${symbol} from Alpha Vantage...`);
        
        // Construct URL for Daily Data
        const url = `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Alpha Vantage API Error: ${response.statusText}`);
        
        const rawData = await response.json();

        // Check for API Error Messages (e.g., Invalid API call or limit reached)
        if (rawData['Error Message']) throw new Error("Invalid Symbol or API Error");
        if (rawData['Note']) throw new Error("API Limit Reached (5 calls/min). Please wait.");
        
        const timeSeries = rawData['Time Series (Daily)'];
        if (!timeSeries) throw new Error("No pricing data found for this stock");

        // Parse Alpha Vantage Object into Array: [{ date, open, high, low, close, volume }]
        // The API returns dates as keys, so we map them to an array.
        const history = Object.keys(timeSeries).map(date => {
            const dayData = timeSeries[date];
            return {
                date: date,
                open: parseFloat(dayData['1. open']),
                high: parseFloat(dayData['2. high']),
                low: parseFloat(dayData['3. low']),
                close: parseFloat(dayData['4. close']),
                volume: parseInt(dayData['5. volume'])
            };
        });

        // Alpha Vantage returns data newest-first. We need oldest-first for the chart/model.
        return history.reverse();

    } catch (error) {
        console.error("fetchStockData failed:", error);
        throw error;
    }
}

export async function sendForPrediction(payload) {
    try {
        console.log("Sending processed data to Backend Prediction Model...");
        const response = await fetch(`${PREDICTION_API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Prediction API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("sendForPrediction failed:", error);
        throw error;
    }
}

export async function fetchFundamentals(symbol) {
    try {
        // Fetch both endpoints in parallel
        const [overviewRes, insiderRes] = await Promise.all([
            fetch(`${ALPHA_VANTAGE_BASE}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`),
            fetch(`${ALPHA_VANTAGE_BASE}?function=INSIDER_TRANSACTIONS&symbol=${symbol}&apikey=${API_KEY}`)
        ]);

        const overview = await overviewRes.json();
        const insider = await insiderRes.json();

        if (!overview || !overview.Symbol) return null;

        // Derive insider sentiment — defaults to Neutral on free tier
        let insider_sentiment = 'Neutral';
        const transactions = insider?.data?.slice(0, 10) || [];
        if (transactions.length > 0) {
            let score = 0;
            transactions.forEach(tx => {
                const type = (tx.transactionType || '').toUpperCase();
                if (type.includes('PURCHASE')) score += 1;
                else if (type.includes('SALE')) score -= 1;
            });
            insider_sentiment = score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral';
        }

        // Map to clean object
        return {
            market_cap: overview.MarketCapitalization,
            pe_ratio: overview.PERatio,
            beta: overview.Beta,
            dividend_yield: overview.DividendYield,
            insider_sentiment
        };

    } catch (err) {
        console.error('fetchFundamentals failed:', err);
        return null;
    }
}