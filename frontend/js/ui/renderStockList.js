import { TRENDING_STOCKS } from '../data/usStocks.js';

export function renderTrendingGrid(onStockSelect) {
    const grid = document.getElementById('trending-grid');
    if (!grid) return;

    grid.innerHTML = ''; 

    TRENDING_STOCKS.forEach(stock => {
        const card = document.createElement('div');
        card.className = "flex flex-col justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-blue-500 group cursor-pointer";
        
        // Pass the symbol to the callback
        card.onclick = () => onStockSelect(stock.symbol);

        card.innerHTML = `
            <div class="mb-3">
                <div class="flex justify-between items-start w-full mb-1">
                    <span class="font-bold text-lg text-slate-900 group-hover:text-blue-600">
                        ${stock.symbol}
                    </span>
                    <i class="fas fa-chart-line text-slate-300 group-hover:text-blue-500 transition-colors"></i>
                </div>
                <span class="text-sm text-slate-500 text-left block line-clamp-1">
                    ${stock.name}
                </span>
            </div>
            
            <div class="mt-2 pt-3 border-t border-slate-100 w-full">
                <button class="w-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center">
                    Analyse <i class="fas fa-arrow-right ml-2 text-xs"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}