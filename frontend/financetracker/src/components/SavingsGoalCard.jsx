export default function SavingsGoalCard({ title, amount, change, isPositive, progress }) {
    return (
        <div className="bg-gray-800 rounded-xl p-4 shadow-md">
            <p className="text-sm text-gray-400">{title}</p>
            <div className="flex items-center justify-between mt-1">
                <p className="text-xl font-semibold text-white">{amount}</p>
                <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : '-'}{Math.abs(change)}%
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last year</p>
            <div className="mt-3 w-full bg-gray-700 h-2 rounded-full">
                <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    )
}