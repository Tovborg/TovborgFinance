from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User
from app.services.auth import verify_google_token
from jose import jwt
import os
from dotenv import load_dotenv
from sqlalchemy.future import select
from app.dependencies import get_current_user
load_dotenv()

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
if not JWT_SECRET:
    raise ValueError("JWT_SECRET not set in environment variables")

@router.post("/auth/google")
async def google_login(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    token = authorization.split(" ")[1]
    user_info = await verify_google_token(token)

    # Find or create user in the database
    result = await db.execute(
        select(User).where(User.google_id == user_info["sub"])
    )
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=user_info["email"],
            name=user_info.get("name"),
            picture=user_info.get("picture"),
            google_id=user_info["sub"]
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Create JWT token
    jwt_token = jwt.encode({"user_id": user.id}, JWT_SECRET, algorithm="HS256")
    return {"access_token": jwt_token}

@router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture
    }

