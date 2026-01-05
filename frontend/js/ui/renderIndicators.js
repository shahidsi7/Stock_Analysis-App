export function renderIndicators(data) {
  const rsiCard = document.getElementById("rsiCard");
  const macdCard = document.getElementById("macdCard");
  const vixCard = document.getElementById("vixCard");
  const confidenceCard = document.getElementById("confidenceCard");

  rsiCard.innerHTML = `
    <p class="text-sm text-gray-400">RSI</p>
    <p class="text-xl font-bold">${data.rsi}</p>
  `;

  macdCard.innerHTML = `
    <p class="text-sm text-gray-400">MACD</p>
    <p class="text-xl font-bold">${data.macd}</p>
  `;

  vixCard.innerHTML = `
    <p class="text-sm text-gray-400">VIX</p>
    <p class="text-xl font-bold">${data.vix}</p>
  `;

  confidenceCard.innerHTML = `
    <p class="text-sm text-gray-400">Confidence</p>
    <p class="text-xl font-bold">${data.confidence_score}%</p>
  `;
}
