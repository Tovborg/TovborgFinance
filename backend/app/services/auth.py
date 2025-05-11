import httpx
from fastapi import HTTPException, status  

async def verify_google_token(token: str):
    """
    Verify the google token using Google API.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")
    return response.json()  # Includes email, name, picture and sub
