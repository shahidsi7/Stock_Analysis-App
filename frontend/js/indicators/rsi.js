export function calculateRSI(closes, period = 14) {
  let gains = 0, losses = 0;

  for (let i = closes.length - period; i < closes.length - 1; i++) {
    const diff = closes[i + 1] - closes[i];
    diff >= 0 ? gains += diff : losses -= diff;
  }

  return losses === 0
    ? 100
    : +(100 - 100 / (1 + gains / losses)).toFixed(2);
}
