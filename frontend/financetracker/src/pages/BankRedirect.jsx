import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function BankRedirect() {
    const { user, isLoading, jwt } = useAuth()
    // Check if the user is authenticated
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>
    }
    if (!user) {
        return <Navigate to="/" />
    }
    const { institutionId } = useParams();
    const navigate = useNavigate();
    const [bankName, setBankName] = useState('Din Bank');

    useEffect(() => {
        const createRequisition = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/create_requisition", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwt}` 
                    },
                    body: JSON.stringify({
                        institution_id: institutionId,
                        redirect_url: "http://localhost:5173/process-account-connection",
                    })
                });
                if (!response.ok) throw new Error("Failed to create requisition");
                const data = await response.json();
                // Redirect to GoCardless flow
                window.location.href = data.link;
            } catch (error) {
                console.error("Error creating requisition:", error);
                navigate('/dashboard');  // This should be changed to an appropriate error page when implemented
            }
        };
        createRequisition();
    }, [institutionId, jwt, navigate])
    
    
    
    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4'>
            <Loader />
            <h1 className='text-xl font-semibold mt-6 text-center'>
                {bankName} er ved at blive tilføjet til din konto.
            </h1>
            <p className='mt-2 text-sm text-gray-400'>Du bliver automatisk sendt videre</p>
        </div>
    )
}