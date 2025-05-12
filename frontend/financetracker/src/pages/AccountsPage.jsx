import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { FaPlus } from "react-icons/fa";


export default function AccountsPage() {
    const { user, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("accounts");
    // Check if the user is authenticated
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/" />;
    }

    const tabs = [
        { id: "accounts", label: "All Accounts" },
        { id: "linked", label: "OpenBanking" },
        { id: "rules", label: "Manual" },
    ];
    // Mock data
    // IMPORTANT: This data should be fetched from the backend
    const accounts = [
        { name: "checking xxx4897", balance: "$9,543.12" },
        { name: "checking xxx4869", balance: "$1,211.67" },
        { name: "saving xxx6729", balance: "$4,634.43" },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 mt-5">
                <h1 className="text-3xl font-medium mb-2">Accounts</h1>
                {/* Tab Navigation */}
                <div className="mb-8 mt-10">
                    <nav className="flex flex-wrap gap-4 sm:gap-6 text-sm font-medium border-b border-gray-700">
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
                    <h2 className="text-4xl text-gray-300 font-semibold">$15,389.22</h2>
                </div>
                {/* Accounts Table */}
                <div className="mt-8">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-700 text-gray-400">
                            <tr>
                                <th className="py-3 font-normal">Account</th>
                                <th className="py-3 font-normal">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {accounts.map((account, i) => (
                                <tr key={i} className="hover:bg-gray-800 transition">
                                    <td className="flex items-center gap-4 py-4 font-medium text-gray-200">
                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
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
                                        {account.name}
                                    </td>
                                    <td className="text-gray-100 py-4">{account.balance}</td>
                                </tr>
                            ))}
                            <tr className="hover:bg-gray-800 transition">
                                <td colSpan="2">
                                    <button className="flex items-center gap-2 text-sm py-4 text-gray-400 hover:text-indigo-400 transition">
                                        <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full">
                                            <FaPlus className="text-gray-400 text-sm" />
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