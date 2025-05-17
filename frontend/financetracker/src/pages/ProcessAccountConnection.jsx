import { useAuth } from "../context/AuthContext";
import Loader from '../components/Loader';
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProcessAccountConnection() {
    const { user, isLoading, jwt } = useAuth();
    // Redirect if the user isn't authenticated
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>
    }
    if (!user) {
        return <Navigate to="/" />
    }
    const [searchParams] = useSearchParams();
    const reference = searchParams.get('ref');
    const navigate = useNavigate();
    
    
    // Call the endpoint when the component mounts
    useEffect(() => {
        const processRequisition = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/process_requisition", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        ref: reference
                    })
                });
                if (!res.ok) throw new Error("Failed to process requisition");
                const data = await res.json();
                console.log("Accounts fetched:", data);
                // Fetch transactions for the accounts async
                const transactionFetches = data.accounts.map(async (account) => {
                    const txRes = await fetch("http://127.0.0.1:8000/fetch_transactions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${jwt}`
                        },
                        body: JSON.stringify({
                            account_id: account.account_id,
                            reference: reference
                        })
                    });
                    if (!txRes.ok) throw new Error(`Failed to fetch transactions for account ${account.account_id}`);
                    const txData = await txRes.json();
                    console.log(`Transactions for account ${account.account_id}:`, txData);
                    return txData;
                });
                // Wait for all transaction fetches to complete
                await Promise.all(transactionFetches);
                console.log("All transactions fetched successfully");
                

                // Redirect to the dashboard or accounts page
                navigate('/dashboard');  // This should be changed to an appropriate page when implemented
            } catch (error) {
                console.error("Error processing requisition:", error);
                navigate('/dashboard');  // This should be changed to an appropriate error page when implemented
            }
        };
        if (reference && jwt) {
            processRequisition();
        }
    }, [reference, jwt, navigate])

    console.log(reference);
    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4'>
            <Loader />
            <h1 className='text-xl font-semibold mt-6 text-center'>
                Vi henter informationer fra din bank.
            </h1>
            <p className='mt-2 text-sm text-gray-400'>Du bliver automatisk sendt videre</p>
        </div>
    )
}