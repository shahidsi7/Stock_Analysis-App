import { renderTrendingGrid } from './ui/renderStockList.js';
import { switchView } from './router.js';
import { handleStockSelection } from './pages/stock.js';

console.log("Loading StockMind App (Modular Version)...");

// --- Initialization ---
const initApp = () => {
    // Render the grid, passing the selection handler
    renderTrendingGrid(handleStockSelection);
    setupEventListeners();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// --- Event Listeners ---
function setupEventListeners() {
    const navLogo = document.getElementById('nav-logo');
    const navAbout = document.getElementById('nav-about');
    const searchForm = document.getElementById('search-form');
    const backBtn = document.getElementById('back-btn');
    const symbolInput = document.getElementById('stock-symbol');

    if (navLogo) navLogo.addEventListener('click', () => switchView('home-view'));
    if (navAbout) navAbout.addEventListener('click', (e) => { e.preventDefault(); switchView('about-view'); });

    if (backBtn) backBtn.addEventListener('click', () => switchView('home-view'));

    // Search submit
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (symbolInput && symbolInput.value) {
                handleStockSelection(symbolInput.value.toUpperCase().trim());
            }
        });
    }


}
