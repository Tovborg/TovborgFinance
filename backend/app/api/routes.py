# app/api/routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User
from sqlalchemy.future import select

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Hello from FastAPI Backend!"}

