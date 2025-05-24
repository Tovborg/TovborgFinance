import httpx
import os
from dotenv import load_dotenv
import asyncio
import uuid
import logging

logger = logging.getLogger("openbanking.service")
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
        logger.info("Authenticating with GoCardless Open Banking API...")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/token/new/",
                    data={"secret_id": self.secret_id, "secret_key": self.secret_key}
                )
                response.raise_for_status()
                self.token = response.json()["access"]
                logger.debug("Access token retrieved successfully.")
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error during authentication: %s - %s",
                e.response.status_code,
                e.response.text
            )
            raise
        except httpx.RequestError as e:
            logger.error("Network error during authentication: %s", e)
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred during authentication: %s", e)
            raise

    async def get_banks(self, country_code="DK"):
        if not self.token:
            logger.debug("No access token found, authenticating...")
            await self.authenticate()
        # Set timeout for requests to avoid timeouts
        timeout = httpx.Timeout(10.0, connect=5.0)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(
                f"{self.base_url}/institutions/?country={country_code}",
                headers={"Authorization": f"Bearer {self.token}"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(
            "HTTP error while fetching banks: %s - %s",
            e.response.status_code,
            e.response.text)
            raise
        except httpx.RequestError as e:
            logger.error("Network error while fetching banks: %s", e)
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred while fetching banks: %s", e)
            raise
    
    async def create_requisition(self, institution_id: str, redirect_url: str, reference: str = None, agreement: str = None):
        # Authenticate if token is not set
        if not self.token:
            logger.debug("No access token found, authenticating...")
            await self.authenticate()
        
        # Create payload
        payload = {
            "institution_id": institution_id,
            "redirect": redirect_url,
        }

        # Reference for internal use
        if reference is None:
            logger.info("No reference provided, generating a new one.")
            reference = str(uuid.uuid4())
        else:
            logger.info("Using provided reference: %s", reference)


        payload["reference"] = reference
        # Optional agreement
        # if agreement:
        #     payload["agreement"] = agreement

        # Make request
        logger.info(f"Creating requisition with institution_id: {institution_id} for reference: {reference}")
        try:
            logger.info("Creating requisition with payload: %s", payload)
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
                logger.info("Requisition created successfully with ID: %s", data.get("id"))
                return data  # Includes link, id etc.
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error while creating requisition: %s - %s",
                e.response.status_code,
                e.response.text
            )
            raise
        except httpx.RequestError as e:
            logger.error("Network error while creating requisition: %s", e)
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred while creating requisition: %s", e)
            raise
        
    async def list_accounts(self, requisition_id: str):
        if not self.token:
            logger.debug("No access token found, authenticating...")
            await self.authenticate()
        logger.info("Listing accounts for requisition ID: %s", requisition_id)
        try:
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
                    logger.warning("No accounts found for the given requisition ID.")
                    return []
                logger.info("Accounts retrieved successfully for requisition ID: %s", requisition_id)
                return data
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error while creating requisition: %s - %s",
                e.response.status_code,
                e.response.text
            )
            raise
        except httpx.RequestError as e:
            logger.error("Network error while creating requisition: %s", e)
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred while creating requisition: %s", e)
            raise
    
    # Functions for getting account details: transactions, balances etc.
    async def get_account_metadata(self, account_number: str):
        if not self.token:
            logger.debug("No access token found, authenticating...")
            await self.authenticate()
        logger.info("Getting metadata for account number: %s", account_number)
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/accounts/{account_number}/",
                    headers={
                        "Authorization": f"Bearer {self.token}",
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                data = response.json()
                logger.info("Metadata retrieved successfully for account number: %s", account_number) 
                return data
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error fetching account metadata: %s - %s",
                e.response.status_code,
                e.response.text
            )
            raise
        except httpx.RequestError as e:
            logger.error("Network error while fetching account metadata: %s", e)
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred while fetching account metadata: %s", e)
            raise
    
    async def get_account_balance(self, account_number: str):
        if not self.token:
            logger.debug("No access token found, authenticating...")
            await self.authenticate()
        logger.info("Getting balance for account number: %s", account_number)
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/accounts/{account_number}/balances/",
                    headers={
                        "Authorization": f"Bearer {self.token}",
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                data = response.json()
                logger.info("Account details fetched successfully for account: %s", account_number)

                return data
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error fetching account balance: %s - %s",
                e.response.status_code,
                e.response.text
            )
            raise
        except httpx.RequestError as e:
            logger.error("Network error while fetching account balance: %s", e)
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred while fetching account balance: %s", e)
            raise
        
    async def get_account_details(self, account_number: str):
        if not self.token:
            logger.debug("No access token found, authenticating...")
            await self.authenticate()
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/accounts/{account_number}/details/",
                    headers={
                        "Authorization": f"Bearer {self.token}",
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                data = response.json()
                logger.info("Account details fetched successfully for account: %s", account_number)
                return data
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error fetching account details: %s - %s",
                e.response.status_code,
                e.response.text
            )
            raise
        except httpx.RequestError as e:
            logger.error("Network error while fetching account details: %s", e)
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred while fetching account details: %s", e)
            raise
    
    async def get_account_transactions(self, account_number: str):
        if not self.token:
            logger.debug("No access token found, authenticating...")
            await self.authenticate()
        logger.info("Getting transactions for account number: %s", account_number)
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/accounts/{account_number}/transactions/",
                    headers={
                        "Authorization": f"Bearer {self.token}",
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                logger.info("Transactions fetched successfully for account: %s", account_number)
                return data
        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error while fetching transactions: %s - %s",
                e.response.status_code,
                e.response.text
            )
            
            raise
        except httpx.RequestError as e:
            logger.error("Network error while fetching transactions: %s", e)
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred while fetching transactions: %s", e)
            raise
        
    

# #Example usage
# async def main():
#     load_dotenv()
#     GOCARDLESS_SECRET_ID = os.getenv("GOCARDLESS_SECRET_ID")
#     GOCARDLESS_SECRET_NAME = os.getenv("GOCARDLESS_SECRET_NAME")
#     GOCARDLESS_SECRET_KEY = os.getenv("GOCARDLESS_SECRET_KEY")
#     service = OpenBankingService(secret_id=GOCARDLESS_SECRET_ID, secret_name=GOCARDLESS_SECRET_NAME, secret_key=GOCARDLESS_SECRET_KEY)
#     await service.authenticate()
#     account_data = await service.get_banks()
#     print(account_data)

# if __name__ == "__main__":
#     asyncio.run(main())