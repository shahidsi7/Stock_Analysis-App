export function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (closes.length < slowPeriod) return 0;

    const emaFast = calculateEMA(closes, fastPeriod);
    const emaSlow = calculateEMA(closes, slowPeriod);

    // MACD Line
    const macdLine = emaFast - emaSlow;
    
    // We return just the MACD line value for simplicity as per your original logic
    return macdLine;
}

function calculateEMA(data, period) {
    const k = 2 / (period + 1);
    let ema = data[0];
    
    for (let i = 1; i < data.length; i++) {
        ema = (data[i] * k) + (ema * (1 - k));
    }
    return ema;
}