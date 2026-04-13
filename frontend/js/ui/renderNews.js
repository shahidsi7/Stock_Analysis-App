export function renderNews(news) {
    const container = document.getElementById('news-container');
    if (!container) return;

    if (!news || news.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center border border-dashed border-gray-200 rounded-3xl">
                <p class="text-gray-400 italic text-sm">News unavailable or API limit reached.</p>
            </div>
        `;
        return;
    }

    const sentimentStyle = (label) => {
        if (!label) return 'bg-gray-100 text-gray-500';
        const l = label.toLowerCase();
        if (l.includes('bullish')) return 'bg-green-100 text-green-700';
        if (l.includes('bearish')) return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-500';
    };

    const timeAgo = (timeStr) => {
        if (!timeStr) return '';
        const year = timeStr.slice(0, 4);
        const month = timeStr.slice(4, 6);
        const day = timeStr.slice(6, 8);
        return `${day}/${month}/${year}`;
    };

    const items = news.map(item => {
        const sentiment = item.overall_sentiment_label || 'Neutral';
        return `
            <a href="${item.url}" target="_blank" rel="noopener noreferrer"
               class="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer group">
                ${item.banner_image
                    ? `<img src="${item.banner_image}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0" onerror="this.style.display='none'" />`
                    : `<div class="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0"><i class="fas fa-newspaper text-slate-300 text-xl"></i></div>`
                }
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-600 line-clamp-2">${item.title}</p>
                    <div class="flex items-center gap-2 mt-2 flex-wrap">
                        <span class="text-xs text-slate-400">${item.source || ''}</span>
                        <span class="text-xs text-slate-300">·</span>
                        <span class="text-xs text-slate-400">${timeAgo(item.time_published)}</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${sentimentStyle(sentiment)}">${sentiment}</span>
                    </div>
                </div>
            </a>
        `;
    }).join('');

    container.innerHTML = `
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <i class="fas fa-newspaper mr-2 text-blue-500"></i> Latest News & Sentiment
            </h3>
            <div class="space-y-3">
                ${items}
            </div>
        </div>
    `;
}