from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Boolean
from .database import Base
from sqlalchemy.orm import relationship
from uuid import uuid4
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    picture = Column(String)
    google_id = Column(String, unique=True)  # sub from Google

    # Create link to bank requisitions
    requisitions = relationship("BankRequisition", back_populates="user", cascade="all, delete-orphan")

# Bank Account
class BankRequisition(Base):
    """
    Model to store the bank requisition data
    Used for storing information about the bank connection that the user has
    """
    __tablename__ = "bank_requisitions"
    id = Column(String, primary_key=True, default =lambda: str(uuid4()))
    requisition_id = Column(String, unique=True, nullable=False)  # GoCardless requisition ID
    created = Column(DateTime, default=datetime.utcnow)
    institution_id = Column(String, nullable=False)  # e.g. "nordea-dk"
    agreement = Column(String, nullable=True)  # GoCardless agreement ID
    referebce = Column(String, nullable=True)  # Reference for internal use
    link = Column(String, nullable=False)  # Link to the bank connection
    status = Column(String)
    account_selection = Column(Boolean, default=False)

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="requisitions")

    accounts = relationship("Account", back_populates="requisition", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    requisition_id = Column(String, ForeignKey("bank_requisitions.id"), nullable=False)
    account_id = Column(String, unique=True, nullable=False)  # GoCardless account ID
    name = Column(String, nullable=False)                     # fx "Nordea lønkonto"
    iban = Column(String, nullable=True)
    currency = Column(String, nullable=False)                 # fx "DKK"
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    requisition = relationship("BankRequisition", back_populates="accounts")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    transaction_id = Column(String, unique=True, nullable=False)  # GoCardless transaction ID
    amount = Column(Numeric, nullable=False)
    currency = Column(String, nullable=False)
    booking_date = Column(DateTime, nullable=False)
    value_date = Column(DateTime, nullable=True)
    description = Column(String, nullable=True)
    remittance_information = Column(String, nullable=True)
    creditor_name = Column(String, nullable=True)
    debtor_name = Column(String, nullable=True)
    transaction_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    account = relationship("Account", back_populates="transactions")