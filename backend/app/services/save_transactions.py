from app.db.models import Transaction
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from decimal import Decimal
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)  # Set up a logger for this module

async def save_transactions(transactions_data: dict, account_db_id: str, db: AsyncSession):
    all_transactions = transactions_data.get("transactions", {})  # Get the transactions
    # Check early for no transactions
    if not all_transactions:
        logger.warning("No transactions found in the provided data.")
        return
    
    created_count = 0  # Counter for created transactions
    updated_count = 0  # Counter for updated transactions

    for tx_type in ["booked", "pending"]:
        for tx in all_transactions.get(tx_type, []):  # Loop through booked and pending transactions
            
            tx_id = tx.get("transactionId")
            logger.debug(f"Processing transaction ID: {tx_id} of type: {tx_type}")
            if not tx_id:
                logger.warning("Transaction ID is missing, skipping this transaction.")
                continue
            # Check if the transaction already exists in the database
            result = await db.execute(
                select(Transaction).where(Transaction.transaction_id == tx_id)
            )
            if result.scalar_one_or_none():
                # For now we skip updating existing transactions
                logger.debug(f"Transaction ID {tx_id} already exists, skipping update.")
                continue  # Skip if transaction already exists
            transactionAmount = tx.get("transactionAmount", {})
            amount = transactionAmount.get("amount", 0)
            currency = transactionAmount.get("currency", "DKK")
            booking_date = datetime.strptime(tx.get("bookingDate", tx.get("valueDate")), "%Y-%m-%d")
            valueDate = datetime.strptime(tx.get("valueDate"), "%Y-%m-%d") if tx.get("valueDate") else None
            creditorName = tx.get("creditorName", "Unknown")
            remittanceInformationUnstructured = tx.get("remittanceInformationUnstructured", "Unknown")
            # If there's no remittance information try remittanceInformationUnstructuredArray
            if remittanceInformationUnstructured == "Unknown":
                remittanceInformationUnstructuredArray = tx.get("remittanceInformationUnstructuredArray", [])
                if remittanceInformationUnstructuredArray:
                    remittanceInformationUnstructured = remittanceInformationUnstructuredArray[0]
                else:
                    remittanceInformationUnstructured = "Unknown"

            bankTransactionCode = tx.get("bankTransactionCode", "Unknown")
            proprietaryBankTransactionCode = tx.get("proprietaryBankTransactionCode", "Unknown")
            logger.info("Saving transaction with ID: %s, Amount: %s, Currency: %s, Booking Date: %s, Value Date: %s",
                        tx_id, amount, currency, booking_date, valueDate)
            # Create a new transaction object
            transaction = Transaction(
                account_id=account_db_id,
                transaction_id=tx_id,
                amount=Decimal(amount),
                currency=currency,
                booking_date=booking_date,
                value_date=valueDate,
                description=tx.get("description", "Unknown"),
                remittance_information=remittanceInformationUnstructured,
                creditor_name=creditorName,
                debtor_name=tx.get("debtorName", "Unknown"),
                transaction_type=tx.get("proprietaryBankTransactionCode", "Unknown"),
                status="booked" if tx_type == "booked" else "pending",
            )

            db.add(transaction)
            created_count += 1
    await db.commit()
    return {"created": created_count, "updated": updated_count}
            

    