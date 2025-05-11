# app/api/routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import Account
from sqlalchemy.future import select

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Hello from FastAPI Backend!"}

@router.get("/accounts")
async def get_accounts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account))
    accounts = result.scalars().all()
    return accounts