import { useAuth } from "../context/AuthContext";
import Loader from '../components/Loader';

export default function ProcessAccountConnection() {
    const { user, isLoading, jwt } = useAuth();
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>
    }
    if (!user) {
        return <Navigate to="/" />
    }
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