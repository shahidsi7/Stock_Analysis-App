export function renderForecast(forecastData) {
    // forecast-container is hidden by default in your HTML (class="hidden")
    // This function populates it safely in case you decide to show it later.
    const container = document.getElementById('forecast-container');
    if (!container) return;

    // Currently, the chart handles the visual forecast. 
    // We can clear this or add text data if needed.
    container.innerHTML = ''; 
}