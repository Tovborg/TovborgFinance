import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

export default function OpenBankingSuccess() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            navigate('/dashboard');
        }, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [navigate]);

    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4'>
            <FaCheckCircle className="text-green-500 text-6xl mb-2" />
            <h1 className='text-xl font-semibold text-center mt-2'>Open Banking Success</h1>
            <p className='mt-2 text-sm text-gray-400'>
                Du bliver automatisk sendt videre om {countdown} sekunder...
            </p>
        </div>
    );
}