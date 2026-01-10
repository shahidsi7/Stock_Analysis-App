import { renderTrendingGrid } from './ui/renderStockList.js';
import { handleStockSelection } from './pages/stock.js';
import { switchView } from './router.js';

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
    // Nav Links
    const navLogo = document.getElementById('nav-logo');
    const navAbout = document.getElementById('nav-about');
    
    // UI Elements
    const searchForm = document.getElementById('search-form');
    const backBtn = document.getElementById('back-btn');

    // Navigation Logic
    if (navLogo) navLogo.addEventListener('click', () => switchView('home-view'));
    if (navAbout) navAbout.addEventListener('click', (e) => { e.preventDefault(); switchView('about-view'); });

    // Search Logic
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const symbolInput = document.getElementById('stock-symbol');
            if (symbolInput && symbolInput.value) {
                handleStockSelection(symbolInput.value.toUpperCase());
            }
        });
    }

    // Back Button Logic
    if (backBtn) {
        backBtn.addEventListener('click', () => switchView('home-view'));
    }
}