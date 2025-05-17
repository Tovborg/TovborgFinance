from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.db.models import User, Account
from dotenv import load_dotenv
from app.dependencies import get_current_user
from sqlalchemy.future import select

load_dotenv()

router = APIRouter()

@router.get("/accounts")
async def get_accounts(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get all accounts associated with the current user.
    """
    result = await db.execute(select(Account).where(Account.requisition.has(user_id=current_user.id)))
    accounts = result.scalars().all()
    return {"accounts": accounts}

@router.get("/accounts/{account_id}")
async def get_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Get the details of a specific account associated with the current user.
    """
    result = await db.execute(select(Account).where(Account.id == account_id, Account.requisition.has(user_id=current_user.id)))
    account = result.scalars().first()
    if not account:
        return {"error": "Account not found or does not belong to the current user."}
    return {"account": account}