import { useNavigate } from "react-router-dom";

const statusColors = {
    pending: "bg-yellow-600",
    booked: "bg-green-700",
    failed: "bg-red-600" // hvis du bruger en status som dette
};

export default function Transactions({ transactions = [] }) {
    const navigate = useNavigate();
    const currencyMap = {
        "USD": "$",
        "EUR": "€",
        "DKK": "kr",
        "GBP": "£",
        "SEK": "kr",
        "NOK": "kr",
    }
    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-md w-full overflow-x-auto">
            <h2 className="text-lg font-semibold text-white">Transactions</h2>
            <p className="text-sm text-gray-400 mb-4">
                View your latest transactions and track your spending in real time.
            </p>

            {/* Table */}
            <table className="w-full table-auto border-separate border-spacing-y-2">
                <thead className="text-left text-gray-400 text-sm hidden sm:table-header-group">
                    <tr>
                        <th className="px-2">Description</th>
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
                                <span className={`text-xs text-white px-2 py-1 rounded ${statusColors[tx.status] || "bg-gray-500"}`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4">
                <button
                    onClick={() => navigate("/transactions")}
                    className="text-sm px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                    View all transactions →
                </button>
            </div>
        </div>
    );
}
