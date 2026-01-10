export function calculateRSI(closes, period = 14) {
    if (closes.length < period + 1) return 50; // Not enough data

    let gains = 0;
    let losses = 0;

    // Calculate initial average
    for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Smooth subsequent values
    for (let i = period + 1; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) {
            avgGain = (avgGain * 13 + diff) / 14;
            avgLoss = (avgLoss * 13) / 14;
        } else {
            avgGain = (avgGain * 13) / 14;
            avgLoss = (avgLoss * 13 + Math.abs(diff)) / 14;
        }
    }

    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}