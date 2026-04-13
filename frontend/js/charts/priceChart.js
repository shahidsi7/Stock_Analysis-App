let chartInstance = null;

export function drawPriceChart(dates, prices, predictedPrice, volumes = []) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    const labels = [...dates, 'Forecast'];
    const dataPoints = [...prices, null];

    const forecastPoints = new Array(prices.length).fill(null);
    forecastPoints.push(prices[prices.length - 1]);
    forecastPoints.push(predictedPrice);

    const volumeData = [...volumes, null, null];

    chartInstance = new Chart(ctx, {
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Historical Price',
                    data: dataPoints,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'yPrice',
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    type: 'line',
                    label: 'AI Forecast',
                    data: forecastPoints,
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    pointRadius: [0,0,4],
                    fill: false,
                    yAxisID: 'yPrice'
                },
                {
                    type: 'bar',
                    label: 'Volume',
                    data: volumeData,
                    backgroundColor: 'rgba(148, 163, 184, 0.3)',
                    borderColor: 'rgba(148, 163, 184, 0.5)',
                    borderWidth: 0,
                    yAxisID: 'yVolume'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Volume') {
                                const val = context.parsed.y;
                                if (!val) return null;
                                return `Vol: ${(val / 1e6).toFixed(2)}M`;
                            }
                            if (context.parsed.y === null) return null;
                            return `$${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                yPrice: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: false,
                    grid: { color: '#f1f5f9' }
                },
                yVolume: {
                    type: 'linear',
                    position: 'right',
                    grid: { display: false },
                    ticks: {
                        callback: (val) => (val / 1e6).toFixed(0) + 'M'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
}