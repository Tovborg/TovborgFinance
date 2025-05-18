from fastapi import APIRouter, Depends, Query, HTTPException
from app.db.database import get_db
from app.db.models import User, Account, Transaction, BankRequisition
from dotenv import load_dotenv
from app.dependencies import get_current_user
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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

# Transaction endpoints
@router.get("/transactions", summary="Get transactions for a specific account")
async def get_transactions(
    account_id: str = Query(..., description="The ID of the account to retrieve transactions for"),
    top_n: int = Query(50, description="The number of transactions to retrieve"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check that the account belongs to the user via requisition
    result = await db.execute(
        select(Account)
        .options(selectinload(Account.requisition))
        .where(Account.id == account_id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(404, detail="Account not found or does not belong to the current user.")
    
    if account.requisition.user_id != current_user.id:
        raise HTTPException(403, detail="You do not have permission to access this account.")
    
    # Get transactions ordered by most recent
    result = await db.execute(
        select(Transaction)
        .where(Transaction.account_id == account_id)
        .order_by(Transaction.booking_date.desc())
        .limit(top_n)
    )
    transactions = result.scalars().all()
    print(f"Found {len(transactions)} transactions for account {account_id}")
    if not transactions:
        return {"message": "No transactions found for this account."}
    
    return {"transactions": [t.as_dict() for t in transactions]}

@router.get("/transactions/all", summary="Get all transactions for all accounts")
async def get_all_transactions(
    top_n: int = Query(50, description="The number of transactions to retrieve"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Join transactions with accounts and requisitions to filter by user
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.account)) # Eager load account to avoid N+1 queries
        .join(Account, Transaction.account_id == Account.id)
        .join(BankRequisition, Account.requisition_id == BankRequisition.id)
        .where(BankRequisition.user_id == current_user.id)
        .order_by(Transaction.booking_date.desc())
        .limit(top_n)
    )
    transactions = result.scalars().all()
    return {"transactions": [tx.as_dict() for tx in transactions]}