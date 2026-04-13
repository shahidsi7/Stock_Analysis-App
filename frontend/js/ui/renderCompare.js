export function renderCompare(stockA, stockB) {
    const container = document.getElementById('compare-container');
    if (!container) return;

    container.classList.remove('hidden');

    const metrics = [
        { label: 'Current Price', a: `$${stockA.price?.toFixed(2) || 'N/A'}`, b: `$${stockB.price?.toFixed(2) || 'N/A'}` },
        { label: 'AI Prediction', a: `$${stockA.predicted_price?.toFixed(2) || 'N/A'}`, b: `$${stockB.predicted_price?.toFixed(2) || 'N/A'}` },
        { label: 'RSI', a: stockA.rsi?.toFixed(2) || 'N/A', b: stockB.rsi?.toFixed(2) || 'N/A' },
        { label: 'MACD', a: stockA.macd?.toFixed(2) || 'N/A', b: stockB.macd?.toFixed(2) || 'N/A' },
        { label: 'Signal', a: stockA.signal || 'N/A', b: stockB.signal || 'N/A' },
        { label: 'Confidence', a: `${stockA.confidence_score || 0}%`, b: `${stockB.confidence_score || 0}%` },
        { label: 'Risk Level', a: stockA.risk_level || 'N/A', b: stockB.risk_level || 'N/A' },
    ];

    const rows = metrics.map(m => `
        <tr class="border-b border-slate-100 last:border-0">
            <td class="py-3 px-4 text-sm text-slate-500 font-medium">${m.label}</td>
            <td class="py-3 px-4 text-sm font-bold text-slate-800 text-center">${m.a}</td>
            <td class="py-3 px-4 text-sm font-bold text-slate-800 text-center">${m.b}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 class="text-lg font-bold text-slate-800 mb-5 flex items-center">
                <i class="fas fa-scale-balanced mr-2 text-blue-500"></i> Stock Comparison
            </h3>
            <table class="w-full">
                <thead>
                    <tr class="border-b-2 border-slate-200">
                        <th class="py-3 px-4 text-left text-xs text-slate-400 uppercase tracking-wider font-bold">Metric</th>
                        <th class="py-3 px-4 text-center text-sm font-extrabold text-blue-600 uppercase">${stockA.symbol}</th>
                        <th class="py-3 px-4 text-center text-sm font-extrabold text-indigo-600 uppercase">${stockB.symbol}</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}