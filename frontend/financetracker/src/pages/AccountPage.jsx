import Navbar from "../components/Navbar"
import Transactions from "../components/Transactions";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";


const chartData = [
    { date: "20 Sep", balance: 20 },
    { date: "21 Sep", balance: 8530 },
    { date: "22 Sep", balance: 543 },
    { date: "23 Sep", balance: 8740 },
    { date: "24 Sep", balance: 9543 },
]

const currencyMap = {
    "USD": "$",
    "EUR": "€",
    "DKK": "kr",
    "GBP": "£",
    "SEK": "kr",
    "NOK": "kr",
}

export default function AccountPage() {
    const { user, isLoading, jwt } = useAuth();
    // Check if the user is authenticated
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/" />;
    }
    const { account_id } = useParams();
    const [accountInfo, setAccountInfo] = useState(null);
    const [transactions, setTransactions] = useState([]);
    console.log("Account ID:", account_id);
    // Check if the account_id is valid
    if (!account_id) {
        return <Navigate to="/dashboard" />;
    }
    // Fetch account information from the backend
    useEffect(() => {
        const fetchAccountInfo = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/accounts/${account_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`, // Use the JWT token from the context
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch account info");
                const data = await res.json();
                setAccountInfo(data);
                console.log("Account Info:", data);
            } catch (error) {
                console.error("Error fetching account info:", error);
            }
        };
        if (jwt && account_id) {
            fetchAccountInfo();
        }
    }, [jwt, account_id]);
    // Fetch account transactions from the backend
    // Fetch account transactions from the backend
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/transactions?account_id=${account_id}&page=1&page_size=10`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`,
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch transactions");
                const data = await res.json();
                setTransactions(data.transactions); // data.transactions fordi det er wrapped i nyt format
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };
        if (jwt && account_id) {
            fetchTransactions();
        }
    }, [jwt, account_id]);
    // map currency to symbol
    const currencySymbol = currencyMap[accountInfo?.account?.currency] || accountInfo?.account?.currency;
    console.log("transactions", transactions);
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Top Section Grid */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-[0.4fr_0.6fr]">
                    {/* Welcome card */}
                    <div className="bg-gray-800 rounded-xl p-6 flex flex-col justify-between shadow-md">
                        <div>
                            <p className="text-sm text-indigo-400 uppercase font-medium">Your Account</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                                Welcome Back,<br />{user.name}! 👋
                            </h2>
                            <p className="mt-10 text-md text-gray-400">
                                Everything seems ok and up-to-date with <br /> your account since your last visit.
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-gray-800 rounded-xl p-6 shadow-md">
                        <div className="mb-4 text-center">
                            <p className="text-sm font-medium text-gray-400 mb-2 uppercase">Account balance</p>
                            <h3 className="text-2xl font-semibold">{currencySymbol}{accountInfo?.account?.balance}</h3>
                            <p className="text-sm text-green-400 mt-2">↑ {currencySymbol}149.32 Today, Sep 25</p>
                        </div>
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6b7280" // grå farve (#6b7280 = gray-500)
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                                        labelStyle={{ color: "#9ca3af" }}
                                        formatter={(value) => [`${currencySymbol}${value}`, "Balance"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={{ r: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                {/* Middle Section Grid */}
                {/* Money In / Out Summary */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
                    {/* Money out */}
                    <div className="bg-gray-800 rounded-xl p-6 shadow-md">
                        <p className="text-md font-medium text-gray-400 mb-2 mt-10 uppercase">Money out last 30 days</p>
                        <h3 className="text-3xl mt-5 font-bold text-white">{currencySymbol}0.00</h3>
                        <p className="text-gray-500 mt-7">No outgoing transactions yet</p>
                        <div className="h-1 bg-gray-700 mt-4 rounded" />
                        <div className="flex justify-end mt-4 mb-5">
                            <a href="#" className="text-sm text-indigo-500 hover:underline flex items-center gap-1">
                                View all <span className="text-lg">→</span>
                            </a>
                        </div>
                    </div>
                    {/* Money in */}
                    <div className="bg-gray-800 rounded-xl p-6 shadow-md">
                        <p className="text-md font-medium text-gray-400 mb-2 mt-10 uppercase">Money In last 30 days</p>
                        <h3 className="text-3xl mt-5 font-bold text-white">{currencySymbol}0.00</h3>
                        <p className="text-gray-500 mt-7">No outgoing transactions yet</p>
                        <div className="h-1 bg-gray-700 mt-4 rounded" />
                        <div className="flex justify-end mt-4 mb-5">
                            <a href="#" className="text-sm text-indigo-500 hover:underline flex items-center gap-1">
                                View all <span className="text-lg">→</span>
                            </a>
                        </div>
                    </div>
                </div>
                {/* Transactions Section */}
                <div className="mt-8">
                    <Transactions transactions={transactions} />
                </div>
            </main>
        </div>
    )
}