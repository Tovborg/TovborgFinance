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
    result = await db.execute(select(Account).where(Account.requisition.has(user_id=current_user.id)))
    accounts = result.scalars().all()
    return {"accounts": accounts}

@router.get("/account_info")
def account_info(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    return {"Message": "Account info retrieved successfully"}