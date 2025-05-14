import httpx
import os
from dotenv import load_dotenv
import asyncio
import uuid
load_dotenv()

class OpenBankingService:
    def __init__(self, secret_id=None, secret_name=None, secret_key=None):
        self.base_url = "https://bankaccountdata.gocardless.com/api/v2"
        self.secret_id = secret_id
        self.secret_name = secret_name
        self.secret_key = secret_key
        self.token = None
    
    async def authenticate(self):
        if not self.secret_id or not self.secret_key or not self.secret_name:
            raise ValueError("Secret ID, Secret Name and Secret Key must be set.")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/token/new/",
                data={"secret_id": self.secret_id, "secret_key": self.secret_key}
            )
            print(response)
            response.raise_for_status()
            self.token = response.json()["access"]
            print("Access token:", self.token)
    
    async def get_banks(self, country_code="DK"):
        if not self.token:
            await self.authenticate()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
            f"{self.base_url}/institutions/?country={country_code}",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        response.raise_for_status()
        banks = response.json()
        print(banks)
        return banks
    
    async def create_requisition(self, institution_id: str, redirect_url: str, reference: str = None, agreement: str = None):
        # Authenticate if token is not set
        if not self.token:
            await self.authenticate()
        
        # Create payload
        payload = {
            "institution_id": institution_id,
            "redirect": redirect_url,
        }

        # Reference for internal use
        if reference is None:
            reference = str(uuid.uuid4())
        payload["reference"] = reference
        # Optional agreement
        if agreement:
            payload["agreement"] = agreement

        # Make request
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/requisitions/",
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            response.raise_for_status() # Raise an error for bad responses
            data = response.json()
            print("Requisition created:", data)
            return data  # Includes link, id etc.
        
    async def list_accounts(self, requisition_id: str):
        if not self.token:
            await self.authenticate()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/requisitions/{requisition_id}/",
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            data = response.json()
            # Check if accounts exists
            if len(data["accounts"]) == 0:
                print("No accounts found for this requisition.")
                return []
            return data
    
    # Functions for getting account details: transactions, balances etc.
    async def get_account_metadata(self, account_id: str):
        if not self.token:
            await self.authenticate()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/accounts/{account_id}/",
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            data = response.json()
            return data
    
    async def get_account_balance(self, account_id: str):
        if not self.token:
            await self.authenticate()
    
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/accounts/{account_id}/balances/",
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            data = response.json()
            return data
        
    async def get_account_details(self, account_id: str):
        if not self.token:
            await self.authenticate()
    
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/accounts/{account_id}/details/",
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            data = response.json()
            return data
    
    async def get_account_transactions(self, account_id: str):
        if not self.token:
            await self.authenticate()
    
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/accounts/{account_id}/transactions/",
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
            )
            response.raise_for_status()
            data = response.json()
            return data
        
    

# Example usage
# async def main():
#     service = OpenBankingService()
#     await service.authenticate()
#     account_data = await service.create_requisition(institution_id="LAN_AND_SPAR_BANK_AS_LOSADKKK", redirect_url="http://localhost:5173/dashboard")
#     print(account_data)

# if __name__ == "__main__":
#     asyncio.run(main())