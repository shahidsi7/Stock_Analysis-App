// Inject basic loader styles dynamically
const styleId = 'dynamic-loader-styles';
if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .stock-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: #94a3b8;
            width: 100%;
            grid-column: 1 / -1;
        }
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #334155;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

export function renderLoader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="stock-loader">
            <div class="spinner"></div>
            <p class="text-sm font-medium animate-pulse">Scanning market data...</p>
        </div>
    `;
}

export function clearLoader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
}