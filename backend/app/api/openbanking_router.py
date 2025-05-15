from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from dotenv import load_dotenv
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User, BankRequisition
from app.services.openbanking import OpenBankingService
from app.dependencies import get_current_user
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel

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

class RequisitionRequest(BaseModel):
    institution_id: str
    redirect_url: str

@router.post("/create_requisition", summary="Create a new requisition")

async def create_requisition(
    payload: RequisitionRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    This route is used after a user has selected a bank. The user is redirected to the bank's login page, and the requisition is created in the DB
    """
    try:
        service = OpenBankingService(
            secret_id=os.getenv("GOCARDLESS_SECRET_ID"),
            secret_name=os.getenv("GOCARDLESS_SECRET_NAME"),
            secret_key=os.getenv("GOCARDLESS_SECRET_KEY"),
        )
        requisition = await service.create_requisition(
            institution_id=payload.institution_id,
            redirect_url=payload.redirect_url
        )
        print("Requisition created:", requisition)
        # Save requisition to database
        new_requisition = BankRequisition(
            requisition_id=requisition["id"],
            created=datetime.now(timezone.utc),
            institution_id=payload.institution_id,
            agreement=requisition.get("agreement"),
            reference=requisition.get("reference"),
            link=requisition["link"],
            status=requisition["status"],
            account_selection=requisition.get("account_selection", False),
            user_id=user.id
        )

        db.add(new_requisition)
        await db.commit()
        await db.refresh(new_requisition)

        return {"link": new_requisition.link, "institution_id": payload.institution_id}
    except Exception as e:
        print("Error while creating requisition:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create requisition"
        )

class RequisitionProcessRequest(BaseModel):
    ref: str

@router.post("/process_requisition", summary="Process a requisition and fetch accounts")
async def process_requisition(
    payload: RequisitionProcessRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Find requisition based on reference
    result = await db.execute(
        select(BankRequisition).where(BankRequisition.reference == payload.ref)
    )
    requisition = result.scalar_one_or_none()  # return one or none
    if not requisition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requisition not found"
        )
    # Ensure the request user is the owner of the requisition
    if requisition.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this requisition"
        )
    
    # Fetch accounts using the OpenBankingService
    service = OpenBankingService(
        secret_id=os.getenv("GOCARDLESS_SECRET_ID"),
        secret_name=os.getenv("GOCARDLESS_SECRET_NAME"),
        secret_key=os.getenv("GOCARDLESS_SECRET_KEY"),
    )

    try:
        accounts = await service.list_accounts(requisition_id=requisition.requisition_id)
        print("Accounts fetched:", accounts)
        return {"accounts": accounts}
    except Exception as e:
        print("Error while fetching accounts:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch accounts"
        )