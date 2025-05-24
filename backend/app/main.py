# app/main.py
from fastapi import FastAPI
from app.api.routes import router
from app.api.auth_router import router as auth_router
from app.api.openbanking_router import router as openbanking_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.account_info_router import router as account_info_router
import logging

# Configure global logging config
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Avoid duplicate handlers if reloaded
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)



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
app.include_router(openbanking_router, tags=["Open Banking"])
app.include_router(account_info_router, tags=["Account Info"])
