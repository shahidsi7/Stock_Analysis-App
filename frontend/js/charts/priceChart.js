let chartInstance = null;

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
}

export function drawPriceChart(dates, closes, predicted) {
  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById("priceChart");

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: [...dates.map(formatDate), "Prediction"],
      datasets: [
        {
          label: "Price",
          data: closes,
          borderColor: "#3b82f6",
          tension: 0.4
        },
        {
          label: "AI Prediction",
          data: [...Array(closes.length - 1).fill(null), closes.at(-1), predicted],
          borderColor: "#22c55e",
          borderDash: [6, 6],
          pointRadius: 6
        }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: "white" } } },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });
}
