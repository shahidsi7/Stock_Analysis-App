let chartInstance = null;

export function drawPriceChart(dates, prices, predictedPrice) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    // Destroy previous chart if it exists to prevent overlap
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Prepare data
    // We append the predicted price as the next data point
    const labels = [...dates, 'Forecast'];
    const dataPoints = [...prices, null]; // Historical data
    
    // Create a separate dataset for prediction to style it differently
    const forecastPoints = new Array(prices.length).fill(null);
    forecastPoints.push(prices[prices.length - 1]); // Connect to last known price
    forecastPoints.push(predictedPrice);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Historical Price',
                    data: dataPoints,
                    borderColor: '#2563eb', // Blue-600
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'AI Forecast',
                    data: forecastPoints,
                    borderColor: '#10b981', // Green-500
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        maxTicksLimit: 10 // Prevent overcrowding
                    }
                }
            }
        }
    });
}