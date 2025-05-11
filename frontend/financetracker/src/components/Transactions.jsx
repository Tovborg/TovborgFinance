const transactions = [
    {
        product: "Iphone 15 PRO Max",
        vendor: "Apple Inc.",
        price: "$899",
        due: "30 Mar 2025",
        status: "Pending",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/mac-os.png"
    },
    {
        product: "Nitro Basic for 12 months",
        vendor: "Discord Inc.",
        price: "$99",
        due: "27 Mar 2025",
        status: "Completed",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/discord-logo.png"
    },
    {
        product: "Figma PRO yearly plan",
        vendor: "Figma Inc.",
        price: "$199",
        due: "10 Mar 2025",
        status: "Completed",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/figma.png"
    },
    {
        product: "Spotify Platinum",
        vendor: "Spotify Inc.",
        price: "$29",
        due: "05 Mar 2025",
        status: "Failed",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/spotify--v1.png"
    },
    {
        product: "iMac 27 Inch",
        vendor: "Apple Inc.",
        price: "$1899",
        due: "01 Feb 2025",
        status: "Completed",
        icon: "https://img.icons8.com/ios-filled/50/ffffff/mac-os.png"
    }
];

const statusColors = {
    Pending: "bg-yellow-600",
    Completed: "bg-green-600",
    Failed: "bg-red-600"
};

export default function Transactions() {
    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-md w-full overflow-x-auto">
            <h2 className="text-lg font-semibold text-white">Transactions</h2>
            <p className="text-sm text-gray-400 mb-4">
                View your transactions, gaining a comprehensive overview of all financial activities within your account.
            </p>

            {/* Table */}
            <table className="w-full table-auto border-separate border-spacing-y-2">
                <thead className="text-left text-gray-400 text-sm hidden sm:table-header-group">
                    <tr>
                        <th className="px-2">Product</th>
                        <th className="px-2">Price</th>
                        <th className="px-2">Due Date</th>
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
                            <td className="px-2 py-1 hidden sm:table-cell">
                                <span className={`text-xs text-white px-2 py-1 rounded ${statusColors[tx.status]}`}>
                                    {tx.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4">
                <button className="text-sm px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
                    View all transactions →
                </button>
            </div>
        </div>
    )
}