export function switchView(viewId) {
    // List of all view IDs
    const views = ['home-view', 'analysis-view', 'about-view'];
    
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === viewId) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });

    // Clean up if going back to home
    if (viewId === 'home-view') {
        const symbolInput = document.getElementById('stock-symbol');
        if (symbolInput) symbolInput.value = '';
    }

    window.scrollTo(0, 0);
}