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