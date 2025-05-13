const transactions = [
    {
      product: "Iphone 15 PRO Max",
      vendor: "Apple Inc.",
      price: "-$899",
      due: "30 Mar 2025",
      status: "Pending",
      account: "xxx4565494",
      icon: "https://img.icons8.com/ios-filled/50/ffffff/mac-os.png",
    },
    {
      product: "Nitro Basic for 12 months",
      vendor: "Discord Inc.",
      price: "-$99",
      due: "27 Mar 2025",
      status: "Completed",
      account: "xxx4565494",
      icon: "https://img.icons8.com/ios-filled/50/ffffff/discord-logo.png",
    },
    {
      product: "Figma PRO yearly plan",
      vendor: "Figma Inc.",
      price: "-$199",
      due: "10 Mar 2025",
      status: "Completed",
      account: "xxx4565494",
      icon: "https://img.icons8.com/ios-filled/50/ffffff/figma.png",
    },
    {
      product: "Spotify Platinum",
      vendor: "Spotify Inc.",
      price: "-$29",
      due: "05 Mar 2025",
      status: "Failed",
      account: "xxx4565494",
      icon: "https://img.icons8.com/ios-filled/50/ffffff/spotify--v1.png",
    },
    {
      product: "iMac 27 Inch",
      vendor: "Apple Inc.",
      price: "-$1899",
      due: "01 Feb 2025",
      status: "Completed",
      account: "xxx4565494",
      icon: "https://img.icons8.com/ios-filled/50/ffffff/mac-os.png",
    },
  ];
  
  const statusColors = {
    Pending: "bg-yellow-600",
    Completed: "bg-emerald-700",
    Failed: "bg-red-600",
  };
  
  export default function TransactionsTable() {
    return (
      <div className="w-full text-sm text-gray-300">
        {transactions.map((tx, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-800 py-3 hover:bg-gray-800 px-2 rounded transition"
          >
            <div className="flex items-center gap-3">
              <img src={tx.icon} alt="" className="w-6 h-6" />
              <div>
                <p className="text-white font-medium">{tx.product}</p>
                <p className="text-xs text-gray-400">{tx.vendor}</p>
              </div>
            </div>
            <div className="hidden md:block w-32 text-right text-white">{tx.price}</div>
            <div className="hidden lg:block w-40 text-gray-400">{tx.account}</div>
            <div className="hidden lg:block">
              <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColors[tx.status]}`}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }