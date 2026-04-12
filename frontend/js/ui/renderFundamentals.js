export function renderFundamentals(containerId, fundamentals) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!fundamentals) {
        container.innerHTML = `
            <div class="p-6 text-center border border-dashed border-gray-200 rounded-3xl">
                <p class="text-gray-400 italic text-sm">Fundamental data currently unavailable.</p>
            </div>
        `;
        return;
    }

    const formatMarketCap = (val) => {
        if (!val || val === 'None' || val === 'N/A') return 'N/A';
        const num = parseFloat(val);
        if (isNaN(num)) return 'N/A';
        if (num >= 1.0e+12) return '$' + (num / 1.0e+12).toFixed(2) + 'T';
        if (num >= 1.0e+9)  return '$' + (num / 1.0e+9).toFixed(2) + 'B';
        if (num >= 1.0e+6)  return '$' + (num / 1.0e+6).toFixed(2) + 'M';
        return '$' + num.toFixed(2);
    };

    const formatNumber = (val) => {
        if (!val || val === 'None' || val === 'N/A') return 'N/A';
        const num = parseFloat(val);
        return isNaN(num) ? 'N/A' : num.toFixed(2);
    };

    const formatPercent = (val) => {
        if (!val || val === 'None' || val === 'N/A') return 'N/A';
        const num = parseFloat(val);
        return isNaN(num) ? 'N/A' : (num * 100).toFixed(2) + '%';
    };

    const sentiment = fundamentals.insider_sentiment || 'Neutral';
    let sentimentColor = 'text-gray-500 bg-gray-50 border-gray-200';
    if (sentiment === 'Positive') sentimentColor = 'text-green-600 bg-green-50 border-green-200';
    if (sentiment === 'Negative') sentimentColor = 'text-red-600 bg-red-50 border-red-200';

    const beta = formatNumber(fundamentals.beta);
    const betaColor = parseFloat(beta) > 1.5 ? 'text-orange-500' : 'text-slate-800';

    container.innerHTML = `
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 class="text-lg font-bold text-slate-800 mb-5 flex items-center">
                <i class="fas fa-balance-scale mr-2 text-blue-500"></i> Fundamental Health
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                    <span class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Market Cap</span>
                    <span class="text-lg font-bold text-slate-800">${formatMarketCap(fundamentals.market_cap)}</span>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                    <span class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">P/E Ratio</span>
                    <span class="text-lg font-bold text-slate-800">${formatNumber(fundamentals.pe_ratio)}</span>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                    <span class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Beta</span>
                    <span class="text-lg font-bold ${betaColor}">${beta}</span>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                    <span class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Dividend Yield</span>
                    <span class="text-lg font-bold text-emerald-600">${formatPercent(fundamentals.dividend_yield)}</span>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col">
                    <span class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Insider Sentiment</span>
                    <span class="text-sm font-bold px-3 py-1 rounded-lg border self-start mt-1 ${sentimentColor}">${sentiment}</span>
                </div>

            </div>
        </div>
    `;
}