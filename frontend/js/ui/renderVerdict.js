export function renderVerdict(data) {
  const verdictCard = document.getElementById("verdictCard");
  if (!verdictCard) {
    console.warn("Verdict card not mounted");
    return;
  }

  const { recommendation, risk_level, confidence_score } = data;

  // Reset styles
  verdictCard.className =
    "rounded-xl p-6 text-center text-2xl font-bold transition-all";

  // Color logic
  if (recommendation === "BUY") {
    verdictCard.classList.add(
      "bg-green-900/30",
      "border",
      "border-green-500",
      "text-green-400"
    );
  } else if (recommendation === "WAIT") {
    verdictCard.classList.add(
      "bg-yellow-900/30",
      "border",
      "border-yellow-500",
      "text-yellow-400"
    );
  } else {
    verdictCard.classList.add(
      "bg-red-900/30",
      "border",
      "border-red-500",
      "text-red-400"
    );
  }

  verdictCard.innerHTML = `
    ${recommendation}
    <div class="text-sm font-normal text-gray-300 mt-2">
      Risk Level: <b>${risk_level}</b> · Confidence: <b>${confidence_score}%</b>
    </div>
  `;
}
