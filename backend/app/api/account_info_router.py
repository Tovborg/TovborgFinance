from fastapi import APIRouter, Depends, Query, HTTPException
from app.db.database import get_db
from app.db.models import User, Account, Transaction, BankRequisition
from dotenv import load_dotenv
from app.dependencies import get_current_user
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from datetime import datetime, timedelta
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

# AIO transaction endpoint with filtering and pagination
@router.get("/transactions", summary="Get transactions with filtering and pagination and optionally filtered by account")
async def get_transactions_filter(
    account_id: str = Query("all", description="The ID of the account to retrieve transactions for, or 'all' for all accounts"),
    page: int = Query(1, ge=1,description="The page number for pagination"),
    page_size: int = Query(10, ge=1, description="The number of transactions per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find relevant account_ids
    if account_id == "all":
        # Get all account IDs associated with the current user
        result = await db.execute(
            select(Account.id)
            .join(BankRequisition)
            .where(BankRequisition.user_id == current_user.id)
        )
        account_ids = [row[0] for row in result.all()]
    else:
        result = await db.execute(
            select(Account)
            .options(selectinload(Account.requisition))
            .where(Account.id == account_id)   
        )
        account = result.scalar_one_or_none()
        if not account:
            raise HTTPException(404, detail="Account not found")
        if account.requisition.user_id != current_user.id:
            raise HTTPException(403, detail="You do not have permission to access this account.")
        account_ids = [account.id]

    # Total count for pagination
    count_result = await db.execute(
        select(func.count(Transaction.id))
        .where(Transaction.account_id.in_(account_ids))
    )
    total = count_result.scalar_one_or_none()

    # Paginated transactions
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.account)) # Eager load account to avoid N+1 queries
        .where(Transaction.account_id.in_(account_ids))
        .order_by(Transaction.booking_date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    transactions = result.scalars().all()

    return {
        "transactions": [tx.as_dict() for tx in transactions],
        "total": total,
        "page": page,
        "page_size": page_size,
    }

@router.get("/accounts/{account_id}/summary")
async def get_account_summary(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # check ownership
    result = await db.execute(
        select(Account)
        .options(selectinload(Account.requisition))
        .where(Account.id == account_id)
    )
    account = result.scalar_one_or_none()
    # Early check for account not found and authorization
    if not account:
        raise HTTPException(404, detail="Account not found")  
    if account.requisition.user_id != current_user.id:
        raise HTTPException(403, detail="You do not have permission to access this account.")
    
    # Calculate the summary
    thirty_days_ago = datetime.now() - timedelta(days=30)
    money_out_query = await db.execute(
        select(func.sum(Transaction.amount))
        .where(
            Transaction.account_id == account_id,
            Transaction.booking_date >= thirty_days_ago,
            Transaction.amount < 0
        )
    )
    money_out = money_out_query.scalar() or 0
    money_in_query = await db.execute(
        select(func.sum(Transaction.amount))
        .where(
            Transaction.account_id == account_id,
            Transaction.booking_date >= thirty_days_ago,
            Transaction.amount > 0
        )
    )
    money_in = money_in_query.scalar() or 0

    return {
        "account_id": account_id,
        "money_out": float(money_out),
        "money_in": abs(float(money_in)), # absolute value for money in
        "currency": account.currency,
    }
