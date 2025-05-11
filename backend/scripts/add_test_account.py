import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import asyncio
from app.db.database import AsyncSessionLocal
from app.db.models import Account

async def add_test_account():
    async with AsyncSessionLocal() as session:
        test_account = Account(
            name="Test Account",
            iban="DK1234567890123456",
            currency="DKK"
        )
        session.add(test_account)
        await session.commit()
        print("Test account added.")

if __name__ == "__main__":
    asyncio.run(add_test_account())