import { US_STOCKS } from '../data/usStocks.js';

// REPLACE 'YOUR_FMP_API_KEY' WITH YOUR ACTUAL KEY
const API_KEY = 'gCKb2iBHfTMn3ytLziYTaS0WuvvWykML'; 
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

export async function fetchTrendingStocks() {
    // Safety check if US_STOCKS is undefined (bad import)
    const stockList = US_STOCKS || [];
    if (stockList.length === 0) {
        console.warn("Stock list empty. Check usStocks.js export.");
        return [];
    }

    // Check if API Key is set
    if (!API_KEY || API_KEY === 'gCKb2iBHfTMn3ytLziYTaS0WuvvWykML') {
        console.warn("⚠️ API Key missing. Using static data.");
        // Return static data with a flag
        return stockList.map(s => ({...s, isStatic: true}));
    }

    try {
        // Construct URL
        const symbols = stockList.map(stock => stock.symbol).join(',');
        const url = `${BASE_URL}/quote/${symbols}?apikey=${API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Return real data (isStatic: false)
        return data.map(item => ({...item, isStatic: false}));

    } catch (error) {
        console.error('❌ Trending Fetch Failed:', error);
        // Fallback to static data
        return stockList.map(s => ({...s, isStatic: true})); 
    }
}