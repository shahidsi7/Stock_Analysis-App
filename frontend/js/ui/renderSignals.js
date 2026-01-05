export function renderSignals(data) {
  const positive = document.getElementById("positiveSignals");
  const risk = document.getElementById("riskSignals");

  positive.innerHTML = "";
  risk.innerHTML = "";

  const {
    rsi,
    macd,
    vix,
    confidence_score,
    predicted_price,
    current_price,
    recommendation
  } = data;

  /* =========================
     ✅ POSITIVE SIGNALS
     ========================= */

  // 1️⃣ RSI reasoning
  if (rsi >= 45 && rsi <= 65) {
    positive.innerHTML += `
      <li>
        <b>Balanced RSI (${rsi})</b> – Indicates healthy demand without overheating.
        <span class="text-green-400">[Strong]</span>
      </li>`;
  } else if (rsi < 45) {
    positive.innerHTML += `
      <li>
        <b>RSI near oversold zone (${rsi})</b> – Selling pressure may be exhausting,
        allowing a potential rebound.
        <span class="text-yellow-400">[Moderate]</span>
      </li>`;
  }

  // 2️⃣ MACD reasoning
  if (macd > 0) {
    positive.innerHTML += `
      <li>
        <b>Positive MACD</b> – Confirms bullish momentum and trend continuation.
        <span class="text-green-400">[Strong]</span>
      </li>`;
  }

  // 3️⃣ AI vs Market price
  if (predicted_price > current_price) {
    const upside = (((predicted_price - current_price) / current_price) * 100).toFixed(2);
    positive.innerHTML += `
      <li>
        <b>AI projects upside (${upside}%)</b> – Model expectation is above current market price,
        indicating potential appreciation.
        <span class="text-green-400">[Moderate]</span>
      </li>`;
  }

  // 4️⃣ Confidence alignment
  if (confidence_score >= 70) {
    positive.innerHTML += `
      <li>
        <b>High confidence score (${confidence_score}%)</b> – Multiple signals align,
        increasing reliability of the outlook.
        <span class="text-green-400">[Strong]</span>
      </li>`;
  }

  /* =========================
     ⚠️ RISK SIGNALS
     ========================= */

  // 5️⃣ Volatility reasoning
  if (vix >= 25) {
    risk.innerHTML += `
      <li>
        <b>Elevated market volatility</b> – Sharp price swings are possible,
        increasing downside risk.
        <span class="text-red-400">[High]</span>
      </li>`;
  } else if (vix >= 18) {
    risk.innerHTML += `
      <li>
        <b>Moderate volatility environment</b> – Gains may face short-term pullbacks.
        <span class="text-yellow-400">[Medium]</span>
      </li>`;
  }

  // 6️⃣ Confidence weakness
  if (confidence_score < 60) {
    risk.innerHTML += `
      <li>
        <b>Moderate confidence (${confidence_score}%)</b> – Signals are mixed,
        reducing conviction for aggressive positions.
        <span class="text-yellow-400">[Medium]</span>
      </li>`;
  }

  // 7️⃣ Recommendation bias
  if (recommendation === "WAIT") {
    risk.innerHTML += `
      <li>
        <b>Wait bias</b> – Market structure suggests patience for better confirmation.
        <span class="text-yellow-400">[Caution]</span>
      </li>`;
  }

  if (recommendation === "HIGH RISK") {
    risk.innerHTML += `
      <li>
        <b>High-risk setup</b> – Probability of adverse movement outweighs potential reward.
        <span class="text-red-400">[Avoid]</span>
      </li>`;
  }

  /* =========================
     FALLBACKS
     ========================= */

  if (!positive.innerHTML) {
    positive.innerHTML = `<li>No strong bullish confirmations detected.</li>`;
  }

  if (!risk.innerHTML) {
    risk.innerHTML = `<li>No major downside risks identified.</li>`;
  }
}
