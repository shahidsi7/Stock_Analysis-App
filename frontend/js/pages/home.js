import { navigate } from "../router.js";
import { fetchTrendingStocks } from "../api/trendingApi.js";
import { renderLoader, clearLoader } from "../ui/loader.js";

export async function renderHome(container) {
  // 1. Render Base Structure
  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-6 py-6 space-y-8">
      <!-- HEADER -->
      <div class="flex flex-col gap-4">
        <h1 class="text-3xl font-bold tracking-tight">
          📊 AI Stock Analyzer
        </h1>
        <p class="text-gray-400">
          Analyze US stocks using AI-powered price prediction
        </p>
      </div>

      <!-- SEARCH -->
      <div class="bg-panel rounded-xl p-4 flex gap-3 shadow-lg">
        <input id="searchInput" placeholder="Search (e.g. AAPL, NVDA)" 
               class="flex-1 p-3 rounded-lg text-black text-lg focus:ring-2 focus:ring-blue-500" />
        <button id="analyzeBtn" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
          Analyze
        </button>
      </div>

      <!-- TRENDING SECTION -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">🔥 Market Trends</h2>
          <!-- Status Pill -->
          <div id="marketStatus" class="hidden text-xs px-2 py-1 rounded border"></div>
        </div>

        <div id="stockGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[200px]">
          <!-- Loader injects here -->
        </div>
      </div>
    </div>
  `;

  // 2. Event Listeners
  const searchInput = document.getElementById("searchInput");
  const analyzeBtn = document.getElementById("analyzeBtn");
  
  const goSearch = () => {
    const symbol = searchInput.value.trim().toUpperCase();
    if (symbol) navigate(`/stock/${symbol}`);
  };

  analyzeBtn.onclick = goSearch;
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") goSearch(); });

  // 3. Render Function (Internal)
  const renderStocks = (list) => {
    const grid = document.getElementById("stockGrid");
    const status = document.getElementById("marketStatus");
    if (!grid) return;

    grid.innerHTML = "";

    // Update Status
    const isStatic = list.some(i => i.isStatic);
    if (status) {
        status.className = `text-xs px-3 py-1 rounded-full border flex items-center gap-2 ${
            isStatic ? "bg-red-900/20 border-red-800 text-red-400" : "bg-green-900/20 border-green-800 text-green-400"
        }`;
        status.innerHTML = isStatic 
            ? `<span class="w-2 h-2 rounded-full bg-red-500"></span> Offline Mode`
            : `<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Data`;
        status.classList.remove("hidden");
    }

    list.forEach(stock => {
      // Data Normalization (API vs Static)
      const priceVal = stock.price || 0;
      const price = typeof priceVal === 'number' ? priceVal.toFixed(2) : parseFloat(priceVal).toFixed(2);
      
      let changePercent = 0;
      if (stock.changesPercentage !== undefined) changePercent = stock.changesPercentage;
      else if (stock.change) changePercent = parseFloat(stock.change.replace('%', ''));

      const isUp = changePercent >= 0;
      const colorClass = isUp ? "text-green-400" : "text-red-400";
      const icon = isUp ? "▲" : "▼";

      const card = document.createElement("div");
      card.className = "bg-panel rounded-xl p-4 cursor-pointer border border-gray-700 hover:border-blue-500 hover:scale-[1.02] transition-all duration-200";
      
      card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-lg font-bold">${stock.symbol}</h3>
            <div class="text-xs text-gray-400 truncate max-w-[150px]">${stock.name || stock.symbol}</div>
          </div>
          <div class="text-right">
            <div class="font-mono font-bold text-lg">$${price}</div>
            <div class="text-xs font-semibold ${colorClass}">
               ${icon} ${Math.abs(changePercent).toFixed(2)}%
            </div>
          </div>
        </div>
        <button class="w-full py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-sm font-semibold transition-colors">
          Analyze Stock
        </button>
      `;

      card.onclick = () => navigate(`/stock/${stock.symbol}`);
      grid.appendChild(card);
    });
  };

  // 4. Execution
  renderLoader("stockGrid");
  
  try {
      const data = await fetchTrendingStocks();
      clearLoader("stockGrid");
      if (data) renderStocks(data);
  } catch (err) {
      console.error("Home Render Error", err);
      clearLoader("stockGrid");
      document.getElementById("stockGrid").innerHTML = `<div class="text-red-400 p-4">Error loading data.</div>`;
  }
}