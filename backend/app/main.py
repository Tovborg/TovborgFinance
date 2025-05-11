# app/main.py
from fastapi import FastAPI
from app.api.routes import router
from app.api.auth_router import router as auth_router

app = FastAPI()
app.include_router(router)
app.include_router(auth_router, tags=["Auth"])

