export function renderForecast(data) {
  const card = document.getElementById("forecastCard");
  const dir = document.getElementById("forecastDirection");
  const conf = document.getElementById("forecastConfidence");

  const isUp = data.predicted_price >= data.current_price;
  const score = data.confidence_score;

  card.className = "bg-gray-900 rounded-xl p-4 text-center border transition-all duration-300";

  dir.innerText = isUp ? "▲ Uptrend" : "▼ Downtrend";
  conf.innerText = `${score}%`;

  if (isUp && score >= 70) card.classList.add("border-green-500", "text-green-400");
  else if (isUp) card.classList.add("border-yellow-500", "text-yellow-400");
  else if (score >= 60) card.classList.add("border-red-500", "text-red-400");
  else card.classList.add("border-orange-500", "text-orange-400");
}
