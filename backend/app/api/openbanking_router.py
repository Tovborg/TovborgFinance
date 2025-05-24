from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from dotenv import load_dotenv
import os
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User, BankRequisition, Account, Transaction
from app.services.openbanking import OpenBankingService
from app.services.save_transactions import save_transactions
from app.dependencies import get_current_user
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel
from sqlalchemy.orm import selectinload
import logging

# Load environment variables
load_dotenv()  # Should be changed for production to use a more secure method of handling secrets

# configure logging
logger = logging.getLogger(__name__)  # Set up a logger for this module
# Set to log everything at INFO level and above
logger.setLevel(logging.INFO)

# Deactivate SQLAlchemy's echo feature to avoid logging SQL queries
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

GOCARDLESS_SECRET_ID = os.getenv("GOCARDLESS_SECRET_ID")
GOCARDLESS_SECRET_NAME = os.getenv("GOCARDLESS_SECRET_NAME")
GOCARDLESS_SECRET_KEY = os.getenv("GOCARDLESS_SECRET_KEY")

# Initialize FastAPI router
router = APIRouter()

@router.get("/get_banks", summary="Get a list of available danish banks")
async def get_banks():
    try:
        logger.info("Attempting to fetch list og Danish banks from GoCardless")
        service = OpenBankingService(
            secret_id=os.getenv("GOCARDLESS_SECRET_ID"),
            secret_name=os.getenv("GOCARDLESS_SECRET_NAME"),
            secret_key=os.getenv("GOCARDLESS_SECRET_KEY"),
        )
        banks = await service.get_banks(country_code="DK")
        return {"banks": banks}
    except Exception as e:
        logger.error("Error while fetching banks: %s", e)
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
        logger.info("Attempting to create a new requisition for institution_id: %s", payload.institution_id)
        requisition = await service.create_requisition(
            institution_id=payload.institution_id,
            redirect_url=payload.redirect_url
        )
        logger.info("Requisition created successfully with ID: %s", requisition["id"])
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
        logger.info("Saving new requisition to the database")

        db.add(new_requisition)
        await db.commit()
        await db.refresh(new_requisition)

        return {"link": new_requisition.link, "institution_id": payload.institution_id}
    except Exception as e:
        logger.error("Error while creating requisition: %s", e)
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
    logger.info("Processing requisition with reference: %s", payload.ref)
    result = await db.execute(
        select(BankRequisition).where(BankRequisition.reference == payload.ref)
    )
    requisition = result.scalar_one_or_none()  # return one or none
    if not requisition:
        logger.warning("Requisition not found for reference: %s", payload.ref)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requisition not found"
        )
    # Ensure the request user is the owner of the requisition
    if requisition.user_id != user.id:
        logger.warning("User %s does not have permission to access requisition %s", user.id, requisition.id)
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
        if not accounts or "accounts" not in accounts:
            logger.warning("No accounts found for requisition %s", requisition.id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No accounts found for this requisition"
            )
        logger.info("Accounts fetched successfully for requisition %s", requisition.id)
        account_nos = accounts["accounts"]  # List of account numbers used to call the API
        logger.info("Account numbers to process: %s", account_nos)
        created_new = False  # Flag to check if new accounts were created
        account_infos = []  # List to store the details from get_account_details
        for account in account_nos:
            logger.info("Processing account number: %s", account)
            account_info = await service.get_account_details(account_number=account)
            account_balance = await service.get_account_balance(account_number=account)
            if not account_info or "account" not in account_info:
                logger.warning("No account details found for account number: %s", account)
                continue
            if not account_balance or "balances" not in account_balance:
                logger.warning("No account balance found for account number: %s", account)
                continue
            logger.info("Account info and account balance fetched for: %s", account)
            # Extract balance amount from the account balance
            balance_entry = next(
                (b for b in account_balance.get("balances", []) if b["balanceType"] in ["expected", "interimAvailable"]),
                None
            )
            balance_amount = balance_entry["balanceAmount"]["amount"] if balance_entry else None

            acc_data = account_info["account"]

            # Check if the account already exists in the database
            result = await db.execute(
                select(Account)
                .options(selectinload(Account.requisition))
                .where(Account.account_id==acc_data["resourceId"])
            )
            existing_account = result.scalar_one_or_none()
            # Check if the account exists and belongs to another user, if so block the connection
            if existing_account and existing_account.requisition.user_id != user.id:
                logger.warning("Account %s is already connected to another user", acc_data["resourceId"])
                raise HTTPException(
                    status_code=403,
                    detail="This account is already connected to another user"
                )
            if existing_account:
                logger.info("Updating existing account with ID: %s", existing_account.id)
                # Update existing account
                existing_account.name = acc_data.get("name", "Ukendt konto")
                existing_account.iban = acc_data.get("iban")
                existing_account.currency = acc_data.get("currency", "DKK")
                existing_account.requisition_id = requisition.id
            else:
                logger.info("Creating new account with ID: %s", acc_data["resourceId"])
                created_new = True  # Set flag to indicate a new account was created
                # Create new account
                new_account = Account(
                    account_id=acc_data["resourceId"],
                    account_number=account,
                    name=acc_data.get("name", "Ukendt konto"),
                    balance=balance_amount,
                    balance_updated_at=datetime.now(timezone.utc),
                    iban=acc_data.get("iban"),
                    currency=acc_data.get("currency", "DKK"),
                    requisition_id=requisition.id
                )
                db.add(new_account)
                logger.info("New account added to the database with ID: %s", new_account.id)
            
            account_infos.append({
                "account_id": acc_data["resourceId"],
                "account_number": account,
                "name": acc_data.get("name", "Ukendt konto"),
                "iban": acc_data.get("iban"),
                "currency": acc_data.get("currency", "DKK"),
            })
            
        # Commit the changes to the database
        logger.info("Committing changes to the database")
        await db.commit()
        
        return {"message": "Accounts processed successfully", "accounts": account_infos, "created_new": created_new}
    except HTTPException as e:
        # Handle HTTP exceptions separately
        logger.error("HTTP error while processing requisition: %s", e.detail)
        raise e
    except Exception as e:
        logger.warning("General error while processing requisition: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch accounts"
        )
    
