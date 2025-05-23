import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data = [], interval, setInterval }) {

    return (
        <div className='bg-gray-800 rounded-xl p-6 shadow-md w-full'>
            <div className="grid gap-4 sm:grid-cols-2 sm:items-center mb-7">
                <div>
                    <h2 className="text-lg font-semibold text-white">Revenue and Expenses</h2>
                    <p className="text-sm text-gray-400">Graph overview over your money</p>
                </div>
                <div className="flex justify-start sm:justify-end gap-2">
                    {["daily", "weekly", "monthly", "yearly"].map((opt) => (
                        <button
                            key={opt}
                            className={`text-xs px-3 py-1 rounded ${interval === opt ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                            onClick={() => setInterval(opt)}
                        >
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="date" stroke="#888888" />
                        <YAxis stroke="#888888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />


                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}