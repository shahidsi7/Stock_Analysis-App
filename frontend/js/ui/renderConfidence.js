export function renderConfidence(confidenceScore) {
    const container = document.getElementById('confidence-container');
    if (!container) return;

    // If you want to show confidence, we can remove the 'hidden' class
    // or just update the text if it is visible.
    container.classList.remove('hidden');
    
    // Format the confidence score safely
    const score = confidenceScore !== undefined ? confidenceScore : 0;
    
    // Simple text display, or you could add a progress bar here
    container.innerHTML = `
        <div class="bg-white p-4 rounded-xl border border-slate-200 mt-4">
            <span class="text-sm font-bold text-slate-500 uppercase tracking-wide">Model Confidence</span>
            <div class="flex items-center mt-1">
                <div class="flex-1 bg-slate-100 rounded-full h-2 mr-3">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${score}%"></div>
                </div>
                <span class="font-bold text-blue-600">${score}%</span>
            </div>
        </div>
    `;
}