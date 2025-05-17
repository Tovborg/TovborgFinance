from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.db.models import User, Account
from dotenv import load_dotenv
from app.dependencies import get_current_user

load_dotenv()

router = APIRouter()

@router.get("/account_info")
def account_info(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    return {"Message": "Account info retrieved successfully"}