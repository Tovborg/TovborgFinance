import Navbar from "../components/Navbar";
import TransactionsTable from "../components/AllTransactions";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { FaPlus, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { Navigate } from "react-router-dom";

const statusColors = {
    Pending: "bg-yellow-600",
    Completed: "bg-green-600",
    Failed: "bg-red-600"
};

export default function TransactionsPage() {
    const { user, isLoading, jwt } = useAuth();
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const currencyMap = {
        "USD": "$",
        "EUR": "€",
        "DKK": "kr",
        "GBP": "£",
        "SEK": "kr",
        "NOK": "kr",
    };
    const statusColors = {
        pending: "bg-yellow-600",
        booked: "bg-green-700",
        failed: "bg-red-600" // hvis du bruger en status som dette
    };
    // Fetch transactions from the API
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/transactions?account_id=all&page=${page}&page_size=${pageSize}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`,
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch transactions");
                const data = await res.json();
                setTransactions(data.transactions);
                setTotal(data.total);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };
        if (jwt) fetchTransactions();
    }, [page, jwt, pageSize])
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Top overskrift og pagination */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h1 className="text-3xl font-medium">Transactions</h1>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                            {total === 0
                                ? "0–0 of 0"
                                : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                            >
                                <FaChevronLeft size={12} />
                            </button>
                            <button
                                className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50"
                                onClick={() => setPage((prev) =>
                                    page * pageSize < total ? prev + 1 : prev
                                )}
                                disabled={page * pageSize >= total}
                            >
                                <FaChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Filters og export knap */}
                <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-gray-400 mb-6">
                    <div className="hidden sm:flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-4.586L3.293 6.707A1 1 0 013 6V4z" />
                            </svg>
                            Add Filter
                        </button>
                        <span>No filters applied</span>
                    </div>
                    {/* Højre: Export All */}
                    <div className="ml-auto">
                        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                            </svg>
                            Export All
                        </button>
                    </div>
                </div>
                {/* Transactions Table */}
                <section className="mt-3">
                    <div className="bg-gray-900 rounded-xl p-6 w-full overflow-x-auto">


                        {/* Table */}
                        <table className="w-full table-auto border-separate border-spacing-y-2">
                            <thead className="text-left text-gray-400 text-sm hidden sm:table-header-group">
                                <tr>
                                    <th className="px-2">Description</th>
                                    <th className="px-2">Account</th>
                                    <th className="px-2">Amount</th>
                                    <th className="px-2">Creditor</th>
                                    <th className="px-2">Date</th>
                                    <th className="px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, index) => (
                                    <tr key={index} className="flex flex-col sm:table-row bg-gray-700 sm:bg-transparent rounded-lg sm:rounded-none p-3 sm:p-0 mb-2 sm:mb-0">
                                        <td className="text-sm font-semibold text-gray-300 px-2 py-1">
                                            {tx.remittance_information || tx.description || "No description"}
                                        </td>
                                        <td className="text-sm font-semibold text-gray-300 px-2 py-1">
                                            {tx.account_name || "Unknown"}
                                        </td>
                                        <td className="text-sm font-semibold text-white px-2 py-1">
                                            {tx.amount} {currencyMap[tx.currency] || tx.currency}
                                        </td>
                                        <td className="text-sm font-semibold text-gray-300 px-2 py-1">
                                            {tx.creditor_name || "Unknown"}
                                        </td>
                                        <td className="text-sm text-gray-400 font-semibold px-2 py-1">
                                            {new Date(tx.booking_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-2 py-1">
                                            <span className={`text-xs text-white px-2 py-1 rounded ${statusColors[tx.status?.toLowerCase()] || "bg-gray-500"}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end items-center gap-4 text-sm text-gray-400 mt-3">
                        <span>
                            {total === 0
                                ? "0–0 of 0"
                                : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                            >
                                <FaChevronLeft size={12} />
                            </button>
                            <button
                                className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50"
                                onClick={() => setPage((prev) =>
                                    page * pageSize < total ? prev + 1 : prev
                                )}
                                disabled={page * pageSize >= total}
                            >
                                <FaChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}