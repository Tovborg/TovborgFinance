from sqlalchemy import Column, Integer, String, ForeignKey
from .database import Base

class Account(Base):
    __tablename__ = 'accounts'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    iban = Column(String, unique=True, nullable=False)
    currency = Column(String, nullable=False, default='DKK')