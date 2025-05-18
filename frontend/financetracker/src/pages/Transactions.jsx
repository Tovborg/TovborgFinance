import Navbar from "../components/Navbar";
import TransactionsTable from "../components/AllTransactions";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { FaPlus, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { Navigate } from "react-router-dom";


const transactions = [

];

const statusColors = {
    Pending: "bg-yellow-600",
    Completed: "bg-green-600",
    Failed: "bg-red-600"
};

export default function TransactionsPage() {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Top overskrift og pagination */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h1 className="text-3xl font-medium">Transactions</h1>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>0–0 of 0</span>
                        <div className="flex items-center gap-2">
                            <button className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300">
                                <FaChevronLeft size={12} />
                            </button>
                            <button className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300">
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
                                    <th className="px-2">Product</th>
                                    <th className="px-2">Price</th>
                                    <th className="px-2">Due Date</th>
                                    <th className="px-2">Account</th>
                                    <th className="px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, index) => (
                                    <tr key={index} className="flex flex-col sm:table-row bg-gray-700 sm:bg-transparent rounded-lg sm:rounded-none p-3 sm:p-0 mb-2 sm:mb-0">
                                        <td className="flex items-center gap-3 px-2 py-2">
                                            <img src={tx.icon} alt="" className="w-6 h-6" />
                                            <div>
                                                <p className="text-white text-sm">{tx.product}</p>
                                                <p className="text-gray-400 text-xs">{tx.vendor}</p>
                                            </div>
                                        </td>
                                        <td className="text-sm text-white px-2 py-1 sm:table-cell">{tx.price}</td>
                                        <td className="text-sm text-gray-300 px-2 py-1 hidden sm:table-cell">{tx.due}</td>
                                        <td className="text-sm text-gray-300 px-2 py-1 hidden sm:table-cell">{tx.account}</td>
                                        <td className="px-2 py-1 hidden sm:table-cell">
                                            <span className={`text-xs text-white px-2 py-1 rounded ${statusColors[tx.status]}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end items-center gap-4 text-sm text-gray-400 mt-3">
                        <span>0–0 of 0</span>
                        <div className="flex items-center gap-2">
                            <button className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300">
                                <FaChevronLeft size={12} />
                            </button>
                            <button className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300">
                                <FaChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}