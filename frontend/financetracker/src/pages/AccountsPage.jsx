import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FaPlus } from "react-icons/fa";


export default function AccountsPage() {
    const { user, isLoading, jwt } = useAuth();
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/" />;
    }
    const [activeTab, setActiveTab] = useState("accounts");
    // Check if the user is authenticated
    const [bankAccounts, setBankAccounts] = useState([]);
    const [globalBalance, setGlobalBalance] = useState(0);
    const tabs = [
        { id: "accounts", label: "All Accounts" },
        { id: "linked", label: "OpenBanking" },
        { id: "rules", label: "Manual" },
    ];
    // Mock data
    // IMPORTANT: This data should be fetched from the backend
    useEffect(() => {
        console.log("Fetching accounts data...");
        const fetchAccounts = async () => {
            const res = await fetch("http://127.0.0.1:8000/accounts", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                }
            });
            if (!res.ok) throw new Error("Failed to fetch account info");
            const data = await res.json();
            setBankAccounts(data.accounts);  // Assuming the response is an array of account objects
            console.log("Accounts data fetched:", data);
            // Filter + sum DKK balances
            const dkkTotal = data.accounts
                .filter(account => account.currency === "DKK")
                .reduce((sum, account) => sum + Number(account.balance || 0), 0);

            setGlobalBalance(dkkTotal);
        };
        if (jwt && user) {
            fetchAccounts();
        }
    }, [jwt, user]);
    const accounts = [
        { name: "checking xxx4897", balance: "$9,543.12" },
        { name: "checking xxx4869", balance: "$1,211.67" },
        { name: "saving xxx6729", balance: "$4,634.43" },
    ];

    return (
        <div className="min-h-screen text-white bg-gray-900">
            <Navbar />
            <main className="px-4 py-8 mx-auto mt-5 max-w-7xl">
                <h1 className="mb-2 text-3xl font-medium">Accounts</h1>
                {/* Tab Navigation */}
                <div className="mt-10 mb-8">
                    <nav className="flex flex-wrap gap-4 text-sm font-medium border-b border-gray-700 sm:gap-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-2 transition ${activeTab === tab.id
                                    ? "text-indigo-400 border-b-2 border-indigo-500"
                                    : "text-gray-400 hover:text-gray-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-10">
                    <p className="text-gray-400">Global Balance</p>
                    <h2 className="text-4xl font-semibold text-gray-300">DKK {globalBalance}</h2>
                </div>
                {/* Accounts Table */}
                <div className="mt-8">
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-400 border-b border-gray-700">
                            <tr>
                                <th className="py-3 font-normal">Account</th>
                                <th className="py-3 font-normal">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {bankAccounts.map((account, i) => (
                                <tr key={i} className="transition hover:bg-gray-800">
                                    <td className="flex items-center gap-4 py-4 font-medium text-gray-200">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full">
                                            {/* Placeholder icon */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                className="w-4 h-4 text-gray-400"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2s-3 1.343-3 3 1.343 3 3 3zM19 22H5a2 2 0 01-2-2v-2a4 4 0 014-4h10a4 4 0 014 4v2a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="block sm:hidden">
                                            {account.name.length > 12 ? account.name.slice(0, 12) + "..." : account.name}
                                        </span>
                                        <span className="hidden sm:block">
                                            {account.name}
                                        </span>
                                    </td>
                                    <td className="py-4 font-medium text-gray-100">{account.currency} {account.balance}</td>
                                </tr>
                            ))}
                            <tr className="transition hover:bg-gray-800">
                                <td colSpan="2">
                                    <button onClick={() => window.location.href = "/select-bank"} className="flex items-center gap-2 py-4 text-sm text-gray-400 transition hover:text-indigo-400">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full">
                                            <FaPlus className="text-sm text-gray-400" />
                                        </div>
                                        Add an account
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}