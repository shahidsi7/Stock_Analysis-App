const API_KEY = "9HDUU4OWY70JH6OT";
const BACKEND_URL = "http://127.0.0.1:8000/predict";

const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function fetchStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data["Time Series (Daily)"]) {
    throw new Error("Invalid symbol or API limit reached");
  }

  await sleep(1200);
  return data["Time Series (Daily)"];
}

export async function sendForPrediction(payload) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Backend error");
  }

  return res.json();
}