# Fetch transactions and upload to database based on account_id
class TransactionsRequest(BaseModel):
    account_id: str
    reference: str

@router.post("/fetch_transactions", summary="Fetch transactions for a specific account")
async def fetch_transactions(
    payload: TransactionsRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Find requisition based on reference
    account_result = await db.execute(
        select(BankRequisition).where(BankRequisition.reference == payload.reference)
    )
    requisition = account_result.scalar_one_or_none()  # Requisition linked to the account
    if not requisition:
        logger.warning("Requisition not found for reference: %s", payload.reference)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requisition not found"
        )
    logger.info("Requisition found for reference: %s", payload.reference)
    # Ensure the request user is the owner of the requisition
    if requisition.user_id != user.id:
        logger.warning("User %s does not have permission to access requisition %s", user.id, requisition.id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this requisition"
        )
    # Find account based on account_id and requisition_id
    result = await db.execute(
        select(Account).where(
            Account.account_id == payload.account_id,
            Account.requisition_id == requisition.id
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        logger.warning("Account not found for account_id: %s", payload.account_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    logger.info("Account found for account_id: %s", payload.account_id)
    # Fetch transactions using the OpenBankingService
    try:
        logger.info("Initializing OpenBankingService to fetch transactions for account: %s", account.account_number)
        service = OpenBankingService(
            secret_id=os.getenv("GOCARDLESS_SECRET_ID"),
            secret_name=os.getenv("GOCARDLESS_SECRET_NAME"),
            secret_key=os.getenv("GOCARDLESS_SECRET_KEY"),
        )
    except Exception as e:
        logger.error("Error initializing OpenBankingService:", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize OpenBankingService"
        )


    try:
        logger.info("Attempting to fetch transactions for: %s", account.account_number)
        transactions_data = await service.get_account_transactions(account_number=account.account_number)  # Use the account_number from the database
    except httpx.HTTPStatusError as e:
        logger.error("HTTP error while fetching transactions", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transactions"
        )    
    if not transactions_data:
        logger.warning("No transactions found for account: %s", account.account_number)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No transactions found for this account"
        )
    logger.info("Transactions fetched successfully for account: %s", account.account_number)
    try:
        logger.info("Saving transactions to the database for account: %s", account.account_number)
        await save_transactions(transactions_data, account.id, db)  # Save transactions to the database
    except Exception as e:
        logger.error("Error while saving transactions: ", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save transactions"
        )
    return {"message": "Transactions fetched successfully", "transactions": transactions_data}
    
    

