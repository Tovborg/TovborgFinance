from fastapi import Depends, HTTPException, status, Header
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User
from sqlalchemy.future import select
from dotenv import load_dotenv
import os
load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")

async def get_current_user(
        authorization: str = Header(...),
        db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get the current user from the JWT token in the Authorization header
    """
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    
    except (JWTError, IndexError):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
        