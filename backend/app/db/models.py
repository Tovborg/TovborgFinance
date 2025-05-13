from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
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

# Bank Account
class Account(Base):
    __tablename__ = "accounts"
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    institution_id = Column(String, nullable=False) # e.g. "nordea-dk"
    account_id = Column(String,unique=True, nullable=False) # GoCardless account id
    name = Column(String, nullable=False) # e.g. "Nordea Bank"
    iban = Column(String, nullable=True)
    currency = Column(String, nullable=False) # e.g. "DKK"
    created_at = Column(String, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

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