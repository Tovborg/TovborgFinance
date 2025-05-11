# app/api/routes.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Hello from FastAPI Backend!"}