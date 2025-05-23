from fastapi import APIRouter, Depends, Query, HTTPException
from app.db.database import get_db
from app.db.models import User, Account, Transaction, BankRequisition
from dotenv import load_dotenv
from app.dependencies import get_current_user
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import func, case
from typing import Literal
from datetime import datetime, timedelta, timezone
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


@router.get("/revenue_chart_data", summary="Get revenue chart data")
async def get_revenue_chart_data(
    interval: Literal["daily", "weekly", "monthly", "yearly"] = Query("weekly"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get revenue chart data for the current user.
    This is for the dashboard page.
    """
    # Hent alle brugerens account_ids
    result = await db.execute(
        select(Account.id)
        .join(BankRequisition)
        .where(BankRequisition.user_id == current_user.id)
    )
    account_ids = [row[0] for row in result.all()]
    if not account_ids:
        raise HTTPException(404, detail="No accounts found for the current user.")

    # Brug naive datetimes (uden timezone)
    now = datetime.utcnow()  # i stedet for datetime.now(timezone.utc)
    
    if interval == "daily":
        start_date = now - timedelta(days=7)
        trunc_func = func.date_trunc('day', Transaction.booking_date)
    elif interval == "weekly":
        start_date = now - timedelta(weeks=6)
        trunc_func = func.date_trunc("week", Transaction.booking_date)
    elif interval == "monthly":
        start_date = now - timedelta(days=30 * 6)
        trunc_func = func.date_trunc("month", Transaction.booking_date)
    elif interval == "yearly":
        start_date = now - timedelta(days=365 * 5)
        trunc_func = func.date_trunc("year", Transaction.booking_date)
    else:
        raise HTTPException(400, detail="Invalid interval")

    # Byg query
    stmt = (
        select(
            trunc_func.label("period"),
            func.sum(
                case((Transaction.amount > 0, Transaction.amount), else_=0)
            ).label("income"),
            func.sum(
                case((Transaction.amount < 0, Transaction.amount), else_=0)
            ).label("expenses"),
        )
        .where(
            Transaction.account_id.in_(account_ids),
            Transaction.booking_date >= start_date
        )
        .group_by("period")
        .order_by("period")
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "date": period.strftime("%d %b" if interval != "yearly" else "%Y"),
            "income": float(income),
            "expenses": abs(float(expenses)),
        }
        for period, income, expenses in rows
    ]

@router.get("/top_transactions", summary="Get top 3 income and top 3 expenses for the current")
async def top_transactions(
    account_id: str = Query(..., description="The ID of the account to retrieve transactions for"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Confirm ownership of the account
    result = await db.execute(
        select(Account)
        .join(BankRequisition)
        .where(Account.id == account_id, BankRequisition.user_id == current_user.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(404, detail="Account not found or does not belong to the current user.")
    
    # Calculate first day of the current month
    today = datetime.utcnow()
    first_day_of_month = today.replace(day=1)

    # Get top 3 income transactions
    income_stmt = (
        select(Transaction)
        .where(
            Transaction.account_id == account_id,
            Transaction.booking_date >= first_day_of_month,
            Transaction.amount > 0
        )
        .order_by(Transaction.amount.desc()
        ).limit(3)
    )
    top_income = (await db.execute(income_stmt)).scalars().all()
    
    # Get top 3 expense transactions
    expense_stmt = (
        select(Transaction)
        .where(
            Transaction.account_id == account_id,
            Transaction.booking_date >= first_day_of_month,
            Transaction.amount < 0
        )
        .order_by(Transaction.amount.asc()  # Most negative = highest expense
        ).limit(3)
    )
    top_expenses = (await db.execute(expense_stmt)).scalars().all()

    return {
        "income": [tx.as_dict() for tx in top_income],
        "expenses": [tx.as_dict() for tx in top_expenses],
        "account_id": account_id,
    }
