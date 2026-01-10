export function renderIndicators(indicators) {
    const container = document.getElementById('indicators-container');
    if (!container) {
        console.warn("renderIndicators: 'indicators-container' not found");
        return;
    }

    // Safety check: if indicators is missing, default to empty object
    const data = indicators || {};

    container.innerHTML = '';
    
    // Helper to create a consistent card
    const createCard = (title, value, status, color) => {
        return `
            <div class="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-center">
               <h3 class="text-slate-500 text-sm font-medium mb-1">${title}</h3>
               <div class="text-2xl font-bold ${color}">${value}</div>
               <div class="text-xs text-slate-400 mt-1">${status}</div>
            </div>
        `;
    };

    // 1. Logic for RSI
    const rsiVal = data.rsi !== undefined ? parseFloat(data.rsi) : 50;
    const rsiDisplay = data.rsi !== undefined ? rsiVal.toFixed(2) : 'N/A';
    
    let rsiStatus = 'Neutral';
    let rsiColor = 'text-slate-900';
    
    if (rsiVal > 70) { 
        rsiStatus = 'Overbought'; 
        rsiColor = 'text-red-500'; 
    } else if (rsiVal < 30) { 
        rsiStatus = 'Oversold'; 
        rsiColor = 'text-green-500'; 
    }

    // 2. Logic for MACD
    const macdVal = data.macd !== undefined ? parseFloat(data.macd) : 0;
    const macdDisplay = data.macd !== undefined ? macdVal.toFixed(2) : 'N/A';
    
    const macdColor = macdVal > 0 ? 'text-green-500' : 'text-red-500';
    const macdStatus = macdVal > 0 ? 'Bullish' : 'Bearish';

    // Append cards to container
    container.innerHTML += createCard('RSI (14)', rsiDisplay, rsiStatus, rsiColor);
    container.innerHTML += createCard('MACD', macdDisplay, macdStatus, macdColor);
}