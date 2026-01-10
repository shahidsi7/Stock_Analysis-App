export function renderReasoning(reasoningText) {
    const container = document.getElementById('reasoning-container');
    if (!container) return;

    // Use default text if reasoning is missing
    const text = reasoningText || "AI analysis complete. No specific reasoning details provided by the model.";

    container.innerHTML = `
       <h3 class="text-lg font-bold mb-3 flex items-center">
        <i class="fas fa-brain mr-2 text-purple-500"></i>
        AI Reasoning
       </h3>
       <p class="text-slate-600 leading-relaxed">
         ${text}
       </p>
    `;
}