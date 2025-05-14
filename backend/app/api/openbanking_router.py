from fastapi import APIRouter, Depends, HTTPException, status, Header
from dotenv import load_dotenv
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User
from app.services.openbanking import OpenBankingService

load_dotenv()

GOCARDLESS_SECRET_ID = os.getenv("GOCARDLESS_SECRET_ID")
GOCARDLESS_SECRET_NAME = os.getenv("GOCARDLESS_SECRET_NAME")
GOCARDLESS_SECRET_KEY = os.getenv("GOCARDLESS_SECRET_KEY")

# Initialize FastAPI router
router = APIRouter()

# Test the router
@router.get("/get_banks", summary="Get a list of available danish banks")
async def get_banks():
    try:
        service = OpenBankingService(
            secret_id=os.getenv("GOCARDLESS_SECRET_ID"),
            secret_name=os.getenv("GOCARDLESS_SECRET_NAME"),
            secret_key=os.getenv("GOCARDLESS_SECRET_KEY"),
        )
        banks = await service.get_banks(country_code="DK")
        return {"banks": banks}
    except Exception as e:
        print("Error while fetching banks:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch bank list from GoCardless"
        )