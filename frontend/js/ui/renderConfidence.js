export function renderConfidence(score) {
  const bar = document.getElementById("confidenceBar");
  const label = document.getElementById("confidenceLabel");

  bar.style.width = `${score}%`;
  label.innerText = `${score}% confidence`;

  bar.className = "h-4 transition-all duration-700";

  if (score >= 70) bar.classList.add("bg-green-500");
  else if (score >= 50) bar.classList.add("bg-yellow-400");
  else bar.classList.add("bg-red-500");
}
