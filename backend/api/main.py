from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes.prediction import router as prediction_router

app = FastAPI(title="Stock AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)
