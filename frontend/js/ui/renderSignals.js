export function renderSignals(signalData) {
    // Target the specific container from your new index.html
    const container = document.getElementById('signals-container');
    if (!container) {
        console.warn("renderSignals: 'signals-container' not found in DOM");
        return;
    }

    // Handle data whether it comes as a string or an object
    // Safety check: if signalData is null/undefined, default to 'NEUTRAL'
    const signal = (typeof signalData === 'string' ? signalData : signalData?.signal || 'NEUTRAL').toUpperCase();

    // Determine styling based on signal
    let colorClass = 'text-slate-500';
    let bgClass = 'bg-slate-100';
    let icon = 'fa-minus';
    
    if (signal.includes('BUY')) {
        colorClass = 'text-green-600';
        bgClass = 'bg-green-100';
        icon = 'fa-arrow-trend-up';
    } else if (signal.includes('SELL')) {
        colorClass = 'text-red-600';
        bgClass = 'bg-red-100';
        icon = 'fa-arrow-trend-down';
    }

    // Render the card
    container.innerHTML = `
        <div class="h-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
                <h3 class="text-slate-500 font-medium mb-2 flex items-center">
                    <i class="fas fa-bolt mr-2 text-yellow-500"></i> AI Signal
                </h3>
                <div class="text-4xl font-bold tracking-wider ${colorClass}">${signal}</div>
            </div>
            <div class="mt-4 ${bgClass} ${colorClass} py-2 px-4 rounded-lg self-start font-medium flex items-center">
                <i class="fas ${icon} mr-2"></i> ${signal}
            </div>
        </div>
    `;
}