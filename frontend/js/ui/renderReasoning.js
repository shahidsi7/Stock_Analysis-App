export function renderReasoning(expl) {
  document.getElementById("reasoningBox").innerHTML = `
    <div class="space-y-3">
      <p><b>1️⃣ Model Outlook</b><br>${expl.ai_outlook}</p>
      <p><b>2️⃣ Technical Confirmation</b><br>${expl.technical_summary}</p>
      <p><b>3️⃣ Market Environment</b><br>${expl.market_context}</p>
      <p class="border-t border-gray-600 pt-2">
        <b>4️⃣ Final AI Assessment</b><br>${expl.final_advice}
      </p>
    </div>
  `;
}
