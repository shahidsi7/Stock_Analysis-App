function ema(values, period) {
  const k = 2 / (period + 1);
  let e = values[0];

  for (let i = 1; i < values.length; i++) {
    e = values[i] * k + e * (1 - k);
  }
  return e;
}

export function calculateMACD(closes) {
  return +(ema(closes, 12) - ema(closes, 26)).toFixed(4);
}
