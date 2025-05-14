import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

export default function BankRedirect() {
    const { institutionId } = useParams();
    const navigate = useNavigate();
    const [bankName, setBankName] = useState('Din Bank');

    // useEffect(() => {

    // })
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