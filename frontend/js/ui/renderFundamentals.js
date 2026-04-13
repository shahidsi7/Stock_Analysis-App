export function renderFundamentals(containerId, fundamentals, predictedPrice = null) {
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

    const formatPrice = (val) => {
        if (!val || val === 'None' || val === 'N/A') return 'N/A';
        const num = parseFloat(val);
        return isNaN(num) ? 'N/A' : '$' + num.toFixed(2);
    };

    const sentiment = fundamentals.insider_sentiment || 'Neutral';
    let sentimentColor = 'text-gray-500 bg-gray-50 border-gray-200';
    if (sentiment === 'Positive') sentimentColor = 'text-green-600 bg-green-50 border-green-200';
    if (sentiment === 'Negative') sentimentColor = 'text-red-600 bg-red-50 border-red-200';

    const beta = formatNumber(fundamentals.beta);
    const betaColor = parseFloat(beta) > 1.5 ? 'text-orange-500' : 'text-slate-800';

    // 52-week range bar
    const high = parseFloat(fundamentals.week_52_high);
    const low = parseFloat(fundamentals.week_52_low);
    const current = predictedPrice || 0;
    let rangePercent = 50;
    if (high && low && high !== low) {
        rangePercent = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
    }

    // Analyst vs AI comparison
    const analystNum = parseFloat(fundamentals.analyst_target);
    let analystBadge = '';
    if (!isNaN(analystNum) && predictedPrice) {
        const diff = (((analystNum - predictedPrice) / predictedPrice) * 100).toFixed(1);
        const color = diff >= 0 ? 'text-green-600' : 'text-red-500';
        analystBadge = `<span class="text-xs font-semibold ${color} ml-2">(${diff >= 0 ? '+' : ''}${diff}% vs AI)</span>`;
    }

    // Earnings warning badge
    const earningsDate = fundamentals.next_earnings;
    let earningsBadge = '';
    if (earningsDate && earningsDate !== 'None' && earningsDate !== 'N/A') {
        const today = new Date();
        const eDate = new Date(earningsDate);
        const daysUntil = Math.ceil((eDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= 30) {
            const urgencyColor = daysUntil <= 7
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700';
            const icon = daysUntil <= 7 ? 'fa-circle-exclamation' : 'fa-calendar-days';

            earningsBadge = `
                <div class="${urgencyColor} border rounded-2xl p-4 mt-4 flex items-center gap-3">
                    <i class="fas ${icon} text-xl"></i>
                    <div>
                        <p class="font-bold text-sm">Earnings Report in ${daysUntil} day${daysUntil === 1 ? '' : 's'}</p>
                        <p class="text-xs opacity-75">Scheduled: ${earningsDate} - expect higher volatility</p>
                    </div>
                </div>
            `;
        }
    }

    container.innerHTML = `
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 class="text-lg font-bold text-slate-800 mb-5 flex items-center">
                <i class="fas fa-balance-scale mr-2 text-blue-500"></i> Fundamental Health
            </h3>

            <!-- Main Metrics -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">

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
${earningsBadge}
            <!-- 52 Week Range -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs text-slate-400 uppercase font-bold tracking-wider">52-Week Range</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm font-bold text-red-500">${formatPrice(fundamentals.week_52_low)}</span>
                    <div class="flex-1 bg-slate-200 rounded-full h-2 relative">
                        <div class="absolute top-0 left-0 h-2 bg-gradient-to-r from-red-400 to-green-400 rounded-full" style="width: 100%"></div>
                        <div class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow" style="left: calc(${rangePercent}% - 6px)"></div>
                    </div>
                    <span class="text-sm font-bold text-green-500">${formatPrice(fundamentals.week_52_high)}</span>
                </div>
                <p class="text-xs text-slate-400 mt-2 text-center">Current price is at <strong>${rangePercent.toFixed(0)}%</strong> of its 52-week range</p>
            </div>

            <!-- Analyst Target vs AI -->
            <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                    <span class="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">Analyst Price Target</span>
                    <span class="text-lg font-bold text-slate-800">${formatPrice(fundamentals.analyst_target)} ${analystBadge}</span>
                </div>
                <i class="fas fa-crosshairs text-blue-400 text-2xl"></i>
            </div>
        </div>
    `;
}
