# app/main.py
from fastapi import FastAPI
from app.api.routes import router
from app.api.auth_router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(router)
app.include_router(auth_router, tags=["Auth"])

