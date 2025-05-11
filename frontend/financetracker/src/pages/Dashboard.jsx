import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { FaWallet, FaArrowDown, FaChartLine, FaPiggyBank } from "react-icons/fa"
import RevenueChart from "../components/RevenueChart"
import SavingsGoalCard from "../components/SavingsGoalCard"
import BankAccounts from "../components/BankAccounts"

export default function Dashboard() {
    const { user } = useAuth()
    // Check if the user is authenticated
    if (!user) {
        return <Navigate to="/" />
    }
    
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-300 mb-6">Welcome back, {user.name}</p>
                {/* Top overview cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-700 text-indigo-400">
                            <FaWallet size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Balance</p>
                            <p>$857,967</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-700 text-indigo-400">
                            <FaArrowDown size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Expenses</p>
                            <p>-$7,533</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-700 text-indigo-400">
                            <FaPiggyBank size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Investment funds</p>
                            <p>$857,967</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-700 text-indigo-400">
                            <FaChartLine size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Savings</p>
                            <p className="text-lg font-medium text-white">$20,449</p>
                        </div>
                    </div>
                </section>
                {/* Revenue and Expenses Chart */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                        <RevenueChart />
                    </div>
                </section>
                {/* Savings goals section */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-4">
                    <SavingsGoalCard
                        title="New house savings"
                        amount="$103,256"
                        change={7}
                        isPositive={true}
                        progress={85}
                    />
                    <SavingsGoalCard
                        title="Wedding savings"
                        amount="$32,131"
                        change={5.4}
                        isPositive={false}
                        progress={38}
                    />
                    <SavingsGoalCard
                        title="Vacation savings"
                        amount="$12,657"
                        change={1.8}
                        isPositive={true}
                        progress={22}
                    />
                    <SavingsGoalCard
                        title="New car savings"
                        amount="$50,000"
                        change={90}
                        isPositive={false}
                        progress={100}
                    />
                </section>
                {/* Bank Accounts Section */}
                <section className="mt-6">
                    <BankAccounts />
                </section>
            </main>
        </div>
    )
}